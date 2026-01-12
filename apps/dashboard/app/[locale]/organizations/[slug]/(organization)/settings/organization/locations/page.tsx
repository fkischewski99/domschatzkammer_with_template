import * as React from 'react';
import { notFound } from 'next/navigation';

import { prisma } from '@workspace/database/client';
import { getOrganizationLocations } from '~/data/locations/get-organization-locations';
import { LocationManagement } from '~/components/organizations/slug/settings/organization/locations/location-management';

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  const locations = await getOrganizationLocations({
    organizationId: organization.id,
    includeInactive: true,
  });

  return <LocationManagement locations={locations} organizationSlug={organization.slug} />;
}
