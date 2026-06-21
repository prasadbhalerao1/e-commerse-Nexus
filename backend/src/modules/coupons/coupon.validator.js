import { z } from 'zod';

export const couponCreateSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required').toUpperCase().trim(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().min(1),
    minOrderValue: z.number().min(0).default(0),
    usageLimit: z.number().nullable().optional(),
    expiresAt: z.string()
  })
});
