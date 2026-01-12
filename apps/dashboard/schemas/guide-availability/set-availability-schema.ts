import { z } from 'zod';

import { AvailabilityStatus } from '@workspace/database';

// Use string date in YYYY-MM-DD format to avoid timezone issues
export const setAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.nativeEnum(AvailabilityStatus),
  notes: z.string().max(500, 'Maximum 500 characters allowed.').optional().nullable()
});

export type SetAvailabilitySchema = z.infer<typeof setAvailabilitySchema>;
