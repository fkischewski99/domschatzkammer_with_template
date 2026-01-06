import type PgBoss from 'pg-boss';
import { prisma } from '@workspace/database/client';
import { sendPurchaseConfirmationEmail } from '@workspace/email/send-purchase-confirmation-email';
import { sendRefundConfirmationEmail } from '@workspace/email/send-refund-confirmation-email';
import { generateTicketPDF } from '../../pdf/generate-ticket-pdf';

export interface WebhookJobPayload {
  type: 'checkout.session.completed' | 'payment_intent.succeeded' | 'charge.refunded';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  purchaseId?: string;
}

/**
 * Process Stripe webhook events in the background
 * This ensures webhook handling is reliable and doesn't block the webhook endpoint
 */
export async function processWebhookHandler(
  job: PgBoss.Job<WebhookJobPayload>
): Promise<void> {
  const { type, stripeSessionId, stripePaymentIntentId, purchaseId } = job.data;

  try {
    switch (type) {
      case 'checkout.session.completed':
        if (!stripeSessionId) {
          throw new Error('Missing stripeSessionId for checkout.session.completed');
        }
        await handleCheckoutSessionCompleted(stripeSessionId);
        break;

      case 'payment_intent.succeeded':
        if (!stripePaymentIntentId) {
          throw new Error('Missing stripePaymentIntentId for payment_intent.succeeded');
        }
        await handlePaymentIntentSucceeded(stripePaymentIntentId);
        break;

      case 'charge.refunded':
        if (!purchaseId) {
          throw new Error('Missing purchaseId for charge.refunded');
        }
        await handleChargeRefunded(purchaseId);
        break;

      default:
        throw new Error(`Unknown webhook type: ${type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook job ${job.id}:`, error);
    throw error; // Re-throw to trigger pg-boss retry mechanism
  }
}

/**
 * Handle checkout.session.completed event
 * Updates purchase status and sends confirmation email with PDF
 */
async function handleCheckoutSessionCompleted(stripeSessionId: string): Promise<void> {
  const purchase = await prisma.purchase.findUnique({
    where: { stripeSessionId },
    include: {
      ticket: true,
      organization: true,
    },
  });

  if (!purchase) {
    throw new Error(`Purchase not found for Stripe session: ${stripeSessionId}`);
  }

  // Update purchase status to completed
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { status: 'COMPLETED' },
  });

  // Generate PDF ticket
  const pdfBuffer = await generateTicketPDF({
    purchaseId: purchase.id,
    ticketId: purchase.ticketId,
    organizationId: purchase.organizationId,
    qrCode: purchase.qrCode,
    organizationName: purchase.organization.name,
    organizationLogo: purchase.organization.logo ?? undefined,
    ticketTypeName: purchase.ticket.name,
    customerName: purchase.customerName ?? 'Valued Customer',
    customerEmail: purchase.email,
    purchaseDate: purchase.purchasedAt,
    totalAmount: purchase.totalAmount.toNumber(),
    currency: purchase.currency,
    ticketFeatures: Array.isArray(purchase.ticket.features)
      ? purchase.ticket.features as string[]
      : [],
    validFrom: purchase.ticket.validFrom ?? undefined,
    validUntil: purchase.ticket.validUntil ?? undefined,
  });

  // Send confirmation email with PDF attachment
  await sendPurchaseConfirmationEmail({
    recipient: purchase.email,
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Our Platform',
    organizationName: purchase.organization.name,
    customerName: purchase.customerName ?? 'Valued Customer',
    ticketTypeName: purchase.ticket.name,
    ticketNumber: purchase.id,
    purchaseDate: purchase.purchasedAt,
    totalAmount: purchase.totalAmount.toNumber(),
    currency: purchase.currency,
    downloadLink: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${purchase.id}/download`,
    isComplimentary: false,
    pdfAttachment: {
      filename: `ticket-${purchase.id}.pdf`,
      content: pdfBuffer,
    },
  });
}

/**
 * Handle payment_intent.succeeded event
 * Additional processing after payment succeeds
 */
async function handlePaymentIntentSucceeded(stripePaymentIntentId: string): Promise<void> {
  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId },
    include: { ticket: true },
  });

  if (!purchase) {
    console.warn(`Purchase not found for payment intent: ${stripePaymentIntentId}`);
    return;
  }

  // Update stock if ticket has limited quantity
  if (purchase.ticket.stock !== null) {
    await prisma.ticket.update({
      where: { id: purchase.ticketId },
      data: { stock: { decrement: 1 } },
    });
  }
}

/**
 * Handle charge.refunded event
 * Updates purchase status and sends refund confirmation email
 */
async function handleChargeRefunded(purchaseId: string): Promise<void> {
  const purchase = await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      status: 'REFUNDED',
      invalidated: true,
      invalidatedAt: new Date(),
      invalidatedReason: 'Payment refunded',
    },
    include: {
      ticket: true,
      organization: true,
    },
  });

  // Restore stock if ticket has limited quantity
  if (purchase.ticket.stock !== null) {
    await prisma.ticket.update({
      where: { id: purchase.ticketId },
      data: { stock: { increment: 1 } },
    });
  }

  // Send refund confirmation email
  await sendRefundConfirmationEmail({
    recipient: purchase.email,
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Our Platform',
    organizationName: purchase.organization.name,
    customerName: purchase.customerName ?? 'Valued Customer',
    ticketTypeName: purchase.ticket.name,
    ticketNumber: purchase.id,
    refundAmount: purchase.totalAmount.toNumber(),
    refundDate: new Date(),
    currency: purchase.currency,
    refundReason: 'Payment refunded',
  });
}
