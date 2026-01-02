import { type NextConfig } from 'next/types';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { createSecureHeaders } from 'next-secure-headers';
import createNextIntlPlugin from 'next-intl/plugin';

import { MonitoringProvider } from '@workspace/monitoring/provider';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const INTERNAL_PACKAGES = [
  '@workspace/api-keys',
  '@workspace/auth',
  '@workspace/billing',
  '@workspace/common',
  '@workspace/database',
  '@workspace/email',
  '@workspace/monitoring',
  '@workspace/rate-limit',
  '@workspace/routes',
  '@workspace/ui',
  '@workspace/webhooks'
];

const nextConfig: NextConfig = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: INTERNAL_PACKAGES,
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  /** Enable 'use cache' directive for data caching */
  cacheComponents: true,
  /** Custom cache life profiles */
  cacheLife: {
    // Default profile for most data - 1 hour stale, revalidate every 15 min
    default: {
      stale: 3600,
      revalidate: 900,
      expire: 86400
    },
    // Short-lived data that changes frequently
    short: {
      stale: 60,
      revalidate: 30,
      expire: 300
    }
  },
  experimental: {
    optimizePackageImports: [
      'recharts',
      'lucide-react',
      'date-fns',
      ...INTERNAL_PACKAGES
    ]
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        locale: false,
        source: '/(.*)',
        headers: createSecureHeaders({
          frameGuard: 'deny',
          noopen: 'noopen',
          nosniff: 'nosniff',
          xssProtection: 'sanitize',
          forceHTTPSRedirect: [
            true,
            { maxAge: 60 * 60 * 24 * 360, includeSubDomains: true }
          ],
          referrerPolicy: 'same-origin'
        })
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale',
        destination: '/:locale/auth',
        permanent: false
      },
      {
        source: '/:locale/auth',
        destination: '/:locale/auth/sign-in',
        permanent: false
      },
      {
        source: '/:locale/organizations/:slug/settings',
        destination: '/:locale/organizations/:slug/settings/account',
        permanent: false
      },
      {
        source: '/:locale/organizations/:slug/settings/account',
        destination: '/:locale/organizations/:slug/settings/account/profile',
        permanent: false
      },
      {
        source: '/:locale/organizations/:slug/settings/organization',
        destination: '/:locale/organizations/:slug/settings/organization/general',
        permanent: false
      }
    ];
  }
};

const bundleAnalyzerConfig =
  process.env.ANALYZE === 'true'
    ? withBundleAnalyzer({ enabled: true })(nextConfig)
    : nextConfig;

const intlConfig = withNextIntl(bundleAnalyzerConfig);

export default MonitoringProvider.withConfig(intlConfig);
