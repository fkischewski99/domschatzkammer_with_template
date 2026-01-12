'use server';

import { revalidatePath } from 'next/cache';

import { ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { isOrganizationGuideOrAbove } from '@workspace/auth/permissions';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { deleteAvailabilitySchema } from '~/schemas/guide-availability/delete-availability-schema';

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

    await prisma.guideAvailability.deleteMany({
      where: {
        userId: ctx.session.user.id,
        organizationId: ctx.organization.id,
        date: parsedInput.date
      }
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/my-availability`);
  });
