import { Router } from 'express';
import { getCMS, updateCMS } from './cms.controller.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

router.get('/', getCMS);
router.put('/', protect, restrictTo('superadmin', 'editor'), updateCMS);

export default router;
