'use server';

import { z } from 'zod';
import { getOrCreateConnectedAccount, createAccountLink } from '@workspace/billing/stripe-connect';
import { replaceOrgSlug, routes } from '@workspace/routes';
import { authOrganizationActionClient } from '~/actions/safe-action';

const setupStripeConnectSchema = z.object({
  country: z.string().length(2).optional() // ISO 3166-1 alpha-2 country code
});

/**
 * Initialize or retrieve Stripe Connect account and generate onboarding link
 * Server action for setting up Stripe Connect for ticket sales
 */
export const setupStripeConnect = authOrganizationActionClient
  .metadata({ actionName: 'setupStripeConnect' })
  .inputSchema(setupStripeConnectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { organization } = ctx;

    // Get or create the Stripe Connect account
    const account = await getOrCreateConnectedAccount({
      organizationId: organization.id,
      email: organization.email || undefined,
      country: parsedInput.country
    });

    // Generate the onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const orgPath = replaceOrgSlug(
      routes.dashboard.organizations.slug.settings.organization.Billing,
      organization.slug
    );

    const onboardingUrl = await createAccountLink({
      accountId: account.id,
      refreshUrl: `${baseUrl}/api/billing/connect/refresh?org=${organization.slug}`,
      returnUrl: `${baseUrl}/api/billing/connect/return?org=${organization.slug}`
    });

    return {
      accountId: account.id,
      onboardingUrl
    };
  });
