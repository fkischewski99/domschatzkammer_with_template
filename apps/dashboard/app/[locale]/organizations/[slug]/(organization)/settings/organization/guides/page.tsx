import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { startOfDay, addDays } from 'date-fns';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { isOrganizationAdminOrAbove } from '@workspace/auth/permissions';
import { routes } from '@workspace/routes';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
} from '@workspace/ui/components/page';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { GuideAvailabilityOverview } from '~/components/guides/guide-availability-overview';
import { getOrganizationGuideAvailabilities } from '~/data/guide-availability/get-organization-guide-availabilities';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('guides.overview');
  return {
    title: createTitle(t('title'))
  };
}

export default async function GuidesAvailabilityPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('guides.overview');
  const ctx = await getAuthOrganizationContext();

  // Only admins can access this page
  const canAccess = await isOrganizationAdminOrAbove(
    ctx.session.user.id,
    ctx.organization.id
  );
  if (!canAccess) {
    redirect(`/organizations/${ctx.organization.slug}/home`);
  }

  // Fetch availability for 14 days from today
  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 14);

  const guides = await getOrganizationGuideAvailabilities(startDate, endDate);

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            index={{
              route: routes.dashboard.organizations.slug.settings.organization.Index,
              title: 'Organization'
            }}
            title={t('title')}
            info={t('description')}
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <GuideAvailabilityOverview guides={guides} />
      </PageBody>
    </Page>
  );
}
