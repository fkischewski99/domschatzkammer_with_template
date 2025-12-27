'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Area, AreaChart } from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@workspace/ui/components/chart';
import { cn } from '@workspace/ui/lib/utils';

const MotionCard = motion.create(Card);

export function BentoAnalyticsCard({
  className,
  ...other
}: React.ComponentPropsWithoutRef<typeof MotionCard>): React.JSX.Element {
  const t = useTranslations('bentoCards.analytics');

  const DATA = [
    { name: t('months.january'), value: 400 },
    { name: t('months.february'), value: 300 },
    { name: t('months.march'), value: 600 },
    { name: t('months.april'), value: 400 },
    { name: t('months.may'), value: 500 },
    { name: t('months.june'), value: 350 }
  ];

  return (
    <MotionCard
      className={cn(
        'relative h-[300px] max-h-[300px] overflow-hidden pb-0',
        className
      )}
      {...other}
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-0 pb-6">
        <p className="mb-6 line-clamp-2 px-6 text-sm text-muted-foreground">
          {t('description')}
        </p>
        <div className="w-full max-w-md">
          <ChartContainer
            config={{}}
            className="h-[150px] min-w-full overflow-hidden"
          >
            <AreaChart
              data={DATA}
              margin={{ top: 5, right: 0, left: 0, bottom: -5 }}
            >
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                name={t('leads')}
                stroke="var(--primary)"
                fill="url(#gradient)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(_, payload) => (payload[0] as { payload: { name: string } }).payload.name}
                    formatter={(value) => (
                      <>
                        <strong>{String(value)}</strong> {t('leads')}
                      </>
                    )}
                  />
                }
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </MotionCard>
  );
}
