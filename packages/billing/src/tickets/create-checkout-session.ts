import 'server-only';

import { Stripe } from 'stripe';
import { prisma } from '@workspace/database/client';
import BillingProvider from '../provider/stripe';

/**
 * Create a Stripe Checkout session for a ticket purchase
 * Uses Stripe Connect to process payment on the organization's connected account
 *
 * @param params - Checkout session parameters
 * @returns The Stripe Checkout session
 */
export async function createTicketCheckoutSession(params: {
  ticketId: string;
  email: string;
  customerName?: string;
  customerPhone?: string;
  userId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = BillingProvider.getStripe();

  // Fetch ticket with organization
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.ticketId },
    include: {
      organization: {
        select: {
          id: true,
          stripeConnectAccountId: true,
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error(`Ticket ${params.ticketId} not found`);
  }

  if (!ticket.isActive) {
    throw new Error('Ticket is not active');
  }

  // Check stock availability
  if (ticket.stock !== null && ticket.stock <= 0) {
    throw new Error('Ticket is sold out');
  }

  // Check validity period
  const now = new Date();
  if (ticket.validFrom && now < ticket.validFrom) {
    throw new Error('Ticket is not yet valid');
  }
  if (ticket.validUntil && now > ticket.validUntil) {
    throw new Error('Ticket has expired');
  }

  if (!ticket.organization.stripeConnectAccountId) {
    throw new Error('Organization must complete Stripe Connect onboarding before selling tickets');
  }

  if (!ticket.stripePriceId) {
    throw new Error('Ticket does not have a Stripe price configured');
  }

  // Calculate application fee (platform fee - e.g., 10% of ticket price)
  const applicationFeeAmount = Math.round(Number(ticket.price) * 100 * 0.10); // 10% platform fee

  // Create checkout session on the connected account
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: ticket.stripePriceId,
        quantity: 1,
      },
    ],
    customer_email: params.email,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      ticketId: params.ticketId,
      organizationId: ticket.organizationId,
      userId: params.userId || '',
      customerName: params.customerName || '',
      customerPhone: params.customerPhone || '',
      ...params.metadata,
    },
    payment_intent_data: {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: ticket.organization.stripeConnectAccountId,
      },
    },
  });

  console.log(`[tickets] Created checkout session ${session.id} for ticket ${params.ticketId}`);

  return session;
}
