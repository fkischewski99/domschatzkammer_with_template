import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ResetPasswordSuccessCard } from '~/components/auth/reset-password/reset-password-success-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('expiredChangeRequest'))
  };
}

export default function ResetPasswordSuccessPage(): React.JSX.Element {
  return <ResetPasswordSuccessCard />;
}
