'use server';

import { updateTag } from 'next/cache';

import { ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { availabilityRangeSchema } from '~/schemas/guide-availability/availability-range-schema';
import { Caching, OrganizationCacheKey } from '~/data/caching';

export const setAvailabilityRange = authOrganizationActionClient
  .metadata({ actionName: 'setAvailabilityRange' })
  .schema(availabilityRangeSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Only guides and admins can set availability
    const canManageAvailability = await isOrganizationGuideOrAbove(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!canManageAvailability) {
      throw new ForbiddenError('Only guides can set availability.');
    }

    const { startDate, endDate, status, notes } = parsedInput;

    // Parse YYYY-MM-DD strings to generate UTC dates
    const parseDate = (dateStr: string): Date => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    };

    // Generate all dates in the range (in UTC)
    const dates: Date[] = [];
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Upsert all dates
    await prisma.$transaction(
      dates.map((date) =>
        prisma.guideAvailability.upsert({
          where: {
            userId_organizationId_date: {
              userId: ctx.session.user.id,
              organizationId: ctx.organization.id,
              date
            }
          },
          update: {
            status,
            notes
          },
          create: {
            userId: ctx.session.user.id,
            organizationId: ctx.organization.id,
            date,
            status,
            notes
          }
        })
      )
    );

    updateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.GuideAvailability,
        ctx.organization.id
      )
    );
  });
