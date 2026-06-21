import { z } from 'zod';

export const categoryCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').trim(),
    slug: z.string().min(1, 'Slug is required').toLowerCase().trim(),
    description: z.string().optional(),
    parentCategory: z.string().optional().nullable(),
    isActive: z.boolean().default(true).optional()
  })
});

export const productCreateSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'SKU is required').uppercase().trim(),
    name: z.string().min(1, 'Name is required').trim(),
    slug: z.string().min(1, 'Slug is required').toLowerCase().trim(),
    description: z.string().min(1, 'Description is required'),
    price: z.number().min(0, 'Price must be positive'),
    compareAtPrice: z.number().min(0, 'Compare price must be positive').optional().nullable(),
    inventory: z.object({
      countInStock: z.number().min(0, 'Stock must be non-negative').default(0),
      lowStockThreshold: z.number().default(5).optional()
    }),
    category: z.string().min(1, 'Category ID is required'),
    tags: z.array(z.string()).default([]),
    images: z.array(
      z.object({
        url: z.string().min(1, 'Image URL is required'),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false).optional()
      })
    ).default([]),
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional()
    }).optional()
  })
});
