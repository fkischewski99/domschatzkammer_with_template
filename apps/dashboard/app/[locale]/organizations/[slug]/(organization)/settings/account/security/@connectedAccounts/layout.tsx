import * as React from 'react';
import { getTranslations } from 'next-intl/server';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

import { PasswordLoginHint } from '~/components/organizations/slug/settings/account/security/password-login-hint';

export default async function ConnectedAccountsLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  const t = await getTranslations('account.security.connectedAccounts');

  return (
    <>
      <AnnotatedSection
        title={t('sectionTitle')}
        description={t('sectionDescription')}
      >
        {children}
      </AnnotatedSection>
      <PasswordLoginHint />
    </>
  );
}
