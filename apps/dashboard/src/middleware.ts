import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const MAX_SLUG_LENGTH = 255;

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest): NextResponse<unknown> {
  // First, apply i18n middleware
  const response = intlMiddleware(request);

  // Extract slug from the URL path
  // Pattern: /[locale]/organizations/[slug]/...
  const path = request.nextUrl.pathname;
  const pathSegments = path.split("/").filter((segment) => segment !== "");

  // Check for the specific pattern: /[locale]/organizations/[slug]
  let slug = null;
  if (pathSegments.length >= 3 && pathSegments[1] === "organizations") {
    slug = pathSegments[2];
  }

  if (slug && slug.length <= MAX_SLUG_LENGTH) {
    response.headers.set("x-organization-slug", slug);
    response.cookies.set("organizationSlug", slug, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
