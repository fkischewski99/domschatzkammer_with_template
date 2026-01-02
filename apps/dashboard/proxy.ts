import { NextResponse, type NextRequest } from 'next/server';

// This proxy is used to pass organization slug to the headers.
// In Next.js you can get the header value anywhere in the code (both server and client side).
// However server-side params can only be accessed by the page.

const MAX_SLUG_LENGTH = 255;

export function proxy(request: NextRequest): NextResponse<unknown> {
  // Extract slug from the URL path
  const path = request.nextUrl.pathname;
  const pathSegments = path.split('/').filter((segment) => segment !== '');

  // Check for the specific pattern: /[locale]/organizations/slug or /organizations/slug
  let slug = null;

  // Pattern 1: /[locale]/organizations/slug (with i18n)
  if (pathSegments.length >= 3 && pathSegments[1] === 'organizations') {
    slug = pathSegments[2];
  }
  // Pattern 2: /organizations/slug (without i18n - backwards compatibility)
  else if (pathSegments.length >= 2 && pathSegments[0] === 'organizations') {
    slug = pathSegments[1];
  }

  const response = NextResponse.next();
  if (slug && slug.length <= MAX_SLUG_LENGTH) {
    response.headers.set('x-organization-slug', slug);
    response.cookies.set('organizationSlug', slug, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    });
  } else {
    console.warn('No organization slug in headers. Check middleware.');
  }

  return response;
}

export const config = {
  matcher: ['/:locale/organizations/:path*', '/organizations/:path*']
};
