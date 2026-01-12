import { prisma } from '@workspace/database/client';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface GetEventsForWeekOptions {
  organizationId: string;
  weekStart: Date;
  includeUnpublished?: boolean;
}

export async function getEventsForWeek({
  organizationId,
  weekStart,
  includeUnpublished = false,
}: GetEventsForWeekOptions) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(weekStart, { weekStartsOn: 1 }); // Sunday

  return prisma.event.findMany({
    where: {
      organizationId,
      ...(includeUnpublished ? {} : { isPublished: true }),
      isCancelled: false,
      OR: [
        // Events starting in this week
        {
          startTime: {
            gte: start,
            lte: end,
          },
        },
        // Events that span across this week
        {
          AND: [
            { startTime: { lt: start } },
            { endTime: { gt: start } },
          ],
        },
      ],
    },
    include: {
      location: true,
      ticket: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}
