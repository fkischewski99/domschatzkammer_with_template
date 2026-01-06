import { randomUUID } from 'crypto';
import { prisma } from '@workspace/database/client';
import { enqueuePurchaseProcessing } from '../jobs';

export interface CreateTicketPurchaseParams {
  stripeSessionId: string;
  ticketId: string;
  organizationId: string;
  email: string;
  customerName?: string;
  customerPhone?: string;
  userId?: string;
  totalAmount: number;
  currency: string;
  stripePaymentIntentId?: string;
}

/**
 * Create a ticket purchase record and enqueue PDF generation/email delivery
 * Called from the Stripe webhook when checkout.session.completed for a ticket
 */
export async function createTicketPurchase(
  params: CreateTicketPurchaseParams
): Promise<void> {
  // Create purchase record
  const purchase = await prisma.purchase.create({
    data: {
      stripeSessionId: params.stripeSessionId,
      ticketId: params.ticketId,
      organizationId: params.organizationId,
      email: params.email,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      userId: params.userId,
      totalAmount: params.totalAmount,
      currency: params.currency,
      stripePaymentIntentId: params.stripePaymentIntentId,
      qrCode: randomUUID(),
      status: 'COMPLETED', // Payment is complete at this point
      purchasedAt: new Date(),
    },
  });

  console.log(`[create-ticket-purchase] Created purchase ${purchase.id} for session ${params.stripeSessionId}`);

  // Decrement ticket stock if applicable
  await prisma.ticket.updateMany({
    where: {
      id: params.ticketId,
      stock: { not: null, gt: 0 },
    },
    data: {
      stock: { decrement: 1 },
    },
  });

  // Enqueue background job to generate PDF and send email
  await enqueuePurchaseProcessing(purchase.id);

  console.log(`[create-ticket-purchase] Enqueued PDF generation for purchase ${purchase.id}`);
}
