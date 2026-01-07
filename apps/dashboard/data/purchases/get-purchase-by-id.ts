import { prisma } from '@workspace/database/client';
import type { Purchase, Ticket, Organization, User } from '@workspace/database';

export interface PurchaseDetails extends Purchase {
  ticket: Ticket;
  organization: Organization;
  user: User | null;
}

/**
 * Fetch a single purchase by ID with full details
 * Used for purchase detail pages (user and admin)
 */
export async function getPurchaseById(
  purchaseId: string
): Promise<PurchaseDetails | null> {
  return prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      ticket: true,
      organization: true,
      user: true,
    },
  });
}

/**
 * Fetch a purchase ensuring it belongs to the specified user
 * Used for user purchase history detail pages
 */
export async function getUserPurchase(
  purchaseId: string,
  userId: string
): Promise<PurchaseDetails | null> {
  return prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId,
    },
    include: {
      ticket: true,
      organization: true,
      user: true,
    },
  });
}

/**
 * Fetch a purchase by QR code
 * Used for ticket validation
 */
export async function getPurchaseByQRCode(
  qrCode: string
): Promise<PurchaseDetails | null> {
  return prisma.purchase.findUnique({
    where: { qrCode },
    include: {
      ticket: true,
      organization: true,
      user: true,
    },
  });
}
