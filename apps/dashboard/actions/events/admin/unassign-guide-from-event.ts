'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const unassignGuideSchema = z.object({
  eventId: z.string().uuid(),
});

export const unassignGuideFromEvent = authOrganizationActionClient
  .metadata({ actionName: 'unassignGuideFromEvent' })
  .schema(unassignGuideSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    // Verify event exists and belongs to organization
    const event = await prisma.event.findFirst({
      where: {
        id: parsedInput.eventId,
        organizationId: ctx.organization.id,
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Remove guide assignment
    const updatedEvent = await prisma.event.update({
      where: { id: parsedInput.eventId },
      data: { guideId: null },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);
    revalidatePath(`/organizations/${ctx.organization.slug}/events/${parsedInput.eventId}`);

    return { event: updatedEvent };
  });
