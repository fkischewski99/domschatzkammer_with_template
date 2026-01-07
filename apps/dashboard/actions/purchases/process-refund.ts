'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { refundTicketPurchase } from '@workspace/billing/tickets';
import { sendRefundConfirmationEmail } from '@workspace/email/send-refund-confirmation-email';
import { APP_NAME } from '@workspace/common/app';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';
import { authOrganizationActionClient } from '~/actions/safe-action';
import { z } from 'zod';

const ProcessRefundSchema = z.object({
  purchaseId: z.string(),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
});

export const processRefund = authOrganizationActionClient
  .metadata({ actionName: 'processRefund' })
  .schema(ProcessRefundSchema)
  .action(async ({ parsedInput: { purchaseId, reason }, ctx }) => {
    // Authorization check (must be admin or owner)
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Only organization admins can process refunds');
    }

    try {
      // Fetch purchase with all related data
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          ticket: true,
          organization: true,
        },
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // Verify purchase belongs to the organization
      if (purchase.organizationId !== ctx.organization.id) {
        throw new ForbiddenError('Unauthorized access to purchase');
      }

      // Validate purchase can be refunded
      if (purchase.status === 'REFUNDED') {
        throw new Error('Purchase has already been refunded');
      }

      if (purchase.status !== 'COMPLETED') {
        throw new Error('Can only refund completed purchases');
      }

      if (!purchase.stripePaymentIntentId) {
        throw new Error('No payment intent found for this purchase');
      }

      if (!purchase.organization!.stripeConnectAccountId) {
        throw new Error('Organization does not have a Stripe Connect account');
      }

      // Process refund via Stripe
      const refund = await refundTicketPurchase({
        paymentIntentId: purchase.stripePaymentIntentId,
        connectedAccountId: purchase.organization!.stripeConnectAccountId,
        reason: reason ?? 'requested_by_customer',
      });

      // Update purchase record
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'REFUNDED',
          invalidated: true,
        },
      });

      // Send refund confirmation email
      await sendRefundConfirmationEmail({
        recipient: purchase.email,
        appName: APP_NAME,
        organizationName: purchase.organization!.name,
        customerName: purchase.customerName ?? undefined,
        ticketTypeName: purchase.ticket!.name,
        ticketNumber: purchase.id,
        refundAmount: Number(purchase.totalAmount),
        currency: purchase.currency,
        refundDate: new Date(),
      });

      // Revalidate paths
      revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/purchases`);
      revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/purchases/${purchaseId}`);

      return { success: true, refundId: refund.id };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  });
