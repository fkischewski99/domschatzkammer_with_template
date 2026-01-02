import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

import { TotpCodeCard } from '~/components/auth/totp/totp-code-card';
import { createTitle } from '~/lib/formatters';

const searchParamsCache = createSearchParamsCache({
  token: parseAsString.withDefault(''),
  expiry: parseAsString.withDefault('')
});

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<NextSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });
  return {
    title: createTitle(t('confirmViaAuthenticatorApp'))
  };
}

export default async function TotpPage({
  params,
  searchParams
}: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.totp');
  const { token, expiry } = await searchParamsCache.parse(searchParams);

  if (!token) {
    return <>{t('missingTokenParam')}</>;
  }
  if (!expiry) {
    return <>{t('missingExpiryParam')}</>;
  }

  return (
    <TotpCodeCard
      token={token}
      expiry={expiry}
    />
  );
}
