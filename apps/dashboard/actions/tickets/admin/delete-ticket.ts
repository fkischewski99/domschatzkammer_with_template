'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const deleteTicketSchema = z.object({
  id: z.string().uuid(),
});

export const deleteTicket = authOrganizationActionClient
  .metadata({ actionName: 'deleteTicket' })
  .schema(deleteTicketSchema)
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
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: parsedInput.id,
        organizationId: ctx.organization.id,
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Prevent deletion if purchases exist
    if (ticket._count.purchases > 0) {
      throw new Error(
        `Cannot delete ticket with ${ticket._count.purchases} purchase(s). Consider deactivating it instead.`
      );
    }

    // Delete ticket (Stripe product will remain, but that's okay)
    await prisma.ticket.delete({
      where: { id: parsedInput.id },
    });

    // Revalidate pages
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/tickets`);

    console.log(`[admin] User ${ctx.session.user.id} deleted ticket ${parsedInput.id}`);

    return { success: true };
  });
