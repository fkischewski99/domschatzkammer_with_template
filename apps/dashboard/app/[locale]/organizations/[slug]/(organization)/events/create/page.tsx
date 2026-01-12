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

import { getOrganizationLocations } from '~/data/locations/get-organization-locations';
import { EventForm } from '~/components/events/event-form';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';

export default async function CreateEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const t = await getTranslations('organization.settings.events');

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  const locations = await getOrganizationLocations({
    organizationId: organization.id,
    includeInactive: false,
  });

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route: routes.dashboard.organizations.slug.Events,
              title: t('heading')
            }}
            title={t('create.heading')}
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <AnnotatedLayout>
          <AnnotatedSection
            title={t('create.heading')}
            description={t('create.subheading')}
          >
            <EventForm
              organizationSlug={organization.slug}
              locations={locations}
              mode="create"
            />
          </AnnotatedSection>
        </AnnotatedLayout>
      </PageBody>
    </Page>
  );
}
