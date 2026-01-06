'use server';

import { prisma } from '@workspace/database/client';
import type { Ticket } from '@workspace/database';

export interface ListTicketsInput {
  organizationId: string;
  includeInactive?: boolean;
}

export type ListTicketsResult = Pick<
  Ticket,
  | 'id'
  | 'name'
  | 'description'
  | 'price'
  | 'currency'
  | 'stock'
  | 'features'
  | 'validFrom'
  | 'validUntil'
  | 'isActive'
>[];

/**
 * List all tickets for an organization
 * Public action - can be called by anonymous users
 */
export async function listTickets(
  input: ListTicketsInput
): Promise<ListTicketsResult> {
  const { organizationId, includeInactive = false } = input;

  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      stock: true,
      features: true,
      validFrom: true,
      validUntil: true,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tickets;
}
