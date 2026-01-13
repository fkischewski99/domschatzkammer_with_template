import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import { routes } from '@workspace/routes';
import { AnnotatedLayout, AnnotatedSection } from '@workspace/ui/components/annotated';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';
import { Separator } from '@workspace/ui/components/separator';

import {
  getEventById,
  type SerializedEventDetail
} from '~/data/events/get-event-by-id';
import { getOrganizationLocations } from '~/data/locations/get-organization-locations';
import { getAvailableGuidesForEvent } from '~/data/events/get-available-guides-for-event';
import { EventForm } from '~/components/events/event-form';
import { DeleteEventButton } from '~/components/events/delete-event-button';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { CancelEventSection } from './cancel-section';
import { GuideSection } from './guide-section';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string; eventId: string }>;
}): Promise<React.JSX.Element> {
  const { slug, eventId } = await params;
  const t = await getTranslations('organization.settings.events');

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  const event = await getEventById(eventId, organization.id);

  if (!event) {
    notFound();
  }

  const [locations, availableGuides] = await Promise.all([
    getOrganizationLocations({
      organizationId: organization.id,
      includeInactive: false,
    }),
    getAvailableGuidesForEvent(event.id),
  ]);

  // Serialize Decimal to number for client component
  const serializedEvent: SerializedEventDetail = {
    ...event,
    ticket: {
      ...event.ticket,
      price: Number(event.ticket.price),
    },
  };

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route: routes.dashboard.organizations.slug.Events,
              title: t('heading')
            }}
            title={event.name}
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <AnnotatedLayout>
          <AnnotatedSection
            title={t('edit.heading')}
            description={t('edit.subheading')}
          >
            <EventForm
              organizationSlug={organization.slug}
              locations={locations}
              event={serializedEvent}
              mode="edit"
            />
          </AnnotatedSection>

          <Separator />
          <GuideSection
            eventId={event.id}
            eventName={event.name}
            guide={event.guide}
            availableGuides={availableGuides}
            isCancelled={event.isCancelled}
          />

          {!event.isCancelled && (
            <>
              <Separator />
              <CancelEventSection
                eventId={event.id}
                eventName={event.name}
                organizationSlug={organization.slug}
              />
            </>
          )}

          <Separator />
          <AnnotatedSection
            title={t('delete.heading')}
            description={t('delete.subheading')}
          >
            <DeleteEventButton
              eventId={event.id}
              eventName={event.name}
              organizationSlug={organization.slug}
            />
          </AnnotatedSection>
        </AnnotatedLayout>
      </PageBody>
    </Page>
  );
}
