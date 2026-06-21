import User from '../users/User.model.js';
import Cart from '../cart/Cart.model.js';
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

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new BadRequestError('Google ID Token is required');
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      throw new BadRequestError('Invalid Google ID Token');
    }
    const data = await response.json();
    const { email, given_name, family_name, email_verified } = data;

    if (!email_verified) {
      throw new BadRequestError('Google email address is not verified');
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      const hashedPassword = await hashPassword(randomPassword);

      user = await User.create({
        firstName: given_name || 'Google',
        lastName: family_name || 'User',
        email,
        password: hashedPassword,
        role: 'user'
      });

      await Cart.create({ user: user._id, items: [] });
    }

    return sendTokenCookie(user, 200, res, 'Google SSO login successful');
  } catch (error) {
    throw new BadRequestError(error.message || 'Google SSO verification failed');
  }
});
