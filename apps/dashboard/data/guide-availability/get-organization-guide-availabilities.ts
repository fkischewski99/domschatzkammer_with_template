import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { isOrganizationAdminOrAbove } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';
import { Role } from '@workspace/database';
import { prisma } from '@workspace/database/client';

import { Caching, OrganizationCacheKey } from '~/data/caching';
import type { GuideWithAvailabilityDto } from '~/types/dtos/guide-availability-dto';

interface GuideAvailabilityRaw {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    guideAvailabilities: {
      id: string;
      date: Date;
      status: 'AVAILABLE' | 'UNAVAILABLE';
      notes: string | null;
    }[];
  };
}

async function getOrganizationGuideAvailabilitiesData(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<GuideWithAvailabilityDto[]> {
  'use cache';
  cacheLife('default');
  cacheTag(
    Caching.createOrganizationTag(
      OrganizationCacheKey.GuideAvailability,
      organizationId
    )
  );

  // Get all guides in the organization
  const guides: GuideAvailabilityRaw[] = await prisma.membership.findMany({
    where: {
      organizationId,
      role: Role.GUIDE
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          guideAvailabilities: {
            where: {
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
          }
        }
      }
    }
  });

  return guides.map((g) => ({
    id: g.user.id,
    name: g.user.name,
    email: g.user.email,
    image: g.user.image,
    availabilities: g.user.guideAvailabilities.map((a) => ({
      id: a.id,
      date: a.date.toISOString(),
      status: a.status,
      notes: a.notes
    }))
  }));
}

export async function getOrganizationGuideAvailabilities(
  startDate: Date,
  endDate: Date
): Promise<GuideWithAvailabilityDto[]> {
  const ctx = await getAuthOrganizationContext();

  // Only admins can view all guide availabilities
  const canAccess = await isOrganizationAdminOrAbove(
    ctx.session.user.id,
    ctx.organization.id
  );
  if (!canAccess) {
    throw new ForbiddenError('Only admins can view all guide availabilities.');
  }

  return getOrganizationGuideAvailabilitiesData(
    ctx.organization.id,
    startDate,
    endDate
  );
}
