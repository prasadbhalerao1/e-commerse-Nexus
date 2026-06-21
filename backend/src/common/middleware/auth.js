import { UnauthorizedError, ForbiddenError } from '../../core/errors.js';
import { verifyToken } from '../../core/security/jwt.js';
import User from '../../modules/users/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token is required');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User session not found');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Access denied: Insufficient privileges'));
    }
    next();
  };
};
