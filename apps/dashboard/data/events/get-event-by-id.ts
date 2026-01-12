import { prisma } from '@workspace/database/client';

export async function getEventById(
  eventId: string,
  organizationId: string
) {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      organizationId,
    },
    include: {
      location: true,
      ticket: true,
    },
  });
}

export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventById>>>;

// Serialized type for client components (Decimal converted to number)
export type SerializedEventDetail = Omit<EventDetail, 'ticket'> & {
  ticket: Omit<EventDetail['ticket'], 'price'> & {
    price: number;
  };
};
