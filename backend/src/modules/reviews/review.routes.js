import { Router } from 'express';
import { createReview, getProductReviews } from './review.controller.js';
import { reviewCreateSchema } from './review.validator.js';
import { validate } from '../../common/middleware/validate.js';
import { protect } from '../../common/middleware/auth.js';

const router = Router();

// Route to post a product review (authenticated)
router.post('/:productId', protect, validate(reviewCreateSchema), createReview);

// Route to fetch all reviews for a product (public)
router.get('/:productId', getProductReviews);

export default router;
