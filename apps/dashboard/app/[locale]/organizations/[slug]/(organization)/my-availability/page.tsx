import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';
import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
  PageSecondaryBar,
} from '@workspace/ui/components/page';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { MyAvailabilityContent } from '~/components/guides/my-availability-content';
import { AvailabilityFilters } from '~/components/guides/availability-filters';
import { AvailabilityLegend } from '~/components/guides/availability-legend';
import { getMyAvailability } from '~/data/guide-availability/get-my-availability';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('guides.availability');
  return {
    title: createTitle(t('title'))
  };
}

export default async function MyAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}): Promise<React.JSX.Element> {
  const { view } = await searchParams;
  const t = await getTranslations('guides.availability');
  const ctx = await getAuthOrganizationContext();

  // Only guides and admins can access this page
  const canAccess = await isOrganizationGuideOrAbove(
    ctx.session.user.id,
    ctx.organization.id
  );
  if (!canAccess) {
    redirect(`/organizations/${ctx.organization.slug}/home`);
  }

  // Fetch availability for 3 months (current + 2 months ahead)
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(addMonths(new Date(), 2));

  const availabilities = await getMyAvailability(startDate, endDate);
  const currentView = view === 'list' ? 'list' : 'calendar';

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title={t('title')}
              info={t('description')}
            />
          </PagePrimaryBar>
          <PageSecondaryBar>
            <AvailabilityLegend />
            <React.Suspense>
              <AvailabilityFilters view={currentView} />
            </React.Suspense>
          </PageSecondaryBar>
        </PageHeader>
        <PageBody>
          <div className="px-4 py-4 sm:px-6">
            <React.Suspense>
              <MyAvailabilityContent
                initialAvailabilities={availabilities}
                view={currentView}
              />
            </React.Suspense>
          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}
