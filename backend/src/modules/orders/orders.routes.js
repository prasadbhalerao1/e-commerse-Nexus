import { Router } from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getAllOrdersAdmin, 
  updateOrderStatus, 
  downloadInvoice,
  getAdminAnalytics
} from './orders.controller.js';
import { 
  orderCreateSchema 
} from './orders.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

// --- ORDER ROUTES ---
router.post('/', (req, res, next) => {
  if (req.cookies && req.cookies.token) {
    return protect(req, res, next);
  }
  next();
}, validate(orderCreateSchema), createOrder);

router.get('/my', protect, getMyOrders);
router.get('/admin/analytics', protect, restrictTo('superadmin', 'editor'), getAdminAnalytics);
router.get('/admin/all', protect, restrictTo('superadmin', 'editor'), getAllOrdersAdmin);
router.put('/admin/:id', protect, restrictTo('superadmin', 'editor'), updateOrderStatus);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, downloadInvoice);

export default router;

