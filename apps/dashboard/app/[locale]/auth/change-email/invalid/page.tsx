import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ChangeEmailInvalidCard } from '~/components/auth/change-email/change-email-invalid-card';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata');
  return {
    title: createTitle(t('invalidChangeRequest'))
  };
}

export default function ChangeEmailInvalidPage(): React.JSX.Element {
  return <ChangeEmailInvalidCard />;
}
