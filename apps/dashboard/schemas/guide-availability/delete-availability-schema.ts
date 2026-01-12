import { z } from 'zod';

// Use string date in YYYY-MM-DD format to avoid timezone issues
export const deleteAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

export type DeleteAvailabilitySchema = z.infer<typeof deleteAvailabilitySchema>;
