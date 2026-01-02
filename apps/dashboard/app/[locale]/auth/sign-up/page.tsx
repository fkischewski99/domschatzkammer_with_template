import * as React from 'react';
import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routes } from '@workspace/routes';

import { Link } from '~/src/i18n/navigation';
import { SignUpCard } from '~/components/auth/sign-up/sign-up-card';
import { createTitle } from '~/lib/formatters';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.metadata' });
  return {
    title: createTitle(t('signUp'))
  };
}

export default async function SignUpPage({ params }: Props): Promise<React.JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.signUp');

  return (
    <>
      <SignUpCard />
      <div className="px-2 text-xs text-muted-foreground">
        {t('termsAgreement')}{' '}
        <Link
          prefetch={false}
          href={routes.marketing.TermsOfUse}
          className="text-foreground underline"
        >
          {t('termsOfUse')}
        </Link>{' '}
        {t('and')}{' '}
        <Link
          prefetch={false}
          href={routes.marketing.PrivacyPolicy}
          className="text-foreground underline"
        >
          {t('privacyPolicy')}
        </Link>
        . {t('needHelp')}{' '}
        <Link
          prefetch={false}
          href={routes.marketing.Contact}
          className="text-foreground underline"
        >
          {t('getInTouch')}
        </Link>
        .
      </div>
    </>
  );
}
