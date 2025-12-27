'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { GridSection } from '~/components/fragments/grid-section';

export function StoryVision(): React.JSX.Element {
  const t = useTranslations('story.vision');

  return (
    <GridSection>
      <div className="container max-w-6xl py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t('title')}
            </h2>
            <p className="text-2xl font-medium leading-relaxed md:text-3xl">
              "{t('quote')}"
            </p>
          </div>
          <div className="space-y-6 text-base text-muted-foreground md:text-lg">
            <p>
              {t('paragraph1')}
            </p>
            <p>
              {t('paragraph2')}
            </p>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
