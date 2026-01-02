import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["de", "en"],

  // Used when no locale matches
  defaultLocale: "de",

  // Always show locale prefix in URLs
  // URLs like /auth/sign-in will be redirected to /de/auth/sign-in
  localePrefix: "always",
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
