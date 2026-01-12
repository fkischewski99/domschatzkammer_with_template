'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { refundTicketPurchase } from '@workspace/billing/tickets';
import { sendEventCancelledEmail } from '@workspace/email/send-event-cancelled-email';
import { APP_NAME } from '@workspace/common/app';
import { ForbiddenError, NotFoundError, PreConditionError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';

const RetryFailedRefundsSchema = z.object({
  eventId: z.string().uuid(),
  purchaseIds: z.array(z.string().uuid()).min(1),
});

type RetryResult = {
  purchaseId: string;
  success: boolean;
  error?: string;
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const retryFailedRefunds = authOrganizationActionClient
  .metadata({ actionName: 'retryFailedRefunds' })
  .schema(RetryFailedRefundsSchema)
  .action(async ({ parsedInput: { eventId, purchaseIds }, ctx }) => {
    // Authorization check
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    // Fetch event with organization
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: ctx.organization.id,
      },
      include: {
        organization: true,
        location: true,
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (!event.isCancelled) {
      throw new PreConditionError('Event is not cancelled');
    }

    if (!event.organization.stripeConnectAccountId) {
      throw new PreConditionError('Organization does not have Stripe Connect configured');
    }

    // Fetch the purchases to retry
    const purchases = await prisma.purchase.findMany({
      where: {
        id: { in: purchaseIds },
        organizationId: ctx.organization.id,
        status: 'COMPLETED', // Only retry COMPLETED purchases (not already refunded)
      },
      include: {
        ticket: true,
      },
    });

    if (purchases.length === 0) {
      throw new NotFoundError('No eligible purchases found to retry');
    }

    const results: RetryResult[] = [];
    let emailsSent = 0;

    for (const purchase of purchases) {
      if (!purchase.stripePaymentIntentId) {
        results.push({
          purchaseId: purchase.id,
          success: false,
          error: 'No payment intent found',
        });
        continue;
      }

      try {
        // Process refund
        await refundTicketPurchase({
          paymentIntentId: purchase.stripePaymentIntentId,
          connectedAccountId: event.organization.stripeConnectAccountId!,
          reason: 'requested_by_customer',
        });

        // Update purchase status
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'REFUNDED',
            invalidated: true,
            invalidatedAt: new Date(),
            invalidatedReason: 'Event cancelled',
          },
        });

        results.push({
          purchaseId: purchase.id,
          success: true,
        });

        // Send cancellation email
        try {
          await sendEventCancelledEmail({
            recipient: purchase.email,
            appName: APP_NAME,
            organizationName: event.organization.name,
            customerName: purchase.customerName ?? undefined,
            eventName: event.name,
            eventDate: event.startTime,
            locationName: event.location.name,
            ticketTypeName: purchase.ticket.name,
            ticketNumber: purchase.id,
            refundAmount: Number(purchase.totalAmount),
            currency: purchase.currency,
            cancellationReason: event.cancelReason ?? undefined,
            refundProcessed: true,
          });
          emailsSent++;
        } catch (emailError) {
          console.error(`Failed to send email to ${purchase.email}:`, emailError);
        }
      } catch (error) {
        results.push({
          purchaseId: purchase.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Rate limiting
      await delay(100);
    }

    // Revalidate paths
    revalidatePath(`/organizations/${ctx.organization.slug}/events`);
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/purchases`);

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return {
      success: failed.length === 0,
      results: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
      emailsSent,
      failedRefunds: failed.map((r) => ({
        purchaseId: r.purchaseId,
        error: r.error || 'Unknown error',
      })),
    };
  });
