'use client';

import * as React from 'react';
import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GlobeIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

import { Link } from '~/src/i18n/navigation';
import { routing } from '~/src/i18n/routing';

const localeNames: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
};

export function LanguageSwitcher(): React.JSX.Element {
  const t = useTranslations('common');
  const pathname = useNextPathname();
  const params = useParams();
  const currentLocale = (params.locale as string) || 'de';

  // Remove the locale prefix from the pathname to get the actual path
  const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <GlobeIcon className="size-4" />
          <span className="sr-only">{t('switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            asChild
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            <Link
              href={pathnameWithoutLocale}
              locale={locale}
              className="w-full cursor-pointer"
            >
              {localeNames[locale]}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
