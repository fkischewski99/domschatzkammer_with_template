'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const toggleTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  isActive: z.boolean(),
});

export const toggleTicketStatus = authOrganizationActionClient
  .metadata({ actionName: 'toggleTicketStatus' })
  .schema(toggleTicketStatusSchema)
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
        id: parsedInput.ticketId,
        organizationId: ctx.organization.id,
      },
    });

    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    // Update ticket status
    const ticket = await prisma.ticket.update({
      where: { id: parsedInput.ticketId },
      data: {
        isActive: parsedInput.isActive,
      },
    });

    // Revalidate pages
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/tickets`);
    revalidatePath(`/organizations/${ctx.organization.slug}/tickets`);

    console.log(
      `[admin] User ${ctx.session.user.id} ${parsedInput.isActive ? 'activated' : 'deactivated'} ticket ${ticket.id}`
    );

    return { ticket };
  });
