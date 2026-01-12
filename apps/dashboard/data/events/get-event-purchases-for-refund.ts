import { prisma } from '@workspace/database/client';

export type PurchaseForRefund = {
  id: string;
  email: string;
  customerName: string | null;
  stripePaymentIntentId: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  ticket: {
    name: string;
  };
};

export type EventPurchasesForRefund = {
  count: number;
  paidCount: number;
  freeCount: number;
  totalAmount: number;
  currency: string;
  purchases: PurchaseForRefund[];
  organization: {
    id: string;
    name: string;
    stripeConnectAccountId: string | null;
  };
  event: {
    id: string;
    name: string;
    startTime: Date;
    location: {
      name: string;
    };
  };
};

export async function getEventPurchasesForRefund(
  eventId: string,
  organizationId: string
): Promise<EventPurchasesForRefund | null> {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizationId,
    },
    include: {
      location: true,
      ticket: {
        include: {
          purchases: {
            where: {
              status: 'COMPLETED',
            },
            select: {
              id: true,
              email: true,
              customerName: true,
              stripePaymentIntentId: true,
              totalAmount: true,
              currency: true,
              status: true,
              ticket: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          stripeConnectAccountId: true,
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  const purchases = event.ticket.purchases.map((p) => ({
    ...p,
    totalAmount: Number(p.totalAmount),
  }));

  const paidPurchases = purchases.filter((p) => p.stripePaymentIntentId !== null);
  const freePurchases = purchases.filter((p) => p.stripePaymentIntentId === null);

  const totalAmount = paidPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const currency = purchases[0]?.currency ?? event.ticket.currency;

  return {
    count: purchases.length,
    paidCount: paidPurchases.length,
    freeCount: freePurchases.length,
    totalAmount,
    currency,
    purchases,
    organization: event.organization,
    event: {
      id: event.id,
      name: event.name,
      startTime: event.startTime,
      location: event.location,
    },
  };
}
