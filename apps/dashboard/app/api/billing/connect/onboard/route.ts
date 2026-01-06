import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import {
  getOrCreateConnectedAccount,
  createAccountLink,
} from '@workspace/billing/stripe-connect';

/**
 * POST /api/billing/connect/onboard
 * Create or retrieve a Stripe Connect account and generate onboarding link
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        OR: [{ isOwner: true }, { role: 'ADMIN' }],
      },
      include: {
        organization: {
          select: {
            id: true,
            email: true,
            stripeConnectAccountId: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Not authorized for this organization' },
        { status: 403 }
      );
    }

    // Get or create Stripe Connect account
    const account = await getOrCreateConnectedAccount({
      organizationId: membership.organization.id,
      email: membership.organization.email || session.user.email!,
      country: 'DE', // Default to Germany
    });

    // Generate account onboarding link
    const baseUrl = request.nextUrl.origin;
    const accountLink = await createAccountLink({
      accountId: account.id,
      refreshUrl: `${baseUrl}/api/billing/connect/refresh?organizationId=${organizationId}`,
      returnUrl: `${baseUrl}/api/billing/connect/return?organizationId=${organizationId}`,
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink,
    });
  } catch (error) {
    console.error('[connect/onboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}
