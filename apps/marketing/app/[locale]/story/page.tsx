import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { StoryHero } from '~/components/sections/story-hero';
import { StoryTeam } from '~/components/sections/story-team';
import { StoryTimeline } from '~/components/sections/story-timeline';
import { StoryValues } from '~/components/sections/story-values';
import { StoryVision } from '~/components/sections/story-vision';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('story'))
  };
}

export default function StoryPage(): React.JSX.Element {
  return (
    <>
      <StoryHero />
      <StoryVision />
      <StoryTeam />
      <StoryTimeline />
      <StoryValues />
    </>
  );
}
