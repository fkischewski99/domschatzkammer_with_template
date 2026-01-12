'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const updateEventTimeSchema = z.object({
  eventId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const updateEventTime = authOrganizationActionClient
  .metadata({ actionName: 'updateEventTime' })
  .schema(updateEventTimeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    const startTime = new Date(parsedInput.startTime);
    const endTime = new Date(parsedInput.endTime);

    // Validate time constraints
    if (endTime <= startTime) {
      throw new Error('End time must be after start time.');
    }

    // Get existing event
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
      throw new Error('Cannot update a cancelled event');
    }

    // Update event and ticket times
    const [event] = await prisma.$transaction([
      prisma.event.update({
        where: { id: parsedInput.eventId },
        data: {
          startTime,
          endTime,
        },
      }),
      prisma.ticket.update({
        where: { id: existingEvent.ticketId },
        data: {
          validFrom: startTime,
          validUntil: endTime,
        },
      }),
    ]);

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);

    return { event };
  });
