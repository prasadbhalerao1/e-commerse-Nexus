import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').trim().optional(),
    lastName: z.string().min(1, 'Last name is required').trim().optional(),
    email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().optional()
  })
});

export const addressSchema = z.object({
  body: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
    isDefault: z.boolean().default(false).optional()
  })
});
