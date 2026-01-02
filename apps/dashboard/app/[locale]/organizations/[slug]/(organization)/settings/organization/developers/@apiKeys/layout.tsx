import * as React from 'react';
import { getTranslations } from 'next-intl/server';

import { baseUrl } from '@workspace/routes';
import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default async function ApiKeysLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  const t = await getTranslations('organization.settings.developers.apiKeys');

  return (
    <AnnotatedSection
      title={t('sectionTitle')}
      description={t('sectionDescription')}
      docLink={baseUrl.PublicApi}
    >
      {children}
    </AnnotatedSection>
  );
}
