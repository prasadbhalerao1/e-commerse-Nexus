import Coupon from './Coupon.model.js';
import { NotFoundError, BadRequestError } from '../../core/errors.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderValue, usageLimit, expiresAt } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    throw new BadRequestError('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderValue,
    usageLimit,
    expiresAt: new Date(expiresAt)
  });

  return res.status(201).json(
    new ApiResponse(201, { coupon }, 'Coupon created successfully')
  );
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.query;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) {
    throw new NotFoundError('Invalid coupon code');
  }

  if (coupon.expiresAt < new Date()) {
    throw new BadRequestError('Coupon code has expired');
  }

  if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
    throw new BadRequestError('Coupon code usage limit exceeded');
  }

  if (Number(orderValue) < coupon.minOrderValue) {
    throw new BadRequestError(`Minimum order value of $${coupon.minOrderValue} required for this coupon`);
  }

  return res.status(200).json(
    new ApiResponse(200, { coupon }, 'Coupon code is valid')
  );
});
