'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const togglePublishSchema = z.object({
  eventId: z.string().uuid(),
  isPublished: z.boolean(),
});

export const toggleEventPublish = authOrganizationActionClient
  .metadata({ actionName: 'toggleEventPublish' })
  .schema(togglePublishSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    const existingEvent = await prisma.event.findFirst({
      where: {
        id: parsedInput.eventId,
        organizationId: ctx.organization.id,
      },
    });

    if (!existingEvent) {
      throw new NotFoundError('Event not found');
    }

    if (existingEvent.isCancelled) {
      throw new Error('Cannot publish a cancelled event');
    }

    // Update both event and linked ticket
    await prisma.$transaction([
      prisma.event.update({
        where: { id: parsedInput.eventId },
        data: { isPublished: parsedInput.isPublished },
      }),
      prisma.ticket.update({
        where: { id: existingEvent.ticketId },
        data: { isActive: parsedInput.isPublished },
      }),
    ]);

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);

    return { success: true };
  });
