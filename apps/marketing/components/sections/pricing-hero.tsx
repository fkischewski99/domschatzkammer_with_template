'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { PricingTable } from '@workspace/billing/components/pricing-table';
import { APP_NAME } from '@workspace/common/app';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

export function PricingHero(): React.JSX.Element {
  const t = useTranslations('pricingHero');

  return (
    <GridSection>
      <div className="container space-y-12 py-20">
        <SiteHeading
          badge={t('badge')}
          title={t('title')}
          description={t('description', { appName: APP_NAME })}
        />
        <PricingTable />
      </div>
    </GridSection>
  );
}
