import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import { AnnotatedSection } from '@workspace/ui/components/annotated';

import { IssueTicketForm } from '~/components/purchases/issue-ticket-form';

export default async function IssueTicketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const t = await getTranslations('organization.settings.purchases');

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Get active tickets for the dropdown
  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId: organization.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      currency: true,
      stock: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <AnnotatedSection
      title={t('issue.heading')}
      description={t('issue.subheading')}
    >
      <IssueTicketForm
        organizationSlug={organization.slug}
        availableTickets={tickets.map((t) => ({
          id: t.id,
          name: t.name,
          price: Number(t.price),
          currency: t.currency,
          stock: t.stock,
        }))}
      />
    </AnnotatedSection>
  );
}
