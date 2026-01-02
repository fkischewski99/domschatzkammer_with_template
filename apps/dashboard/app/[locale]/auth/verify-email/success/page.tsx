import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { VerifyEmailSuccessCard } from '~/components/auth/verify-email/verify-email-success-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('emailVerificationSuccess'))
  };
}

export default async function EmailVerificationSuccessPage(): Promise<React.JSX.Element> {
  return <VerifyEmailSuccessCard />;
}
