'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

export function StoryHero(): React.JSX.Element {
  const t = useTranslations('storyHero');

  return (
    <GridSection hideVerticalGridLines>
      <div className="container py-24 md:py-32">
        <SiteHeading
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
        />
      </div>
    </GridSection>
  );
}
