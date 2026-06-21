import { Router } from 'express';
import { 
  getCart, 
  syncCart, 
  createCoupon, 
  validateCoupon, 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getAllOrdersAdmin, 
  updateOrderStatus, 
  createReview, 
  getProductReviews, 
  downloadInvoice 
} from './orders.controller.js';
import { 
  cartSyncSchema, 
  orderCreateSchema, 
  reviewCreateSchema, 
  couponCreateSchema 
} from './orders.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

// --- CART ROUTES ---
router.get('/cart', protect, getCart);
router.post('/cart/sync', protect, validate(cartSyncSchema), syncCart);

// --- COUPON ROUTES ---
router.post('/coupons', protect, restrictTo('superadmin', 'editor'), validate(couponCreateSchema), createCoupon);
router.get('/coupons/validate', validateCoupon);

// --- ORDER ROUTES ---
router.post('/', (req, res, next) => {
  if (req.cookies && req.cookies.token) {
    return protect(req, res, next);
  }
  next();
}, validate(orderCreateSchema), createOrder);

router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, restrictTo('superadmin', 'editor'), getAllOrdersAdmin);
router.put('/admin/:id', protect, restrictTo('superadmin', 'editor'), updateOrderStatus);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, downloadInvoice);

// --- REVIEWS ROUTES ---
router.post('/:productId/reviews', protect, validate(reviewCreateSchema), createReview);
router.get('/:productId/reviews', getProductReviews);

export default router;
