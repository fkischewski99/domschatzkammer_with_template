'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { createStripeProductForTicket } from '@workspace/billing/tickets';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { baseEventSchema } from '~/schemas/events/event-schema';

export const createEvent = authOrganizationActionClient
  .metadata({ actionName: 'createEvent' })
  .schema(baseEventSchema)
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
    if (parsedInput.startTime <= new Date()) {
      throw new Error('Start time must be in the future.');
    }

    // Check if organization has Stripe Connect account (skip in development)
    const hasStripeConnect = !!ctx.organization.stripeConnectAccountId;
    if (!hasStripeConnect && process.env.NODE_ENV === 'production') {
      throw new Error('Organization must complete Stripe Connect onboarding before creating events');
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

    // Create ticket first
    const ticket = await prisma.ticket.create({
      data: {
        organizationId: ctx.organization.id,
        name: parsedInput.name,
        description: parsedInput.description || null,
        price: parsedInput.ticketPrice,
        currency: parsedInput.ticketCurrency,
        features: parsedInput.ticketFeatures || [],
        stock: parsedInput.ticketStock ?? null,
        validFrom: parsedInput.startTime,
        validUntil: parsedInput.endTime,
        isActive: parsedInput.isPublished,
      },
    });

    // Create Stripe product for the ticket (only if Stripe Connect is set up)
    if (hasStripeConnect) {
      try {
        await createStripeProductForTicket(ticket.id);
      } catch (error) {
        // Rollback: delete ticket if Stripe creation fails
        await prisma.ticket.delete({ where: { id: ticket.id } });
        throw new Error(
          `Failed to create Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Create event linked to ticket
    const event = await prisma.event.create({
      data: {
        organizationId: ctx.organization.id,
        ticketId: ticket.id,
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
