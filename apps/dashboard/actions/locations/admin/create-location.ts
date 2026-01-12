'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { locationSchema } from '~/schemas/locations/location-schema';

export const createLocation = authOrganizationActionClient
  .metadata({ actionName: 'createLocation' })
  .schema(locationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    const location = await prisma.location.create({
      data: {
        organizationId: ctx.organization.id,
        name: parsedInput.name,
        description: parsedInput.description || null,
        address: parsedInput.address,
        city: parsedInput.city,
        postalCode: parsedInput.postalCode || null,
        isActive: parsedInput.isActive ?? true,
      },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/locations`);

    return { location };
  });
