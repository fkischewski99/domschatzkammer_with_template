'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@workspace/database/client';
import { enqueuePurchaseProcessing } from '@workspace/billing/jobs';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';
import { authOrganizationActionClient } from '~/actions/safe-action';
import { z } from 'zod';

const IssueComplimentaryTicketSchema = z.object({
  ticketId: z.string().uuid(),
  email: z.string().email(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  reason: z.string().optional(),
});

export const issueComplimentaryTicket = authOrganizationActionClient
  .metadata({ actionName: 'issueComplimentaryTicket' })
  .schema(IssueComplimentaryTicketSchema)
  .action(async ({ parsedInput: { ticketId, email, customerName, customerPhone, reason }, ctx }) => {
    // Authorization check (must be admin or owner)
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Only organization admins can issue complimentary tickets');
    }

    try {
      // Fetch ticket to validate it exists and belongs to this organization
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: ticketId,
          organizationId: ctx.organization.id,
          isActive: true,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found or not active');
      }

      // Check stock availability
      if (ticket.stock !== null && ticket.stock <= 0) {
        throw new Error('Ticket is sold out');
      }

      // Generate a unique session ID for complimentary purchases
      const complimentarySessionId = `complimentary_${uuidv4()}`;

      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          stripeSessionId: complimentarySessionId,
          ticketId: ticket.id,
          organizationId: ctx.organization.id,
          email,
          customerName,
          customerPhone,
          totalAmount: 0, // Complimentary - no payment
          currency: ticket.currency,
          status: 'COMPLETED',
          purchasedAt: new Date(),
          metadata: {
            isComplimentary: true,
            issuedBy: ctx.session.user.id,
            issuedAt: new Date().toISOString(),
            reason: reason || 'Complimentary ticket issued by admin',
          },
        },
      });

      console.log(`[issue-complimentary-ticket] Created complimentary purchase ${purchase.id} for ticket ${ticketId}`);

      // Decrement ticket stock if applicable
      if (ticket.stock !== null) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { stock: { decrement: 1 } },
        });
      }

      // Enqueue background job to generate PDF and send email
      await enqueuePurchaseProcessing(purchase.id);

      console.log(`[issue-complimentary-ticket] Enqueued PDF generation for purchase ${purchase.id}`);

      // Revalidate paths
      revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/purchases`);

      return {
        success: true,
        purchaseId: purchase.id,
        message: `Complimentary ticket issued to ${email}`,
      };
    } catch (error) {
      console.error('Error issuing complimentary ticket:', error);
      throw error;
    }
  });
