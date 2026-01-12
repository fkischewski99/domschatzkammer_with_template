import { prisma } from '@workspace/database/client';
import type { Location } from '@workspace/database';

export interface GetOrganizationLocationsOptions {
  organizationId: string;
  includeInactive?: boolean;
}

export async function getOrganizationLocations({
  organizationId,
  includeInactive = false,
}: GetOrganizationLocationsOptions): Promise<Location[]> {
  return prisma.location.findMany({
    where: {
      organizationId,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [
      { isActive: 'desc' },
      { name: 'asc' },
    ],
  });
}
