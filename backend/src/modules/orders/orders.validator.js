import { z } from 'zod';

export const orderCreateSchema = z.object({
  body: z.object({
    guestEmail: z.string().email('Invalid email address').optional().nullable(),
    items: z.array(
      z.object({
        product: z.string().min(1, 'Product ID is required'),
        qty: z.number().min(1, 'Quantity must be at least 1')
      })
    ),
    shippingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zip: z.string().min(1, 'Zip code is required'),
      country: z.string().min(1, 'Country is required')
    }),
    billingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zip: z.string().min(1, 'Zip code is required'),
      country: z.string().min(1, 'Country is required')
    }),
    paymentMethod: z.enum(['Stripe', 'PayPal']).default('PayPal'),
    couponCode: z.string().optional().nullable()
  })
});

