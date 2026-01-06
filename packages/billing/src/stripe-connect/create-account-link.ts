import 'server-only';

import BillingProvider from '../provider/stripe';

/**
 * Create an onboarding link for a Stripe Connect account
 * This link allows the account holder to complete their account setup
 *
 * @param accountId - The Stripe Connect account ID
 * @param refreshUrl - URL to redirect to if the link expires
 * @param returnUrl - URL to redirect to after successful onboarding
 * @returns The account link URL
 */
export async function createAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = BillingProvider.getStripe();

  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  });

  console.log(`[stripe-connect] Created account link for account ${params.accountId}`);

  return accountLink.url;
}

/**
 * Create an account dashboard link for a connected account
 * This allows the account holder to access their Stripe dashboard
 */
export async function createLoginLink(accountId: string): Promise<string> {
  const stripe = BillingProvider.getStripe();

  const loginLink = await stripe.accounts.createLoginLink(accountId);

  console.log(`[stripe-connect] Created login link for account ${accountId}`);

  return loginLink.url;
}
