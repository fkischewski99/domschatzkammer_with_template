import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ForgotPasswordCard } from '~/components/auth/forgot-password/forgot-password-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('forgotPassword'))
  };
}

export default function ForgotPasswordPage(): React.JSX.Element {
  return <ForgotPasswordCard />;
}
