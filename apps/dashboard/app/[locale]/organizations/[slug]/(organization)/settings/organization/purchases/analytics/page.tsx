import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import { AnnotatedSection } from '@workspace/ui/components/annotated';

import {
  getPurchaseAnalytics,
  getDateRangePreset,
} from '~/data/purchases/get-purchase-analytics';
import { AnalyticsDashboard } from '~/components/purchases/analytics-dashboard';

export default async function AnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const { range = 'last30days' } = await searchParams;
  const t = await getTranslations('organization.settings.analytics');

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Get date range from preset
  const dateRange = getDateRangePreset(
    range as 'last7days' | 'last30days' | 'last90days' | 'allTime'
  );

  // Fetch analytics data
  const analytics = await getPurchaseAnalytics({
    organizationId: organization.id,
    ...dateRange,
  });

  return (
    <AnnotatedSection
      title={t('title')}
      description={t('description')}
      contentClassName="md:col-span-12"
    >
      <AnalyticsDashboard
        analytics={analytics}
        organizationSlug={organization.slug}
        currentRange={range}
      />
    </AnnotatedSection>
  );
}
