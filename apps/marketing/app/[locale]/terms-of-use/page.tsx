import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { TermsOfUse } from '~/components/sections/terms-of-use';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('termsOfUse'))
  };
}

export default function TermsOfUsePage(): React.JSX.Element {
  return <TermsOfUse />;
}
