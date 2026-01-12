'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { cancelEventSchema } from '~/schemas/events/event-schema';

export const cancelEvent = authOrganizationActionClient
  .metadata({ actionName: 'cancelEvent' })
  .schema(cancelEventSchema)
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
      throw new Error('Event is already cancelled');
    }

    // Cancel event and deactivate ticket
    await prisma.$transaction([
      prisma.event.update({
        where: { id: parsedInput.eventId },
        data: {
          isCancelled: true,
          cancelledAt: new Date(),
          cancelReason: parsedInput.reason || null,
          isPublished: false,
        },
      }),
      prisma.ticket.update({
        where: { id: existingEvent.ticketId },
        data: { isActive: false },
      }),
    ]);

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);

    return { success: true };
  });
