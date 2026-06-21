import { generateToken } from '../../core/security/jwt.js';

export const sendTokenCookie = (user, statusCode, res, message = 'Success') => {
  const token = generateToken({ id: user._id, role: user.role });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  // Return user info but NEVER the token in body as per requirements
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        addresses: user.addresses || []
      }
    }
  });
};

export default sendTokenCookie;
