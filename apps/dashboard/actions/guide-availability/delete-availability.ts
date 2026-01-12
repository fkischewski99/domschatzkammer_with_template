'use server';

import { updateTag } from 'next/cache';

import { ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { deleteAvailabilitySchema } from '~/schemas/guide-availability/delete-availability-schema';
import { Caching, OrganizationCacheKey } from '~/data/caching';

export const deleteAvailability = authOrganizationActionClient
  .metadata({ actionName: 'deleteAvailability' })
  .schema(deleteAvailabilitySchema)
  .action(async ({ parsedInput, ctx }) => {
    // Only guides and admins can delete their own availability
    const canManageAvailability = await isOrganizationGuideOrAbove(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!canManageAvailability) {
      throw new ForbiddenError('Only guides can manage availability.');
    }

    // Parse YYYY-MM-DD string to UTC midnight date
    const [year, month, day] = parsedInput.date.split('-').map(Number);
    const normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    await prisma.guideAvailability.deleteMany({
      where: {
        userId: ctx.session.user.id,
        organizationId: ctx.organization.id,
        date: normalizedDate
      }
    });

    updateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.GuideAvailability,
        ctx.organization.id
      )
    );
  });
