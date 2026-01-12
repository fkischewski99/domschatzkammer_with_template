import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { prisma } from '@workspace/database/client';

import { Caching, OrganizationCacheKey } from '~/data/caching';
import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';

async function getMyAvailabilityData(
  userId: string,
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<GuideAvailabilityDto[]> {
  'use cache';
  cacheLife('default');
  cacheTag(
    Caching.createOrganizationTag(
      OrganizationCacheKey.GuideAvailability,
      organizationId
    )
  );

  const availabilities = await prisma.guideAvailability.findMany({
    where: {
      userId,
      organizationId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      date: true,
      status: true,
      notes: true
    },
    orderBy: { date: 'asc' }
  });

  return availabilities.map((a) => ({
    id: a.id,
    date: a.date.toISOString(),
    status: a.status,
    notes: a.notes
  }));
}

export async function getMyAvailability(
  startDate: Date,
  endDate: Date
): Promise<GuideAvailabilityDto[]> {
  const ctx = await getAuthOrganizationContext();
  return getMyAvailabilityData(
    ctx.session.user.id,
    ctx.organization.id,
    startDate,
    endDate
  );
}
