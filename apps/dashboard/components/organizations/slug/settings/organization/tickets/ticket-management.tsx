'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useOptimistic, useTransition } from 'react';
import type { Ticket } from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { Badge } from '@workspace/ui/components/badge';
import { Switch } from '@workspace/ui/components/switch';

import { toggleTicketStatus } from '~/actions/tickets/admin/toggle-ticket-status';

interface TicketManagementProps {
  tickets: Ticket[];
  organizationSlug: string;
}

export function TicketManagement({
  tickets,
  organizationSlug
}: TicketManagementProps): React.JSX.Element {
  const t = useTranslations('organization.settings.tickets');
  const [isPending, startTransition] = useTransition();

  // Optimistic state for ticket statuses
  const [optimisticTickets, setOptimisticTickets] = useOptimistic(
    tickets,
    (state, { ticketId, isActive }: { ticketId: string; isActive: boolean }) =>
      state.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, isActive } : ticket
      )
  );

  const handleToggleStatus = async (ticketId: string, newStatus: boolean) => {
    startTransition(async () => {
      // Optimistically update the UI
      setOptimisticTickets({ ticketId, isActive: newStatus });

      try {
        const result = await toggleTicketStatus({
          ticketId,
          isActive: newStatus,
        });

        if (result?.serverError) {
          toast.error(result.serverError);
        } else {
          toast.success(
            newStatus ? t('status.activated') : t('status.deactivated')
          );
        }
      } catch (error) {
        toast.error(t('status.toggleError'));
      }
    });
  };

  return (
    <AnnotatedSection
      title={t('heading')}
      description={t('subheading')}
      contentClassName={tickets.length > 0 ? "md:col-span-12" : undefined}
    >
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('noTickets')}
            </p>
            <Link href={`/organizations/${organizationSlug}/settings/organization/tickets/create`}>
              <Button size="sm">
                {t('createFirst')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Link href={`/organizations/${organizationSlug}/settings/organization/tickets/create`}>
                <Button size="sm">
                  {t('createTicket')}
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[40%]">
                        {t('table.name')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[20%]">
                        {t('table.price')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[15%]">
                        {t('table.stock')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[15%]">
                        {t('table.status')}
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[10%]">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {optimisticTickets.map((ticket) => (
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
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={ticket.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleStatus(ticket.id, checked)
                              }
                              disabled={isPending}
                              aria-label={ticket.isActive ? t('active') : t('inactive')}
                            />
                            <span className="text-sm text-muted-foreground">
                              {ticket.isActive ? t('active') : t('inactive')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link
                            href={`/organizations/${organizationSlug}/settings/organization/tickets/${ticket.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {t('editAction')}
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
