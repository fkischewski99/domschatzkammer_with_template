import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { prisma } from '@workspace/database/client';
import { AnnotatedSection } from '@workspace/ui/components/annotated';

import { getLocationById } from '~/data/locations/get-location-by-id';
import { LocationForm } from '~/components/locations/location-form';
import { DeleteLocationButton } from '~/components/locations/delete-location-button';

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ slug: string; locationId: string }>;
}): Promise<React.JSX.Element> {
  const { slug, locationId } = await params;
  const t = await getTranslations('organization.settings.locations');

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  const location = await getLocationById(locationId, organization.id);

  if (!location) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AnnotatedSection
        title={t('edit.heading')}
        description={t('edit.subheading')}
      >
        <LocationForm
          organizationSlug={organization.slug}
          location={location}
          mode="edit"
        />
      </AnnotatedSection>

      <AnnotatedSection
        title={t('delete.heading')}
        description={t('delete.subheading')}
      >
        <DeleteLocationButton
          locationId={location.id}
          locationName={location.name}
          organizationSlug={organization.slug}
        />
      </AnnotatedSection>
    </div>
  );
}
