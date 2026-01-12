'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError, ValidationError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const deleteLocationSchema = z.object({
  id: z.string().uuid(),
});

export const deleteLocation = authOrganizationActionClient
  .metadata({ actionName: 'deleteLocation' })
  .schema(deleteLocationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    const existingLocation = await prisma.location.findFirst({
      where: {
        id: parsedInput.id,
        organizationId: ctx.organization.id,
      },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!existingLocation) {
      throw new NotFoundError('Location not found');
    }

    if (existingLocation._count.events > 0) {
      throw new ValidationError(
        `Cannot delete location with ${existingLocation._count.events} associated event(s). Delete or reassign events first.`
      );
    }

    await prisma.location.delete({
      where: { id: parsedInput.id },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/locations`);

    return { success: true };
  });
