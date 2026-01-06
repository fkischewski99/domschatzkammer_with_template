import 'server-only';

import { Stripe } from 'stripe';
import { prisma } from '@workspace/database/client';
import BillingProvider from '../provider/stripe';

/**
 * Create a Stripe Connect Express account for an organization
 * This allows the organization to receive payments directly
 *
 * @param organizationId - The organization ID
 * @param params - Additional account parameters (country, email, etc.)
 * @returns The created Stripe account
 */
export async function createConnectedAccount(params: {
  organizationId: string;
  email: string;
  country?: string;
}): Promise<Stripe.Account> {
  const stripe = BillingProvider.getStripe();

  // Check if organization already has a connected account
  const organization = await prisma.organization.findUnique({
    where: { id: params.organizationId },
    select: { stripeConnectAccountId: true },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  if (organization.stripeConnectAccountId) {
    throw new Error('Organization already has a Stripe Connect account');
  }

  // Create Stripe Connect Express account
  const account = await stripe.accounts.create({
    type: 'express',
    country: params.country || 'DE', // Default to Germany
    email: params.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'company',
    settings: {
      payouts: {
        schedule: {
          interval: 'manual', // Manual payouts for better control
        },
      },
    },
  });

  // Save the account ID to the organization
  await prisma.organization.update({
    where: { id: params.organizationId },
    data: {
      stripeConnectAccountId: account.id,
    },
  });

  console.log(`[stripe-connect] Created account ${account.id} for organization ${params.organizationId}`);

  return account;
}

/**
 * Get or create a connected account for an organization
 * If the account already exists, return it; otherwise create a new one
 */
export async function getOrCreateConnectedAccount(params: {
  organizationId: string;
  email: string;
  country?: string;
}): Promise<Stripe.Account> {
  const organization = await prisma.organization.findUnique({
    where: { id: params.organizationId },
    select: { stripeConnectAccountId: true },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // If account already exists, fetch and return it
  if (organization.stripeConnectAccountId) {
    const stripe = BillingProvider.getStripe();
    return await stripe.accounts.retrieve(organization.stripeConnectAccountId);
  }

  // Otherwise create a new account
  return await createConnectedAccount(params);
}
