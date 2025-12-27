'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '~/src/i18n/navigation';

import { routes } from '@workspace/routes';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { BlurFade } from '~/components/fragments/blur-fade';
import { GridSection } from '~/components/fragments/grid-section';
import { TextGenerateEffect } from '~/components/fragments/text-generate-effect';

export function CTA(): React.JSX.Element {
  const t = useTranslations('cta');

  return (
    <GridSection className="bg-diagonal-lines">
      <div className="container flex flex-col items-center justify-between gap-6 bg-background py-16 text-center">
        <h3 className="m-0 max-w-fit text-3xl font-semibold md:text-4xl">
          <TextGenerateEffect words={t('title')} />
        </h3>
        <BlurFade
          inView
          delay={0.6}
        >
          <Link
            href={routes.dashboard.auth.SignUp}
            className={cn(buttonVariants({ variant: 'default' }), 'rounded-xl')}
          >
            {t('button')}
          </Link>
        </BlurFade>
      </div>
    </GridSection>
  );
}
