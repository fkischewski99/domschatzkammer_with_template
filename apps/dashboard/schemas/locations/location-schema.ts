import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Location name is required.')
    .max(255, 'Maximum 255 characters allowed.'),

  description: z.string()
    .trim()
    .max(2000, 'Maximum 2,000 characters allowed.')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .trim()
    .min(1, 'Address is required.')
    .max(500, 'Maximum 500 characters allowed.'),

  city: z.string()
    .trim()
    .min(1, 'City is required.')
    .max(255, 'Maximum 255 characters allowed.'),

  postalCode: z.string()
    .trim()
    .max(20, 'Maximum 20 characters allowed.')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean()
    .default(true),
});

export type LocationSchema = z.infer<typeof locationSchema>;
