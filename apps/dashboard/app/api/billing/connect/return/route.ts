import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';

/**
 * GET /api/billing/connect/return
 * Handle successful Stripe Connect onboarding completion
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

    // Verify user has access
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        OR: [{ isOwner: true }, { role: 'ADMIN' }],
      },
      include: {
        organization: {
          select: {
            slug: true,
            stripeConnectAccountId: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.redirect(
        new URL('/error?message=Not authorized', request.nextUrl.origin)
      );
    }

    // TODO: Update organization status to indicate Connect account is ready
    // This will be handled by the account.updated webhook (T038)

    // Redirect to organization billing settings
    const redirectUrl = new URL(
      `/organizations/${membership.organization.slug}/settings/organization/billing`,
      request.nextUrl.origin
    );
    redirectUrl.searchParams.set('connect', 'success');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('[connect/return] Error:', error);
    return NextResponse.redirect(
      new URL('/error?message=Failed to complete onboarding', request.nextUrl.origin)
    );
  }
}
