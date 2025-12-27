import '@workspace/ui/globals.css';

import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { APP_DESCRIPTION, APP_NAME } from '@workspace/common/app';
import { baseUrl } from '@workspace/routes';
import { Toaster } from '@workspace/ui/components/sonner';

import { routing } from '~/src/i18n/routing';
import { Footer } from '~/components/footer';
import { CookieBanner } from '~/components/fragments/cookie-banner';
import { Navbar } from '~/components/navbar';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl.Marketing),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  manifest: `${baseUrl.Marketing}/manifest`,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: baseUrl.Marketing,
    images: {
      url: `${baseUrl.Marketing}/og-image`,
      width: 1200,
      height: 630,
      alt: APP_NAME
    }
  },
  robots: {
    index: true,
    follow: true
  }
};

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Props): Promise<React.JSX.Element> {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for the locale
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="size-full min-h-screen"
      suppressHydrationWarning
    >
      <body className={`${inter.className} size-full`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div>
              <Navbar />
              {children}
              <Footer />
              <CookieBanner />
            </div>
            <React.Suspense>
              <Toaster />
            </React.Suspense>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
