import 'server-only';

import { Stripe } from 'stripe';
import BillingProvider from '../provider/stripe';

/**
 * Process a refund for a ticket purchase via Stripe Connect
 *
 * @param params - Refund parameters
 * @returns The Stripe Refund object
 */
export async function refundTicketPurchase(params: {
  paymentIntentId: string;
  connectedAccountId: string;
  amount?: number; // Amount in cents, omit for full refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}): Promise<Stripe.Refund> {
  const stripe = BillingProvider.getStripe();

  // Create refund on the connected account
  const refund = await stripe.refunds.create(
    {
      payment_intent: params.paymentIntentId,
      amount: params.amount, // undefined = full refund
      reason: params.reason,
    },
    {
      stripeAccount: params.connectedAccountId,
    }
  );

  return refund;
}
