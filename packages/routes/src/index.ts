// Convention:
// - Everything lowercase is an object
// - Everything uppercase is a string (the route)

import { keys } from '../keys';

export const baseUrl = {
  Dashboard: keys().NEXT_PUBLIC_DASHBOARD_URL,
  Marketing: keys().NEXT_PUBLIC_MARKETING_URL,
  PublicApi: keys().NEXT_PUBLIC_PUBLIC_API_URL
} as const;

export const routes = {
  dashboard: {
    Api: `${baseUrl.Dashboard}/api`,
    auth: {
      changeEmail: {
        Expired: `${baseUrl.Dashboard}/de/auth/change-email/expired`,
        Index: `${baseUrl.Dashboard}/de/auth/change-email`,
        Invalid: `${baseUrl.Dashboard}/de/auth/change-email/invalid`,
        Request: `${baseUrl.Dashboard}/de/auth/change-email/request`
      },
      Error: `${baseUrl.Dashboard}/de/auth/error`,
      forgetPassword: {
        Index: `${baseUrl.Dashboard}/de/auth/forgot-password`,
        Success: `${baseUrl.Dashboard}/de/auth/forgot-password/success`
      },
      Index: `${baseUrl.Dashboard}/de/auth`,
      RecoveryCode: `${baseUrl.Dashboard}/de/auth/recovery-code`,
      resetPassword: {
        Expired: `${baseUrl.Dashboard}/de/auth/reset-password/expired`,
        Index: `${baseUrl.Dashboard}/de/auth/reset-password`,
        Request: `${baseUrl.Dashboard}/de/auth/reset-password/request`,
        Success: `${baseUrl.Dashboard}/de/auth/reset-password/success`
      },
      SignIn: `${baseUrl.Dashboard}/de/auth/sign-in`,
      SignUp: `${baseUrl.Dashboard}/de/auth/sign-up`,
      Totp: `${baseUrl.Dashboard}/de/auth/totp`,
      verifyEmail: {
        Expired: `${baseUrl.Dashboard}/de/auth/verify-email/expired`,
        Index: `${baseUrl.Dashboard}/de/auth/verify-email`,
        Request: `${baseUrl.Dashboard}/de/auth/verify-email/request`,
        Success: `${baseUrl.Dashboard}/de/auth/verify-email/success`
      }
    },
    Index: `${baseUrl.Dashboard}/`,
    invitations: {
      AlreadyAccepted: `${baseUrl.Dashboard}/de/invitations/already-accepted`,
      Index: `${baseUrl.Dashboard}/de/invitations`,
      Request: `${baseUrl.Dashboard}/de/invitations/request`,
      Revoked: `${baseUrl.Dashboard}/de/invitations/revoked`
    },
    onboarding: {
      Index: `${baseUrl.Dashboard}/de/onboarding`,
      Organization: `${baseUrl.Dashboard}/de/onboarding/organization`,
      User: `${baseUrl.Dashboard}/de/onboarding/user`
    },
    organizations: {
      Index: `${baseUrl.Dashboard}/de/organizations`,
      slug: {
        ChoosePlan: `${baseUrl.Dashboard}/de/organizations/[slug]/choose-plan`,
        Contacts: `${baseUrl.Dashboard}/de/organizations/[slug]/contacts`,
        Home: `${baseUrl.Dashboard}/de/organizations/[slug]/home`,
        Index: `${baseUrl.Dashboard}/de/organizations/[slug]`,
        settings: {
          account: {
            Index: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/account`,
            Notifications: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/account/notifications`,
            Profile: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/account/profile`,
            Security: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/account/security`
          },
          Index: `${baseUrl.Dashboard}/de/organizations/[slug]/settings`,
          organization: {
            Billing: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/organization/billing`,
            Developers: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/organization/developers`,
            General: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/organization/general`,
            Index: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/organization`,
            Members: `${baseUrl.Dashboard}/de/organizations/[slug]/settings/organization/members`
          }
        }
      }
    }
  },
  marketing: {
    Api: '/api',
    Blog: '/blog',
    Careers: '/careers',
    Contact: '/contact',
    CookiePolicy: '/cookie-policy',
    Docs: '/docs',
    Index: '/',
    Pricing: '/pricing',
    PrivacyPolicy: '/privacy-policy',
    Roadmap: 'https://achromatic.canny.io',
    Story: '/story',
    TermsOfUse: '/terms-of-use'
  }
} as const;

type ExtractSlugRoutes<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends string
          ? T[K] extends `${string}[slug]${string}`
            ? T[K]
            : never
          : ExtractSlugRoutes<T[K]>;
      }[keyof T]
    : never;

type OrganizationsSlugRoutes = ExtractSlugRoutes<
  typeof routes.dashboard.organizations.slug
>;

export function replaceOrgSlug(
  route: OrganizationsSlugRoutes,
  slug: string
): string {
  if (route.indexOf('[slug]') === -1) {
    throw new Error(
      `Invalid route: ${route}. Route must contain the placeholder [slug].`
    );
  }

  return route.replace('[slug]', slug);
}

export function getPathname(route: string, baseUrl: string): string {
  return new URL(route, baseUrl).pathname;
}

export function getOrganizationLogoUrl(
  organizationId: string,
  hash: string
): string {
  return `${routes.dashboard.Api}/organization-logos/${organizationId}?v=${hash}`;
}

export function getUserImageUrl(userId: string, hash: string): string {
  return `${routes.dashboard.Api}/user-images/${userId}?v=${hash}`;
}

export function getContactImageUrl(contactId: string, hash: string): string {
  return `${routes.dashboard.Api}/contact-images/${contactId}?v=${hash}`;
}
