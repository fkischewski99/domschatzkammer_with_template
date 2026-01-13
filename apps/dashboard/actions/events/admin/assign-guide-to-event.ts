'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { Role } from '@workspace/database';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const assignGuideSchema = z.object({
  eventId: z.string().uuid(),
  guideId: z.string().uuid(),
});

export const assignGuideToEvent = authOrganizationActionClient
  .metadata({ actionName: 'assignGuideToEvent' })
  .schema(assignGuideSchema)
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

    if (event.isCancelled) {
      throw new Error('Cannot assign a guide to a cancelled event');
    }

    // Verify guide exists and has GUIDE role in this organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: parsedInput.guideId,
        organizationId: ctx.organization.id,
        role: Role.GUIDE,
      },
    });

    if (!membership) {
      throw new NotFoundError('Guide not found or user is not a guide');
    }

    // Assign the guide
    const updatedEvent = await prisma.event.update({
      where: { id: parsedInput.eventId },
      data: { guideId: parsedInput.guideId },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);
    revalidatePath(`/organizations/${ctx.organization.slug}/events/${parsedInput.eventId}`);

    return { event: updatedEvent };
  });
