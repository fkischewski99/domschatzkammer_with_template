import { z } from 'zod';

import { AvailabilityStatus } from '@workspace/database';

// Use string dates in YYYY-MM-DD format to avoid timezone issues
export const availabilityRangeSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    status: z.nativeEnum(AvailabilityStatus),
    notes: z.string().max(500, 'Maximum 500 characters allowed.').optional().nullable()
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after or equal to start date.',
    path: ['endDate']
  });

export type AvailabilityRangeSchema = z.infer<typeof availabilityRangeSchema>;
