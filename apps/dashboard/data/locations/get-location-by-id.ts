import { prisma } from '@workspace/database/client';
import type { Location } from '@workspace/database';

export async function getLocationById(
  locationId: string,
  organizationId: string
): Promise<Location | null> {
  return prisma.location.findFirst({
    where: {
      id: locationId,
      organizationId,
    },
  });
}
