'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { locationSchema } from '~/schemas/locations/location-schema';

const updateLocationSchema = locationSchema.extend({
  id: z.string().uuid(),
});

export const updateLocation = authOrganizationActionClient
  .metadata({ actionName: 'updateLocation' })
  .schema(updateLocationSchema)
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
    });

    if (!existingLocation) {
      throw new NotFoundError('Location not found');
    }

    const location = await prisma.location.update({
      where: { id: parsedInput.id },
      data: {
        name: parsedInput.name,
        description: parsedInput.description || null,
        address: parsedInput.address,
        city: parsedInput.city,
        postalCode: parsedInput.postalCode || null,
        isActive: parsedInput.isActive,
        color: parsedInput.color || null,
      },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/locations`);

    return { location };
  });
