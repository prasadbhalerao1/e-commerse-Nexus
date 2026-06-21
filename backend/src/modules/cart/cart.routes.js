import { Router } from 'express';
import { getCart, syncCart } from './cart.controller.js';
import { cartSyncSchema } from './cart.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect } from '../../common/middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/sync', validate(cartSyncSchema), syncCart);

export default router;
