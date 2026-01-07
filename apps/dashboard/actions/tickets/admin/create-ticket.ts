'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { createStripeProductForTicket } from '@workspace/billing/tickets';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { ticketSchema } from '~/schemas/tickets/ticket-schema';

export const createTicket = authOrganizationActionClient
  .metadata({ actionName: 'createTicket' })
  .schema(ticketSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Authorization check (must be admin or owner)
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    // Check if organization has Stripe Connect account
    if (!ctx.organization.stripeConnectAccountId) {
      throw new Error('Organization must complete Stripe Connect onboarding before creating tickets');
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        organizationId: ctx.organization.id,
        name: parsedInput.name,
        description: parsedInput.description || null,
        price: parsedInput.price,
        currency: parsedInput.currency,
        features: parsedInput.features || [],
        stock: parsedInput.stock ?? null,
        validFrom: parsedInput.validFrom ?? null,
        validUntil: parsedInput.validUntil ?? null,
        isActive: parsedInput.isActive ?? true,
      },
    });

    // Create Stripe product and price
    try {
      await createStripeProductForTicket(ticket.id);
    } catch (error) {
      // Rollback: delete ticket if Stripe creation fails
      await prisma.ticket.delete({ where: { id: ticket.id } });
      throw new Error(
        `Failed to create Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Revalidate pages
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/tickets`);

    console.log(`[admin] User ${ctx.session.user.id} created ticket ${ticket.id} for organization ${ctx.organization.id}`);

    return { ticket };
  });
