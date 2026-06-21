import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import userRouter from '../modules/users/user.routes.js';
import productRouter from '../modules/products/product.routes.js';
import cmsRouter from '../modules/cms/cms.routes.js';
import cartRouter from '../modules/cart/cart.routes.js';
import couponRouter from '../modules/coupons/coupon.routes.js';
import reviewRouter from '../modules/reviews/review.routes.js';
import orderRouter from '../modules/orders/orders.routes.js';
import systemControlRouter from '../modules/system-control/systemControl.routes.js';
import ApiResponse from '../core/responses/ApiResponse.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { uptime: process.uptime() }, 'Secure core uplink active and healthy')
  );
});

// Module routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/cms', cmsRouter);
router.use('/cart', cartRouter);
router.use('/coupons', couponRouter);
router.use('/reviews', reviewRouter);
router.use('/orders', orderRouter);
router.use('/system-control', systemControlRouter);

export default router;
