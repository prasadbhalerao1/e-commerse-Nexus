import { z } from 'zod';

export const reviewCreateSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    title: z.string().min(1, 'Title is required').trim(),
    comment: z.string().min(1, 'Comment is required'),
    images: z.array(z.string()).default([])
  }),
  params: z.object({
    productId: z.string().min(1, 'Product ID parameter is required')
  })
});
