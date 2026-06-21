import mongoose from 'mongoose';
import Product from './Product.js';
import Category from './Category.js';
import { NotFoundError, BadRequestError } from '../../core/errors.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';
import getPaginatedResults from '../../common/utils/pagination.js';

// Category Handlers
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, parentCategory, isActive } = req.body;

  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    throw new BadRequestError('Category slug already exists');
  }

  const category = await Category.create({
    name,
    slug,
    description,
    parentCategory: parentCategory || null,
    isActive: isActive !== undefined ? isActive : true
  });

  return res.status(201).json(
    new ApiResponse(201, { category }, 'Category created successfully')
  );
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).populate('parentCategory', 'name slug');
  return res.status(200).json(
    new ApiResponse(200, { categories }, 'Categories fetched successfully')
  );
});

export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).populate('parentCategory', 'name slug');
  return res.status(200).json(
    new ApiResponse(200, { categories }, 'All categories fetched successfully')
  );
});

// Product Handlers
export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  const existingProduct = await Product.findOne({ sku: productData.sku.toUpperCase() });
  if (existingProduct) {
    throw new BadRequestError('Product with this SKU already exists');
  }

  const existingSlug = await Product.findOne({ slug: productData.slug.toLowerCase() });
  if (existingSlug) {
    throw new BadRequestError('Product with this slug already exists');
  }

  // Ensure category exists
  const categoryExists = await Category.findById(productData.category);
  if (!categoryExists) {
    throw new NotFoundError('Category not found');
  }

  const product = await Product.create(productData);

  return res.status(201).json(
    new ApiResponse(201, { product }, 'Product created successfully')
  );
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (updateData.sku && updateData.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: updateData.sku.toUpperCase() });
    if (existingSku) {
      throw new BadRequestError('Product with this SKU already exists');
    }
  }

  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new NotFoundError('Category not found');
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { product: updatedProduct }, 'Product updated successfully')
  );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'Product deleted successfully')
  );
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
  
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { product }, 'Product fetched successfully')
  );
});

export const searchAndFilterProducts = asyncHandler(async (req, res) => {
  const { 
    search, 
    category, 
    minPrice, 
    maxPrice, 
    tags, 
    minRating, 
    limit = 20, 
    cursor 
  } = req.query;

  const match = { isActive: true };

  // 1. Standard text search
  if (search) {
    match.$text = { $search: search };
  }

  // 2. Category filter
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      match.category = new mongoose.Types.ObjectId(category);
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        match.category = catDoc._id;
      } else {
        match.category = new mongoose.Types.ObjectId(); // Empty ObjectId guarantees no matches
      }
    }
  }

  // 3. Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    match.price = {};
    if (minPrice !== undefined) match.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) match.price.$lte = Number(maxPrice);
  }

  // 4. Tags filter
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
    match.tags = { $in: tagsArray.map(t => t.toLowerCase()) };
  }

  // 5. Rating filter
  if (minRating !== undefined) {
    match['reviews.averageRating'] = { $gte: Number(minRating) };
  }

  // Faceted Aggregation
  const facetResult = await Product.aggregate([
    { $match: match },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        categories: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
          { $unwind: '$cat' },
          { $project: { _id: 1, name: '$cat.name', slug: '$cat.slug', count: 1 } }
        ],
        tags: [
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ],
        priceRange: [
          {
            $group: {
              _id: null,
              min: { $min: '$price' },
              max: { $max: '$price' }
            }
          }
        ]
      }
    }
  ]);

  // Paginate products query
  const paginated = await getPaginatedResults(
    Product, 
    match, 
    limit, 
    cursor, 
    '_id', 
    1
  );

  const facets = facetResult[0] || {};
  const total = facets.totalCount?.[0]?.count || 0;
  const categories = facets.categories || [];
  const tagsList = facets.tags || [];
  const priceRange = facets.priceRange?.[0] || { min: 0, max: 0 };

  return res.status(200).json(
    new ApiResponse(200, {
      products: paginated.items,
      nextCursor: paginated.nextCursor,
      facets: {
        total,
        categories,
        tags: tagsList,
        priceRange
      }
    }, 'Products matched and faceted successfully')
  );
});

// Admin bulk tools CSV export
export const exportProductsCSV = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('category', 'name');
  
  let csvContent = 'SKU,Name,Price,CompareAtPrice,Stock,LowStockThreshold,Category,Tags,IsActive\n';
  
  for (const p of products) {
    const sku = p.sku;
    const name = `"${p.name.replace(/"/g, '""')}"`;
    const price = p.price;
    const comparePrice = p.compareAtPrice || '';
    const stock = p.inventory.countInStock;
    const threshold = p.inventory.lowStockThreshold;
    const category = `"${(p.category?.name || '').replace(/"/g, '""')}"`;
    const tags = `"${(p.tags || []).join(';')}"`;
    const isActive = p.isActive;
    
    csvContent += `${sku},${name},${price},${comparePrice},${stock},${threshold},${category},${tags},${isActive}\n`;
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
  return res.status(200).send(csvContent);
});

// Admin bulk tools CSV import
export const importProductsCSV = asyncHandler(async (req, res) => {
  const { csvData } = req.body;
  if (!csvData) {
    throw new BadRequestError('csvData string is required in request body');
  }

  const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) {
    throw new BadRequestError('CSV contains no data lines');
  }

  let successCount = 0;
  let errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let row = [];
    let insideQuotes = false;
    let currentField = '';
    
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentField.trim().replace(/^"|"$/g, ''));
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim().replace(/^"|"$/g, ''));

    if (row.length < 5) {
      errors.push(`Line ${i + 1}: Insufficient fields (minimum 5 fields: SKU, Name, Price, Stock, Category required)`);
      continue;
    }

    const [sku, name, priceStr, comparePriceStr, stockStr, thresholdStr, categoryName, tagsStr, isActiveStr] = row;

    try {
      if (!sku || !name || !priceStr || !stockStr || !categoryName) {
        errors.push(`Line ${i + 1}: Missing mandatory values`);
        continue;
      }

      // Find or create Category dynamically
      const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({
          name: categoryName,
          slug: catSlug,
          description: `Automatically created during SKU import`
        });
      }

      const price = Number(priceStr);
      const compareAtPrice = comparePriceStr ? Number(comparePriceStr) : undefined;
      const countInStock = Number(stockStr);
      const lowStockThreshold = thresholdStr ? Number(thresholdStr) : 5;
      const tags = tagsStr ? tagsStr.split(';').map(t => t.trim().toLowerCase()) : [];
      const isActive = isActiveStr !== 'false';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const productFields = {
        sku: sku.toUpperCase(),
        name,
        slug,
        description: `Imported item SKU ${sku}`,
        price,
        compareAtPrice,
        inventory: {
          countInStock,
          lowStockThreshold
        },
        category: category._id,
        tags,
        isActive
      };

      await Product.findOneAndUpdate(
        { sku: sku.toUpperCase() },
        { $set: productFields },
        { upsert: true, new: true, runValidators: true }
      );

      successCount++;
    } catch (err) {
      errors.push(`Line ${i + 1}: ${err.message}`);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { successCount, errors }, `Import complete. Processed ${successCount} products successfully.`)
  );
});
