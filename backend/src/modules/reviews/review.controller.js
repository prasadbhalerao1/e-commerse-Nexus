import Review from './Review.model.js';
import Product from '../products/Product.model.js';
import Order from '../orders/Order.model.js';
import { NotFoundError } from '../../core/errors.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';

export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment, images } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Verify product purchase by user
  const orderExists = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    'payment.status': 'Completed'
  });

  const isVerifiedPurchase = !!orderExists;

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase
  });

  // Recalculate average rating on product atomically
  const reviews = await Review.find({ product: productId });
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  product.reviews.totalReviews = totalReviews;
  product.reviews.averageRating = Math.round(averageRating * 10) / 10;
  await product.save();

  return res.status(201).json(
    new ApiResponse(201, { review }, 'Review posted successfully')
  );
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product: productId }).populate('user', 'firstName lastName').sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, { reviews }, 'Product reviews fetched successfully')
  );
});
