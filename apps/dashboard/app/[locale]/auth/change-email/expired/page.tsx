import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ChangeEmailExpiredCard } from '~/components/auth/change-email/change-email-expired-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('expiredChangeRequest'))
  };
}

export default function ChangeEmailExpiredPage(): React.JSX.Element {
  return <ChangeEmailExpiredCard />;
}
