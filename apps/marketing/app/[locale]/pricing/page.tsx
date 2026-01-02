import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PricingFAQ } from '~/components/sections/pricing-faq';
import { PricingHero } from '~/components/sections/pricing-hero';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('pricing'))
  };
}

export default function PricingPage(): React.JSX.Element {
  return (
    <>
      <PricingHero />
      <PricingFAQ />
    </>
  );
}
