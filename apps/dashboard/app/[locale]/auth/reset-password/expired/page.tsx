import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ResetPasswordExpiredCard } from '~/components/auth/reset-password/reset-password-expired-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('expiredChangeRequest'))
  };
}

export default function ResetPasswordExpiredPage(): React.JSX.Element {
  return <ResetPasswordExpiredCard />;
}
