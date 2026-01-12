import { z } from 'zod';

import { AvailabilityStatus } from '@workspace/database';

export const setAvailabilitySchema = z.object({
  date: z.coerce.date(),
  status: z.enum(AvailabilityStatus),
  notes: z.string().max(500, 'Maximum 500 characters allowed.').optional().nullable()
});

export type SetAvailabilitySchema = z.infer<typeof setAvailabilitySchema>;
