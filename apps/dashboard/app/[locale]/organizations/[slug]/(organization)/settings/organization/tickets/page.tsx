import * as React from 'react';
import { notFound } from 'next/navigation';

import { prisma } from '@workspace/database/client';
import { getOrganizationTickets } from '~/data/tickets/get-organization-tickets';
import { TicketManagement } from '~/components/organizations/slug/settings/organization/tickets/ticket-management';

export default async function TicketsPage({
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

  // Fetch all tickets (including inactive) for admin view
  const tickets = await getOrganizationTickets({
    organizationId: organization.id,
    includeInactive: true,
  });

  return <TicketManagement tickets={tickets} organizationSlug={organization.slug} />;
}
