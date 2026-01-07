import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';

import { getOrganizationTicket } from '~/data/tickets/get-ticket-by-id';
import { TicketForm } from '~/components/tickets/ticket-form';
import { DeleteTicketButton } from '~/components/tickets/delete-ticket-button';

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ slug: string; ticketId: string }>;
}): Promise<React.JSX.Element> {
  const { slug, ticketId } = await params;
  const t = await getTranslations('organization.settings.tickets');

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Get ticket (ensures it belongs to this organization)
  const ticket = await getOrganizationTicket(ticketId, organization.id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AnnotatedSection
        title={t('edit.heading')}
        description={t('edit.subheading')}
      >
        <TicketForm
          organizationSlug={organization.slug}
          ticket={ticket}
          mode="edit"
        />
      </AnnotatedSection>

      <AnnotatedSection
        title={t('delete.heading')}
        description={t('delete.subheading')}
      >
        <DeleteTicketButton
          ticketId={ticket.id}
          ticketName={ticket.name}
          organizationSlug={organization.slug}
        />
      </AnnotatedSection>
    </div>
  );
}
