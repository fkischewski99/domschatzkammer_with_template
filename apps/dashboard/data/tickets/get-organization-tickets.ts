import { prisma } from '@workspace/database/client';
import type { Ticket } from '@workspace/database';

export interface GetOrganizationTicketsOptions {
  organizationId: string;
  includeInactive?: boolean;
}

/**
 * Fetch all tickets for an organization
 * Used for public shop (active only) and admin management (all tickets)
 */
export async function getOrganizationTickets({
  organizationId,
  includeInactive = false,
}: GetOrganizationTicketsOptions): Promise<Ticket[]> {
  return prisma.ticket.findMany({
    where: {
      organizationId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [
      { isActive: 'desc' }, // Active tickets first
      { createdAt: 'desc' }, // Newest first
    ],
  });
}

/**
 * Fetch only active and available tickets for the public shop
 * Filters out sold-out tickets and tickets outside validity period
 */
export async function getAvailableTickets(
  organizationId: string
): Promise<Ticket[]> {
  const now = new Date();

  return prisma.ticket.findMany({
    where: {
      organizationId,
      isActive: true,
      AND: [
        {
          OR: [
            { stock: null }, // Unlimited stock
            { stock: { gt: 0 } }, // Has stock available
          ],
        },
        {
          OR: [
            // No validity period set
            {
              AND: [{ validFrom: null }, { validUntil: null }],
            },
            // Valid now
            {
              AND: [
                {
                  OR: [{ validFrom: null }, { validFrom: { lte: now } }],
                },
                {
                  OR: [{ validUntil: null }, { validUntil: { gte: now } }],
                },
              ],
            },
          ],
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
