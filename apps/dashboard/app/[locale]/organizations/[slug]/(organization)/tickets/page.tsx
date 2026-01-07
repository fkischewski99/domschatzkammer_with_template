import * as React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@workspace/database/client';
import { getOrganizationTickets } from '~/data/tickets/get-organization-tickets';
import { TicketList } from '~/components/tickets/ticket-list';

/**
 * Public Ticket Shop Page
 * Displays available tickets for purchase (anonymous or authenticated users)
 */
export default async function TicketsShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Fetch only active tickets for public shop
  const tickets = await getOrganizationTickets({
    organizationId: organization.id,
    includeInactive: false,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <p className="mt-2 text-gray-600">
          Purchase tickets for {organization.name}
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tickets available at this time.</p>
        </div>
      ) : (
        <TicketList tickets={tickets} organizationId={organization.id} />
      )}
    </div>
  );
}
