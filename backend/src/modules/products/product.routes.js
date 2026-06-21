import { Router } from 'express';
import { 
  createCategory, 
  getCategories, 
  getAllCategoriesAdmin, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductBySlug, 
  searchAndFilterProducts,
  exportProductsCSV,
  importProductsCSV
} from './product.controller.js';
import { categoryCreateSchema, productCreateSchema } from './product.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/catalog', searchAndFilterProducts);
router.get('/slug/:slug', getProductBySlug);

// Protected routes (Editor or SuperAdmin only)
router.post('/categories', protect, restrictTo('superadmin', 'editor'), validate(categoryCreateSchema), createCategory);
router.get('/admin/categories', protect, restrictTo('superadmin', 'editor'), getAllCategoriesAdmin);

router.post('/', protect, restrictTo('superadmin', 'editor'), validate(productCreateSchema), createProduct);
router.put('/:id', protect, restrictTo('superadmin', 'editor'), updateProduct);
router.delete('/:id', protect, restrictTo('superadmin', 'editor'), deleteProduct);

router.get('/admin/export', protect, restrictTo('superadmin', 'editor'), exportProductsCSV);
router.post('/admin/import', protect, restrictTo('superadmin', 'editor'), importProductsCSV);

export default router;
