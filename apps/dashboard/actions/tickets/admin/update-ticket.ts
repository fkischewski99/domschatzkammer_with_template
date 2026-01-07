'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@workspace/database/client';
import { updateStripeProductForTicket } from '@workspace/billing/tickets';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { ticketSchema } from '~/schemas/tickets/ticket-schema';

const updateTicketSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .trim()
    .min(1, 'Ticket name is required.')
    .max(255, 'Maximum 255 characters allowed.'),

  description: z.string()
    .trim()
    .max(10000, 'Maximum 10,000 characters allowed.')
    .optional()
    .or(z.literal('')),

  price: z.coerce.number()
    .min(0, 'Price must be 0 or greater.')
    .max(99999999.99, 'Price is too high.'),

  currency: z.string()
    .length(3, 'Currency must be a 3-character ISO code.')
    .default('EUR'),

  features: z.array(z.string())
    .max(20, 'Maximum 20 features allowed.')
    .default([]),

  stock: z.coerce.number()
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.')
    .nullable()
    .optional(),

  validFrom: z.coerce.date()
    .nullable()
    .optional(),

  validUntil: z.coerce.date()
    .nullable()
    .optional(),

  isActive: z.boolean()
    .default(true),
}).refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return data.validUntil > data.validFrom;
    }
    return true;
  },
  {
    message: 'Valid until date must be after valid from date.',
    path: ['validUntil'],
  }
);

export const updateTicket = authOrganizationActionClient
  .metadata({ actionName: 'updateTicket' })
  .schema(updateTicketSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Authorization check
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );
    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    // Verify ticket belongs to organization
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        id: parsedInput.id,
        organizationId: ctx.organization.id,
      },
    });

    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    // Update ticket
    const ticket = await prisma.ticket.update({
      where: { id: parsedInput.id },
      data: {
        name: parsedInput.name,
        description: parsedInput.description || null,
        price: parsedInput.price,
        currency: parsedInput.currency,
        features: parsedInput.features || [],
        stock: parsedInput.stock ?? null,
        validFrom: parsedInput.validFrom ?? null,
        validUntil: parsedInput.validUntil ?? null,
        isActive: parsedInput.isActive,
      },
    });

    // Update Stripe product if name or description changed
    if (
      ticket.stripeProductId &&
      (existingTicket.name !== parsedInput.name || existingTicket.description !== parsedInput.description)
    ) {
      try {
        await updateStripeProductForTicket({
          ticketId: ticket.id,
          name: parsedInput.name,
          description: parsedInput.description || undefined,
        });
      } catch (error) {
        console.error('[admin] Failed to update Stripe product:', error);
        // Don't fail the whole operation if Stripe update fails
      }
    }

    // Revalidate pages
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/tickets`);
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/tickets/${ticket.id}`);

    console.log(`[admin] User ${ctx.session.user.id} updated ticket ${ticket.id}`);

    return { ticket };
  });
