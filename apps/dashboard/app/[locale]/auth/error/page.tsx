import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

import { AuthErrorCode } from '@workspace/auth/errors';

import { AuthErrorCard } from '~/components/auth/error/auth-error-card';
import { createTitle } from '~/lib/formatters';
import { getAuthErrorLabel } from '~/lib/labels';

const searchParamsCache = createSearchParamsCache({
  error: parseAsString.withDefault('')
});

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<NextSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });
  return {
    title: createTitle(t('authError'))
  };
}

export default async function AuthErrorPage({
  params,
  searchParams
}: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParamsCache.parse(searchParams);
  const t = await getTranslations('auth.errors');

  const errorCode = (error in AuthErrorCode ? error : AuthErrorCode.UnknownError) as AuthErrorCode;
  const errorMessage = getAuthErrorLabel(t, errorCode);

  return <AuthErrorCard errorMessage={errorMessage} />;
}
