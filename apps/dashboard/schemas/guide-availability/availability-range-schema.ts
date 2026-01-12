import { z } from 'zod';

import { AvailabilityStatus } from '@workspace/database';

export const availabilityRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(AvailabilityStatus),
    notes: z.string().max(500, 'Maximum 500 characters allowed.').optional().nullable()
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after or equal to start date.',
    path: ['endDate']
  });

export type AvailabilityRangeSchema = z.infer<typeof availabilityRangeSchema>;
