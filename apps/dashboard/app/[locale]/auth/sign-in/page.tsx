import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SignInCard } from '~/components/auth/sign-in/sign-in-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('signIn'))
  };
}

export default async function SignInPage(): Promise<React.JSX.Element> {
  return <SignInCard />;
}
