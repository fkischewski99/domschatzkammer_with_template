import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import { AnnotatedSection } from '@workspace/ui/components/annotated';

import { LocationForm } from '~/components/locations/location-form';

export default async function CreateLocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const t = await getTranslations('organization.settings.locations');

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  return (
    <AnnotatedSection
      title={t('create.heading')}
      description={t('create.subheading')}
    >
      <LocationForm
        organizationSlug={organization.slug}
        mode="create"
      />
    </AnnotatedSection>
  );
}
