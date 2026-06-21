import User from '../users/User.js';
import Cart from '../orders/Cart.js';
import { BadRequestError, UnauthorizedError } from '../../core/errors.js';
import { hashPassword, comparePassword } from '../../core/security/bcrypt.js';
import { sendTokenCookie } from '../../common/utils/generateTokens.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('A user with this email address already exists');
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: 'user' // Default role
  });

  // Pre-initialize empty database cart for new users
  await Cart.create({ user: user._id, items: [] });

  return sendTokenCookie(user, 201, res, 'User registered successfully');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Retrieve user along with hidden password field
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await comparePassword(password, user.password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return sendTokenCookie(user, 200, res, 'Login successful');
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  return res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        addresses: req.user.addresses || []
      }
    }, 'User profile retrieved successfully')
  );
});
