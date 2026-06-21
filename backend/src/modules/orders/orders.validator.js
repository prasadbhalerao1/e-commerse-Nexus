import { z } from 'zod';

export const cartSyncSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        product: z.string().min(1, 'Product ID is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1')
      })
    )
  })
});

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

export const reviewCreateSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    title: z.string().min(1, 'Title is required').trim(),
    comment: z.string().min(1, 'Comment is required'),
    images: z.array(z.string()).default([])
  }),
  params: z.object({
    productId: z.string().min(1, 'Product ID is required')
  })
});

export const couponCreateSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required').uppercase().trim(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().min(1),
    minOrderValue: z.number().min(0).default(0),
    usageLimit: z.number().nullable().optional(),
    expiresAt: z.string() // ISO Date string
  })
});
