import { prisma } from '@workspace/database/client';
import type { Ticket, Organization } from '@workspace/database';

export interface TicketWithOrganization extends Ticket {
  organization: Organization;
}

/**
 * Fetch a single ticket by ID with organization data
 * Used for ticket detail pages and checkout flow
 */
export async function getTicketById(
  ticketId: string
): Promise<TicketWithOrganization | null> {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      organization: true,
    },
  });
}

/**
 * Fetch a ticket by ID, ensuring it belongs to the specified organization
 * Used for admin operations to prevent cross-organization access
 */
export async function getOrganizationTicket(
  ticketId: string,
  organizationId: string
): Promise<Ticket | null> {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      organizationId,
    },
  });
}
