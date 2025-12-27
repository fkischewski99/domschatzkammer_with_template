'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '~/src/i18n/navigation';

import { APP_NAME } from '@workspace/common/app';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Logo } from '@workspace/ui/components/logo';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';
import { ThemeSwitcher } from '@workspace/ui/components/theme-switcher';

import { ExternalLink } from '~/components/fragments/external-link';
import { getFooterLinks, SOCIAL_LINKS } from '~/components/marketing-links';

export function Footer(): React.JSX.Element {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const footerLinks = getFooterLinks(t);

  const handleSubscribe = (): void => {
    toast.error(tCommon('notImplementedYet'));
  };
  return (
    <footer className="px-2 pb-10 pt-20 sm:container">
      <h2 className="sr-only">{t('heading')}</h2>
      <div className="container">
        <div className="xl:grid xl:grid-cols-6 xl:gap-8">
          <div className="hidden xl:block">
            <Logo />
            <p className="mt-3 text-xs text-muted-foreground">
              {t('mission')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {group.title}
                </h3>
                <ul
                  role="list"
                  className="mt-6 space-y-2"
                >
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        title={link.name}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="relative text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                        {link.external && (
                          <ExternalLink className="absolute right-[-10px] top-[2px] opacity-80" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-4 lg:col-span-2 xl:mt-0">
            <h3 className="text-sm font-semibold text-foreground">
              {t('newsletter.title')}
            </h3>
            <form className="py-2 sm:flex sm:max-w-md">
              <div className="w-full min-w-0">
                <Input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  className="w-full"
                />
              </div>
              <div className="mt-3 sm:ml-4 sm:mt-0 sm:shrink-0">
                <Button
                  type="button"
                  onClick={handleSubscribe}
                >
                  {t('newsletter.subscribe')}
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {t('copyright', { year: new Date().getFullYear() }).replace('Your Company', APP_NAME)}
            </p>
            <div className="flex flex-row items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <Link
                  key={link.name}
                  title={link.name}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{link.name}</span>
                  {link.icon}
                </Link>
              ))}
              <Separator
                orientation="vertical"
                className="h-4"
              />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
