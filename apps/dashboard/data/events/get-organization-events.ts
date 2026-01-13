import { prisma } from '@workspace/database/client';

export interface GetOrganizationEventsOptions {
  organizationId: string;
  includeUnpublished?: boolean;
  includeCancelled?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export async function getOrganizationEvents({
  organizationId,
  includeUnpublished = false,
  includeCancelled = false,
  startDate,
  endDate,
}: GetOrganizationEventsOptions) {
  return prisma.event.findMany({
    where: {
      organizationId,
      ...(includeUnpublished ? {} : { isPublished: true }),
      ...(includeCancelled ? {} : { isCancelled: false }),
      ...(startDate || endDate ? {
        startTime: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      } : {}),
    },
    include: {
      location: true,
      ticket: true,
      guide: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

export type EventWithRelations = Awaited<ReturnType<typeof getOrganizationEvents>>[number];

// Serialized type for client components (Decimal converted to number)
export type SerializedEventWithRelations = Omit<EventWithRelations, 'ticket'> & {
  ticket: Omit<EventWithRelations['ticket'], 'price'> & {
    price: number;
  };
};
