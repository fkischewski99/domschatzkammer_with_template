import { z } from 'zod';

export const ticketSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Ticket name is required.')
    .max(255, 'Maximum 255 characters allowed.'),

  description: z.string()
    .trim()
    .max(10000, 'Maximum 10,000 characters allowed.')
    .optional()
    .or(z.literal('')),

  price: z.coerce.number()
    .min(0, 'Price must be 0 or greater.')
    .max(99999999.99, 'Price is too high.'),

  currency: z.string()
    .length(3, 'Currency must be a 3-character ISO code.')
    .default('EUR'),

  features: z.array(z.string())
    .max(20, 'Maximum 20 features allowed.')
    .default([]),

  stock: z.coerce.number()
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.')
    .nullable()
    .optional(),

  validFrom: z.coerce.date()
    .nullable()
    .optional(),

  validUntil: z.coerce.date()
    .nullable()
    .optional(),

  isActive: z.boolean()
    .default(true),
}).refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return data.validUntil > data.validFrom;
    }
    return true;
  },
  {
    message: 'Valid until date must be after valid from date.',
    path: ['validUntil'],
  }
);

export type TicketSchema = z.infer<typeof ticketSchema>;
