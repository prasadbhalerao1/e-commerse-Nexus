import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters long')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  })
});
