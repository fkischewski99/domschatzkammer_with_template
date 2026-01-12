import * as React from 'react';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar
} from '@workspace/ui/components/page';

import { AddEventButton } from '~/components/events/add-event-button';
import { EventsContent } from '~/components/events/events-content';
import { EventsEmptyState } from '~/components/events/events-empty-state';
import { EventsFilters } from '~/components/events/events-filters';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import {
  getOrganizationEvents,
  type SerializedEventWithRelations
} from '~/data/events/get-organization-events';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('organization.settings.events');
  return {
    title: createTitle(t('heading'))
  };
}

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string; filter?: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const { view, filter } = await searchParams;
  const t = await getTranslations('organization.settings.events');

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  const events = await getOrganizationEvents({
    organizationId: organization.id,
    includeUnpublished: true,
    includeCancelled: true,
  });

  const serializedEvents: SerializedEventWithRelations[] = events.map((event) => ({
    ...event,
    ticket: {
      ...event.ticket,
      price: Number(event.ticket.price),
    },
  }));

  const totalCount = events.length;
  const hasAnyEvents = totalCount > 0;

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title={t('heading')}
              info={t('totalInfo', { count: totalCount })}
            />
            {hasAnyEvents && (
              <PageActions>
                <AddEventButton organizationSlug={slug} />
              </PageActions>
            )}
          </PagePrimaryBar>
          <PageSecondaryBar>
            <React.Suspense>
              <EventsFilters
                view={view === 'calendar' ? 'calendar' : 'list'}
                filter={filter || 'all'}
              />
            </React.Suspense>
          </PageSecondaryBar>
        </PageHeader>
        <PageBody disableScroll={hasAnyEvents}>
          {hasAnyEvents ? (
            <React.Suspense>
              <EventsContent
                events={serializedEvents}
                organizationSlug={slug}
                view={view === 'calendar' ? 'calendar' : 'list'}
                filter={filter || 'all'}
              />
            </React.Suspense>
          ) : (
            <EventsEmptyState organizationSlug={slug} />
          )}
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
