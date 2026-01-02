import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

import { ForgotPasswordSuccessCard } from '~/components/auth/forgot-password/forgot-password-success-card';
import { createTitle } from '~/lib/formatters';

const searchParamsCache = createSearchParamsCache({
  email: parseAsString.withDefault('')
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('resetLinkSent'))
  };
}

export default async function ForgotPasswordSuccessPage({
  searchParams
}: NextPageProps): Promise<React.JSX.Element> {
  const { email } = await searchParamsCache.parse(searchParams);
  return <ForgotPasswordSuccessCard email={email} />;
}
