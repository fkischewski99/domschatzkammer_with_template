import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PrivacyPolicy } from '~/components/sections/privacy-policy';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('privacyPolicy'))
  };
}

export default function PrivacyPolicyPage(): React.JSX.Element {
  return <PrivacyPolicy />;
}
