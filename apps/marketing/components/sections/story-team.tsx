'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@workspace/ui/components/avatar';

import { GridSection } from '~/components/fragments/grid-section';

const TEAM_KEYS = ['rickSanchez', 'mortySmith'] as const;

const TEAM_IMAGES: Record<typeof TEAM_KEYS[number], string> = {
  rickSanchez: '/assets/story/rick-sanchez.webp',
  mortySmith: '/assets/story/morty-smith.webp'
};

export function StoryTeam(): React.JSX.Element {
  const t = useTranslations('story');

  return (
    <GridSection>
      <div className="container max-w-6xl py-20">
        <h2 className="mb-16 text-sm font-medium uppercase tracking-wider text-muted-foreground ">
          {t('visionaries')}
        </h2>
        <div className="flex flex-wrap gap-24">
          {TEAM_KEYS.map((teamKey, index) => {
            const name = t(`team.${teamKey}.name`);
            return (
              <div
                key={index}
                className="space-y-8"
              >
                <Avatar className="size-24 border-4 border-neutral-200 dark:border-neutral-800">
                  <AvatarImage
                    src={TEAM_IMAGES[teamKey]}
                    alt={name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl">
                    {name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{name}</h3>
                    <p className="text-primary">{t(`team.${teamKey}.role`)}</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{t(`team.${teamKey}.previousRole`)}</p>
                    <p>{t(`team.${teamKey}.education`)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GridSection>
  );
}
