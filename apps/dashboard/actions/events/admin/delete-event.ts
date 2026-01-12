'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError, ValidationError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const deleteEventSchema = z.object({
  id: z.string().uuid(),
});

export const deleteEvent = authOrganizationActionClient
  .metadata({ actionName: 'deleteEvent' })
  .schema(deleteEventSchema)
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
        id: parsedInput.id,
        organizationId: ctx.organization.id,
      },
      include: {
        ticket: {
          include: {
            _count: {
              select: { purchases: true },
            },
          },
        },
      },
    });

    if (!existingEvent) {
      throw new NotFoundError('Event not found');
    }

    if (existingEvent.ticket._count.purchases > 0) {
      throw new ValidationError(
        `Cannot delete event with ${existingEvent.ticket._count.purchases} ticket purchase(s). Consider cancelling the event instead.`
      );
    }

    // Delete event (cascades to ticket via onDelete: Cascade)
    await prisma.event.delete({
      where: { id: parsedInput.id },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);

    return { success: true };
  });
