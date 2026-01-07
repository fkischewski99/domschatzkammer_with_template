import { prisma } from '@workspace/database/client';
import type { Purchase, Ticket } from '@workspace/database';

export interface PurchaseWithTicket extends Purchase {
  ticket: Ticket;
}

/**
 * Fetch all purchases for a user (authenticated purchase history)
 */
export async function getUserPurchases(
  userId: string
): Promise<PurchaseWithTicket[]> {
  return prisma.purchase.findMany({
    where: {
      userId,
    },
    include: {
      ticket: true,
    },
    orderBy: {
      purchasedAt: 'desc',
    },
  });
}

/**
 * Fetch purchases for a user filtered by status
 */
export async function getUserPurchasesByStatus(
  userId: string,
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
): Promise<PurchaseWithTicket[]> {
  return prisma.purchase.findMany({
    where: {
      userId,
      status,
    },
    include: {
      ticket: true,
    },
    orderBy: {
      purchasedAt: 'desc',
    },
  });
}
