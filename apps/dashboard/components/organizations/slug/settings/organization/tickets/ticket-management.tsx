'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Ticket } from '@workspace/database';

import { Button } from '@workspace/ui/components/button';
import {
  AnnotatedHeader,
  AnnotatedSection
} from '@workspace/ui/components/annotated';
import { Badge } from '@workspace/ui/components/badge';

import { useActiveOrganization } from '~/hooks/use-active-organization';
import { getOrganizationTickets } from '~/data/tickets/get-organization-tickets';

export function TicketManagement(): React.JSX.Element {
  const t = useTranslations('organization.settings.tickets');
  const organization = useActiveOrganization();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getOrganizationTickets({
          organizationId: organization.id,
          includeInactive: true
        });
        setTickets(data);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [organization.id]);

  return (
    <AnnotatedSection>
      <AnnotatedHeader
        heading={t('heading')}
        subheading={t('subheading')}
      />
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('noTickets')}
            </p>
            <Button asChild>
              <Link
                href={`/organizations/${organization.slug}/settings/organization/tickets/create`}
              >
                {t('createFirst')}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button asChild>
                <Link
                  href={`/organizations/${organization.slug}/settings/organization/tickets/create`}
                >
                  {t('createTicket')}
                </Link>
              </Button>
            </div>
            <div className="rounded-lg border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        {t('table.name')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        {t('table.price')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        {t('table.stock')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        {t('table.status')}
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle">
                          <div className="font-medium">{ticket.name}</div>
                          {ticket.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {ticket.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          {Number(ticket.price).toFixed(2)} {ticket.currency}
                        </td>
                        <td className="p-4 align-middle">
                          {ticket.stock === null ? t('unlimited') : ticket.stock}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={ticket.isActive ? 'default' : 'secondary'}>
                            {ticket.isActive ? t('active') : t('inactive')}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link
                            href={`/organizations/${organization.slug}/settings/organization/tickets/${ticket.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {t('edit')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AnnotatedSection>
  );
}
