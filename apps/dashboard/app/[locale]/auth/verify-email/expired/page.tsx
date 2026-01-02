import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

import { VerifyEmailExpiredCard } from '~/components/auth/verify-email/verify-email-expired-card';
import { createTitle } from '~/lib/formatters';

const searchParamsCache = createSearchParamsCache({
  email: parseAsString.withDefault('')
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('emailVerificationExpired'))
  };
}

export default async function VerifyEmailExpiredPage({
  searchParams
}: NextPageProps): Promise<React.JSX.Element> {
  const { email } = await searchParamsCache.parse(searchParams);
  return <VerifyEmailExpiredCard email={email} />;
}
