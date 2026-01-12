'use server';

import { revalidatePath } from 'next/cache';

import { ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { setAvailabilitySchema } from '~/schemas/guide-availability/set-availability-schema';

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

    await prisma.guideAvailability.upsert({
      where: {
        userId_organizationId_date: {
          userId: ctx.session.user.id,
          organizationId: ctx.organization.id,
          date: parsedInput.date
        }
      },
      update: {
        status: parsedInput.status,
        notes: parsedInput.notes
      },
      create: {
        userId: ctx.session.user.id,
        organizationId: ctx.organization.id,
        date: parsedInput.date,
        status: parsedInput.status,
        notes: parsedInput.notes
      }
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/my-availability`);
  });
