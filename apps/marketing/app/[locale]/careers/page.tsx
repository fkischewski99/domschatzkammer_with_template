import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CareersBenefits } from '~/components/sections/careers-benefits';
import { CareersPositions } from '~/components/sections/careers-positions';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('careers'))
  };
}

export default function CareersPage(): React.JSX.Element {
  return (
    <>
      <CareersBenefits />
      <CareersPositions />
    </>
  );
}
