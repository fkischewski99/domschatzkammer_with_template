import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { createAccountLink } from '@workspace/billing/stripe-connect';

/**
 * GET /api/billing/connect/refresh
 * Regenerate onboarding link when previous one expires
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/sign-in', request.nextUrl.origin));
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.redirect(
        new URL('/error?message=Missing organization ID', request.nextUrl.origin)
      );
    }

    // Verify user has access and get Connect account ID
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        OR: [{ isOwner: true }, { role: 'ADMIN' }],
      },
      include: {
        organization: {
          select: {
            stripeConnectAccountId: true,
            slug: true,
          },
        },
      },
    });

    if (!membership || !membership.organization.stripeConnectAccountId) {
      return NextResponse.redirect(
        new URL('/error?message=No Stripe account found', request.nextUrl.origin)
      );
    }

    // Generate new account link
    const baseUrl = request.nextUrl.origin;
    const accountLink = await createAccountLink({
      accountId: membership.organization.stripeConnectAccountId,
      refreshUrl: `${baseUrl}/api/billing/connect/refresh?organizationId=${organizationId}`,
      returnUrl: `${baseUrl}/api/billing/connect/return?organizationId=${organizationId}`,
    });

    // Redirect to Stripe onboarding
    return NextResponse.redirect(accountLink);
  } catch (error) {
    console.error('[connect/refresh] Error:', error);
    return NextResponse.redirect(
      new URL('/error?message=Failed to refresh onboarding', request.nextUrl.origin)
    );
  }
}
