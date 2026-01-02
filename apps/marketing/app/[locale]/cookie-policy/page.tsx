import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CookiePolicy } from '~/components/sections/cookie-policy';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('cookiePolicy'))
  };
}

export default function CookiePolicyPage(): React.JSX.Element {
  return <CookiePolicy />;
}
