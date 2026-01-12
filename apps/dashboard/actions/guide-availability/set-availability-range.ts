'use server';

import { revalidatePath } from 'next/cache';

import { ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { availabilityRangeSchema } from '~/schemas/guide-availability/availability-range-schema';

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

    // Generate all dates in the range
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
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

    revalidatePath(`/organizations/${ctx.organization.slug}/my-availability`);
  });
