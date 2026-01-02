import * as React from 'react';
import { getTranslations } from 'next-intl/server';

import { AnnotatedSection } from '@workspace/ui/components/annotated';

export default async function OrganizationSlugLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  const t = await getTranslations('organization.settings.general.slug');

  return (
    <AnnotatedSection
      title={t('sectionTitle')}
      description={t('sectionDescription')}
    >
      {children}
    </AnnotatedSection>
  );
}
