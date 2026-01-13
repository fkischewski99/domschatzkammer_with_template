'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { refundTicketPurchase } from '@workspace/billing/tickets';
import { sendEventCancelledEmail } from '@workspace/email/send-event-cancelled-email';
import { sendGuideEventCancelledEmail } from '@workspace/email/send-guide-event-cancelled-email';
import { APP_NAME } from '@workspace/common/app';
import { ForbiddenError, NotFoundError, PreConditionError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { cancelEventSchema } from '~/schemas/events/event-schema';
import {
  getEventPurchasesForRefund,
  type PurchaseForRefund,
} from '~/data/events/get-event-purchases-for-refund';

type RefundResult = {
  purchaseId: string;
  success: boolean;
  error?: string;
  refundId?: string;
};

type CancelEventWithRefundsResult = {
  success: boolean;
  eventCancelled: boolean;
  refundResults: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    totalRefundedAmount: number;
  };
  emailsSent: number;
  failedRefunds: Array<{ purchaseId: string; error: string }>;
};

async function processRefundForPurchase(
  purchase: PurchaseForRefund,
  connectedAccountId: string
): Promise<RefundResult> {
  // Skip free tickets (no payment intent)
  if (!purchase.stripePaymentIntentId) {
    return {
      purchaseId: purchase.id,
      success: true,
      // No refund needed for free tickets, but we'll mark it as success
    };
  }

  try {
    const refund = await refundTicketPurchase({
      paymentIntentId: purchase.stripePaymentIntentId,
      connectedAccountId,
      reason: 'requested_by_customer',
    });

    return {
      purchaseId: purchase.id,
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    return {
      purchaseId: purchase.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const cancelEventWithRefunds = authOrganizationActionClient
  .metadata({ actionName: 'cancelEventWithRefunds' })
  .schema(cancelEventSchema)
  .action(async ({ parsedInput, ctx }): Promise<CancelEventWithRefundsResult> => {
    // Authorization check
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    // Fetch event and purchases
    const data = await getEventPurchasesForRefund(parsedInput.eventId, ctx.organization.id);

    if (!data) {
      throw new NotFoundError('Event not found');
    }

    // Check if event is already cancelled and get guide info
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
      },
    });

    if (existingEvent?.isCancelled) {
      throw new PreConditionError('Event is already cancelled');
    }

    // Check for Stripe Connect if there are paid purchases
    if (data.paidCount > 0 && !data.organization.stripeConnectAccountId) {
      throw new PreConditionError(
        'Organization does not have Stripe Connect configured. Cannot process refunds.'
      );
    }

    const refundResults: RefundResult[] = [];
    let totalRefundedAmount = 0;

    // Process refunds for each purchase
    for (const purchase of data.purchases) {
      if (purchase.stripePaymentIntentId && data.organization.stripeConnectAccountId) {
        const result = await processRefundForPurchase(
          purchase,
          data.organization.stripeConnectAccountId
        );
        refundResults.push(result);

        if (result.success && result.refundId) {
          totalRefundedAmount += purchase.totalAmount;
        }

        // Rate limiting: 100ms delay between Stripe calls
        await delay(100);
      } else {
        // Free ticket - mark as skipped (will be handled in DB update)
        refundResults.push({
          purchaseId: purchase.id,
          success: true,
        });
      }
    }

    const successfulRefunds = refundResults.filter((r) => r.success && r.refundId);
    const failedRefunds = refundResults.filter((r) => !r.success);
    const skippedRefunds = refundResults.filter((r) => r.success && !r.refundId);

    // Update database in a transaction
    await prisma.$transaction(async (tx) => {
      // Cancel the event
      await tx.event.update({
        where: { id: parsedInput.eventId },
        data: {
          isCancelled: true,
          cancelledAt: new Date(),
          cancelReason: parsedInput.reason || null,
          isPublished: false,
        },
      });

      // Deactivate the ticket
      await tx.ticket.update({
        where: { id: existingEvent!.ticketId },
        data: { isActive: false },
      });

      // Update successful refunds
      for (const result of successfulRefunds) {
        await tx.purchase.update({
          where: { id: result.purchaseId },
          data: {
            status: 'REFUNDED',
            invalidated: true,
            invalidatedAt: new Date(),
            invalidatedReason: 'Event cancelled',
          },
        });
      }

      // Update free tickets (cancelled, not refunded)
      for (const result of skippedRefunds) {
        await tx.purchase.update({
          where: { id: result.purchaseId },
          data: {
            status: 'CANCELLED',
            invalidated: true,
            invalidatedAt: new Date(),
            invalidatedReason: 'Event cancelled',
          },
        });
      }
    });

    // Send cancellation emails
    let emailsSent = 0;
    for (const purchase of data.purchases) {
      const wasRefunded = successfulRefunds.some((r) => r.purchaseId === purchase.id);
      const wasFailed = failedRefunds.some((r) => r.purchaseId === purchase.id);

      // Don't send email if refund failed (they'll get email when retry succeeds)
      if (wasFailed) {
        continue;
      }

      try {
        await sendEventCancelledEmail({
          recipient: purchase.email,
          appName: APP_NAME,
          organizationName: data.organization.name,
          customerName: purchase.customerName ?? undefined,
          eventName: data.event.name,
          eventDate: data.event.startTime,
          locationName: data.event.location.name,
          ticketTypeName: purchase.ticket.name,
          ticketNumber: purchase.id,
          refundAmount: wasRefunded ? purchase.totalAmount : undefined,
          currency: wasRefunded ? purchase.currency : undefined,
          cancellationReason: parsedInput.reason ?? undefined,
          refundProcessed: wasRefunded,
        });
        emailsSent++;
      } catch (error) {
        console.error(`Failed to send cancellation email to ${purchase.email}:`, error);
      }

      // Small delay to avoid overwhelming email provider
      await delay(50);
    }

    // Notify assigned guide if there is one
    if (existingEvent?.guide?.email) {
      try {
        await sendGuideEventCancelledEmail({
          recipient: existingEvent.guide.email,
          appName: APP_NAME,
          organizationName: data.organization.name,
          guideName: existingEvent.guide.name ?? undefined,
          eventName: data.event.name,
          eventDate: data.event.startTime,
          locationName: data.event.location?.name ?? undefined,
          cancellationReason: parsedInput.reason ?? undefined,
        });
      } catch (error) {
        console.error('Failed to send guide notification email:', error);
        // Don't fail the action if email fails
      }
    }

    // Revalidate paths
    revalidatePath(`/organizations/${ctx.organization.slug}/events`);
    revalidatePath(`/organizations/${ctx.organization.slug}/events/${parsedInput.eventId}`);
    revalidatePath(`/organizations/${ctx.organization.slug}/settings/organization/purchases`);

    return {
      success: failedRefunds.length === 0,
      eventCancelled: true,
      refundResults: {
        total: data.count,
        successful: successfulRefunds.length,
        failed: failedRefunds.length,
        skipped: skippedRefunds.length,
        totalRefundedAmount,
      },
      emailsSent,
      failedRefunds: failedRefunds.map((r) => ({
        purchaseId: r.purchaseId,
        error: r.error || 'Unknown error',
      })),
    };
  });
