import { Router } from 'express';
import { updateProfile, addAddress, deleteAddress, getAddresses, getAllUsers, deleteUser } from './user.controller.js';
import { addressSchema, updateProfileSchema } from './user.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

// Protected user routes
router.use(protect);

router.put('/profile', validate(updateProfileSchema), updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressSchema), addAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Superadmin-only operations
router.get('/admin/all', restrictTo('superadmin'), getAllUsers);
router.delete('/admin/:userId', restrictTo('superadmin'), deleteUser);

export default router;
