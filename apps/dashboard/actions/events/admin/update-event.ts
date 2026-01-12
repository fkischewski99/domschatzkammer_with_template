'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { updateStripeProductForTicket } from '@workspace/billing/tickets';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { baseEventSchema } from '~/schemas/events/event-schema';

const updateEventSchema = baseEventSchema.extend({
  id: z.string().uuid(),
});

export const updateEvent = authOrganizationActionClient
  .metadata({ actionName: 'updateEvent' })
  .schema(updateEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    // Validate time constraints
    if (parsedInput.endTime <= parsedInput.startTime) {
      throw new Error('End time must be after start time.');
    }

    // Get existing event with ticket
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: parsedInput.id,
        organizationId: ctx.organization.id,
      },
      include: {
        ticket: true,
      },
    });

    if (!existingEvent) {
      throw new NotFoundError('Event not found');
    }

    if (existingEvent.isCancelled) {
      throw new Error('Cannot update a cancelled event');
    }

    // Verify location belongs to organization
    const location = await prisma.location.findFirst({
      where: {
        id: parsedInput.locationId,
        organizationId: ctx.organization.id,
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Update ticket
    await prisma.ticket.update({
      where: { id: existingEvent.ticketId },
      data: {
        name: parsedInput.name,
        description: parsedInput.description || null,
        features: parsedInput.ticketFeatures || [],
        stock: parsedInput.ticketStock ?? null,
        validFrom: parsedInput.startTime,
        validUntil: parsedInput.endTime,
        isActive: parsedInput.isPublished,
      },
    });

    // Update Stripe product if name or description changed
    if (
      existingEvent.ticket.name !== parsedInput.name ||
      existingEvent.ticket.description !== (parsedInput.description || null)
    ) {
      try {
        await updateStripeProductForTicket({
          ticketId: existingEvent.ticketId,
          name: parsedInput.name,
          description: parsedInput.description || undefined,
        });
      } catch (error) {
        console.error('Failed to update Stripe product:', error);
        // Don't throw - ticket is already updated in DB
      }
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: parsedInput.id },
      data: {
        locationId: parsedInput.locationId,
        name: parsedInput.name,
        description: parsedInput.description || null,
        startTime: parsedInput.startTime,
        endTime: parsedInput.endTime,
        coverImage: parsedInput.coverImage || null,
        isPublished: parsedInput.isPublished,
      },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);

    return { event };
  });
