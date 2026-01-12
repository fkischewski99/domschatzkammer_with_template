import { prisma } from '@workspace/database/client';
import type { Purchase, Ticket, User, PurchaseStatus } from '@workspace/database';

export interface PurchaseListItem extends Purchase {
  ticket: Ticket;
  user: User | null;
}

// Serialized type for client components (Decimal converted to number)
export interface SerializedPurchaseListItem extends Omit<PurchaseListItem, 'totalAmount' | 'ticket'> {
  totalAmount: number;
  ticket: Omit<Ticket, 'price'> & {
    price: number;
  };
}

export interface PurchaseFilters {
  organizationId: string;
  status?: PurchaseStatus;
  ticketId?: string;
  email?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Fetch all purchases for an organization with optional filters
 * Used for admin purchase management
 */
export async function getOrganizationPurchases(
  filters: PurchaseFilters
): Promise<PurchaseListItem[]> {
  const { organizationId, status, ticketId, email, dateFrom, dateTo } = filters;

  return prisma.purchase.findMany({
    where: {
      organizationId,
      ...(status && { status }),
      ...(ticketId && { ticketId }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(dateFrom &&
        dateTo && {
          purchasedAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        }),
    },
    include: {
      ticket: true,
      user: true,
    },
    orderBy: {
      purchasedAt: 'desc',
    },
  });
}

/**
 * Get purchase count by status for an organization
 * Used for dashboard statistics
 */
export async function getOrganizationPurchaseStats(organizationId: string) {
  const [total, completed, pending, refunded, cancelled] = await Promise.all([
    prisma.purchase.count({
      where: { organizationId },
    }),
    prisma.purchase.count({
      where: { organizationId, status: 'COMPLETED' },
    }),
    prisma.purchase.count({
      where: { organizationId, status: 'PENDING' },
    }),
    prisma.purchase.count({
      where: { organizationId, status: 'REFUNDED' },
    }),
    prisma.purchase.count({
      where: { organizationId, status: 'CANCELLED' },
    }),
  ]);

  return {
    total,
    completed,
    pending,
    refunded,
    cancelled,
  };
}
