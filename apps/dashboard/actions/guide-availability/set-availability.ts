'use server';

import { updateTag } from 'next/cache';

import { ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { setAvailabilitySchema } from '~/schemas/guide-availability/set-availability-schema';
import { Caching, OrganizationCacheKey } from '~/data/caching';

export const setAvailability = authOrganizationActionClient
  .metadata({ actionName: 'setAvailability' })
  .schema(setAvailabilitySchema)
  .action(async ({ parsedInput, ctx }) => {
    // Only guides and admins can set availability
    const canManageAvailability = await isOrganizationGuideOrAbove(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!canManageAvailability) {
      throw new ForbiddenError('Only guides can set availability.');
    }

    // Parse YYYY-MM-DD string to UTC midnight date
    const [year, month, day] = parsedInput.date.split('-').map(Number);
    const normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    await prisma.guideAvailability.upsert({
      where: {
        userId_organizationId_date: {
          userId: ctx.session.user.id,
          organizationId: ctx.organization.id,
          date: normalizedDate
        }
      },
      update: {
        status: parsedInput.status,
        notes: parsedInput.notes
      },
      create: {
        userId: ctx.session.user.id,
        organizationId: ctx.organization.id,
        date: normalizedDate,
        status: parsedInput.status,
        notes: parsedInput.notes
      }
    });

    updateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.GuideAvailability,
        ctx.organization.id
      )
    );
  });
