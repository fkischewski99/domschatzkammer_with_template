'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { NumberTicker } from '~/components/fragments/number-ticket';

export function Stats(): React.JSX.Element {
  const t = useTranslations('stats');

  const statsData = [
    {
      value: 55,
      suffix: '%',
      description: t('conversion')
    },
    {
      value: 4,
      suffix: 'x',
      description: t('retention')
    },
    {
      value: 97,
      suffix: '%',
      description: t('satisfaction')
    },
    {
      value: 450,
      suffix: '+',
      description: t('customers')
    }
  ];

  return (
    <GridSection>
      <div className="grid grid-cols-2 divide-x divide-border lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={cn(
              'justify-top flex flex-col items-center border-dashed p-6 text-center lg:p-8 ',
              (index === 2 || index === 3) && 'border-t lg:border-t-0'
            )}
          >
            <p className="whitespace-nowrap text-2xl font-semibold md:text-3xl">
              <NumberTicker value={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </GridSection>
  );
}
