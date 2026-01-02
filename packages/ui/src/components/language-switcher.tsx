'use client';

import * as React from 'react';
import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { GlobeIcon } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const localeNames: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
};

// Define the required props for the Link component
export type LocalizedLinkProps = {
  href: string;
  locale: string;
  className?: string;
  children: React.ReactNode;
};

export type LanguageSwitcherProps = {
  locales: readonly string[];
  currentLocale?: string;
  Link: React.ComponentType<LocalizedLinkProps>;
  translationKey?: string;
};

export function LanguageSwitcher({
  locales,
  currentLocale: propCurrentLocale,
  Link,
  translationKey = 'Switch language',
}: LanguageSwitcherProps): React.JSX.Element {
  const pathname = useNextPathname();
  const params = useParams();
  const currentLocale = propCurrentLocale || (params.locale as string) || 'de';

  // Remove the locale prefix from the pathname to get the actual path
  const pathnameWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // The actual navigation will be handled by the Link component
    // This is just for the radio button state
  };

  return (
    <div className="flex w-fit rounded-full border bg-background p-0.5">
      {locales.map((locale) => (
        <span key={locale} className="h-full">
          <input
            className="peer sr-only"
            type="radio"
            id={`language-switch-${locale}`}
            value={locale}
            checked={currentLocale === locale}
            onChange={handleChange}
          />
          <label
            htmlFor={`language-switch-${locale}`}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-xs font-medium text-muted-foreground peer-checked:bg-accent peer-checked:text-foreground"
            aria-label={`${localeNames[locale]} language`}
          >
            <Tooltip delayDuration={600}>
              <TooltipTrigger asChild>
                <Link
                  href={pathnameWithoutLocale}
                  locale={locale}
                  className="flex size-full items-center justify-center"
                >
                  {locale.toUpperCase()}
                </Link>
              </TooltipTrigger>
              <TooltipContent>{localeNames[locale]}</TooltipContent>
            </Tooltip>
          </label>
        </span>
      ))}
    </div>
  );
}
