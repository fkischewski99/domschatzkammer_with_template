'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { sendGuideEventCancelledEmail } from '@workspace/email/send-guide-event-cancelled-email';
import { APP_NAME } from '@workspace/common/app';
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
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
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

    // Notify assigned guide if there is one
    if (existingEvent.guide?.email) {
      try {
        await sendGuideEventCancelledEmail({
          recipient: existingEvent.guide.email,
          appName: APP_NAME,
          organizationName: ctx.organization.name,
          guideName: existingEvent.guide.name ?? undefined,
          eventName: existingEvent.name,
          eventDate: existingEvent.startTime,
          locationName: existingEvent.location?.name ?? undefined,
          cancellationReason: parsedInput.reason ?? undefined,
        });
      } catch (error) {
        console.error('Failed to send guide notification email:', error);
        // Don't fail the action if email fails
      }
    }

    return { success: true };
  });
