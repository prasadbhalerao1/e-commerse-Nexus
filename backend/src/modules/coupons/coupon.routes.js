import { Router } from 'express';
import { createCoupon, validateCoupon } from './coupon.controller.js';
import { couponCreateSchema } from './coupon.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

router.post('/', protect, restrictTo('superadmin', 'editor'), validate(couponCreateSchema), createCoupon);
router.get('/validate', validateCoupon);

export default router;
