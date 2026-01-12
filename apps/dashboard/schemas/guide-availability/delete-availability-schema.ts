import { z } from 'zod';

export const deleteAvailabilitySchema = z.object({
  date: z.coerce.date()
});

export type DeleteAvailabilitySchema = z.infer<typeof deleteAvailabilitySchema>;
