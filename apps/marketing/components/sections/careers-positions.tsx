'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ClockIcon, MapPinIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';

import { GridSection } from '~/components/fragments/grid-section';

const POSITION_KEYS = [
  'seniorSoftwareEngineer',
  'productManager',
  'contentWriter',
  'socialMediaManager'
] as const;

export function CareersPositions(): React.JSX.Element {
  const t = useTranslations('careers');

  return (
    <GridSection>
      <div className="space-y-12 py-20">
        <h2 className="text-center text-3xl font-semibold md:text-4xl">
          {t('openPositions')}
        </h2>
        <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-2 divide-y">
          {POSITION_KEYS.map((positionKey, index) => (
            <div
              key={index}
              className="flex flex-col justify-between border-dashed py-6 md:flex-row  md:items-center"
            >
              <div className="flex-1">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                  <h3 className="mb-1 text-lg font-semibold">
                    {t(`positions.${positionKey}.title`)}
                  </h3>
                  <Badge
                    variant="outline"
                    className="w-fit rounded-full"
                  >
                    {t(`positions.${positionKey}.department`)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{t(`positions.${positionKey}.description`)}</p>
                <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-auto w-4" />
                    {t('fullTime')}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-auto w-4" />
                    {t('remote')}
                  </div>
                </div>
              </div>
              <div className="mt-4 shrink-0 md:mt-0">
                <Button
                  type="button"
                  variant="default"
                  className="rounded-xl"
                >
                  {t('apply')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}
