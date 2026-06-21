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
