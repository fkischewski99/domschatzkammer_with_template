import { z } from 'zod';

// Base schema without refinements (can be extended)
export const baseEventSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Event name is required.')
    .max(255, 'Maximum 255 characters allowed.'),

  description: z.string()
    .trim()
    .max(10000, 'Maximum 10,000 characters allowed.')
    .optional()
    .or(z.literal('')),

  startTime: z.coerce.date({
    message: 'Start time is required and must be a valid date.',
  }),

  endTime: z.coerce.date({
    message: 'End time is required and must be a valid date.',
  }),

  locationId: z.string()
    .uuid('Please select a valid location.'),

  // Ticket fields (embedded in event form)
  ticketPrice: z.coerce.number()
    .min(0, 'Price must be 0 or greater.')
    .max(99999999.99, 'Price is too high.'),

  ticketCurrency: z.string()
    .length(3, 'Currency must be a 3-character ISO code.')
    .default('EUR'),

  ticketStock: z.coerce.number()
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.')
    .nullable()
    .optional(),

  ticketFeatures: z.array(z.string())
    .max(20, 'Maximum 20 features allowed.')
    .default([]),

  coverImage: z.string()
    .url('Must be a valid URL.')
    .max(2048, 'Maximum 2,048 characters allowed.')
    .optional()
    .or(z.literal('')),

  isPublished: z.boolean()
    .default(false),
});

// Schema with refinements for create (time validation)
export const eventSchema = baseEventSchema.superRefine((data, ctx) => {
  if (data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End time must be after start time.',
      path: ['endTime'],
    });
  }
  if (data.startTime <= new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Start time must be in the future.',
      path: ['startTime'],
    });
  }
});

export type EventSchema = z.infer<typeof baseEventSchema>;

export const cancelEventSchema = z.object({
  eventId: z.string().uuid(),
  reason: z.string()
    .trim()
    .max(1000, 'Maximum 1,000 characters allowed.')
    .optional()
    .or(z.literal('')),
});

export type CancelEventSchema = z.infer<typeof cancelEventSchema>;
