import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect } from '../../common/middleware/auth.js';
import { authLimiter } from '../../common/middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
