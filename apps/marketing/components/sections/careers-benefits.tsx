'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { BriefcaseBusinessIcon, Users2Icon, ZapIcon } from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

const BENEFIT_KEYS = ['innovation', 'inclusive', 'growth'] as const;

const BENEFIT_ICONS: Record<typeof BENEFIT_KEYS[number], React.JSX.Element> = {
  innovation: <ZapIcon className="size-5 shrink-0" />,
  inclusive: <Users2Icon className="size-5 shrink-0" />,
  growth: <BriefcaseBusinessIcon className="size-5 shrink-0" />
};

export function CareersBenefits(): React.JSX.Element {
  const t = useTranslations('careersBenefits');

  const DATA = BENEFIT_KEYS.map((key) => ({
    icon: BENEFIT_ICONS[key],
    title: t(`benefits.${key}.title`),
    description: t(`benefits.${key}.description`)
  }));

  return (
    <GridSection>
      <div className="space-y-20 pt-20">
        <div className="container">
          <SiteHeading
            badge={t('badge')}
            title={t('title')}
            description={t('description', { appName: APP_NAME })}
          />
        </div>
        <div className="grid divide-y border-t border-dashed md:grid-cols-3 md:divide-x md:divide-y-0">
          {DATA.map((benefit, index) => (
            <div
              key={index}
              className="border-dashed px-8 py-12"
            >
              <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border bg-background shadow">
                {benefit.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}
