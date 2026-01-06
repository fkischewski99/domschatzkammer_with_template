import 'server-only';

import { Stripe } from 'stripe';
import { prisma } from '@workspace/database/client';
import BillingProvider from '../provider/stripe';

/**
 * Create a Stripe product and price for a ticket
 * This should be called when a new ticket is created
 *
 * @param ticketId - The ticket ID
 * @returns The created Stripe product and price
 */
export async function createStripeProductForTicket(ticketId: string): Promise<{
  product: Stripe.Product;
  price: Stripe.Price;
}> {
  const stripe = BillingProvider.getStripe();

  // Fetch ticket with organization
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      organization: {
        select: {
          stripeConnectAccountId: true,
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found`);
  }

  if (!ticket.organization.stripeConnectAccountId) {
    throw new Error('Organization must have a Stripe Connect account before creating tickets');
  }

  if (ticket.stripeProductId) {
    throw new Error(`Ticket ${ticketId} already has a Stripe product`);
  }

  // Create product on the connected account
  const product = await stripe.products.create({
    name: ticket.name,
    description: ticket.description || undefined,
    metadata: {
      organizationId: ticket.organizationId,
      ticketId: ticket.id,
    },
  }, {
    stripeAccount: ticket.organization.stripeConnectAccountId,
  });

  // Create price (one-time payment)
  const price = await stripe.prices.create({
    product: product.id,
    currency: ticket.currency.toLowerCase(),
    unit_amount: Math.round(Number(ticket.price) * 100), // Convert to cents
    metadata: {
      ticketId: ticket.id,
    },
  }, {
    stripeAccount: ticket.organization.stripeConnectAccountId,
  });

  // Update ticket with Stripe IDs
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      stripeProductId: product.id,
      stripePriceId: price.id,
    },
  });

  console.log(`[tickets] Created Stripe product ${product.id} and price ${price.id} for ticket ${ticketId}`);

  return { product, price };
}

/**
 * Update a Stripe product for a ticket
 * Note: Prices cannot be updated, only archived and replaced
 */
export async function updateStripeProductForTicket(params: {
  ticketId: string;
  name?: string;
  description?: string;
}): Promise<Stripe.Product> {
  const stripe = BillingProvider.getStripe();

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.ticketId },
    include: {
      organization: {
        select: {
          stripeConnectAccountId: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error(`Ticket ${params.ticketId} not found`);
  }

  if (!ticket.stripeProductId) {
    throw new Error(`Ticket ${params.ticketId} does not have a Stripe product`);
  }

  if (!ticket.organization.stripeConnectAccountId) {
    throw new Error('Organization must have a Stripe Connect account');
  }

  // Update product
  const product = await stripe.products.update(
    ticket.stripeProductId,
    {
      name: params.name,
      description: params.description || undefined,
    },
    {
      stripeAccount: ticket.organization.stripeConnectAccountId,
    }
  );

  console.log(`[tickets] Updated Stripe product ${product.id} for ticket ${params.ticketId}`);

  return product;
}
