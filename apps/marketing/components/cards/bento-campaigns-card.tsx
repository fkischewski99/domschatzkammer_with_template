'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { MailIcon, MessageSquareIcon } from 'lucide-react';
import { motion } from 'motion/react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import {
  Autoplay,
  Carousel,
  CarouselContent,
  CarouselItem
} from '@workspace/ui/components/carousel';
import { cn } from '@workspace/ui/lib/utils';

const CAMPAIGN_KEYS = [
  'welcomeEmail',
  'appointmentReminder',
  'followUpEmail',
  'feedbackRequest',
  'exclusiveOfferEmail',
  'personalizedCheckIn',
  'specialEventInvitation',
  'reactivationCampaign'
] as const;

const CAMPAIGN_TYPES: Record<typeof CAMPAIGN_KEYS[number], { type: string; icon: typeof MailIcon }> = {
  welcomeEmail: { type: 'email', icon: MailIcon },
  appointmentReminder: { type: 'message', icon: MessageSquareIcon },
  followUpEmail: { type: 'email', icon: MailIcon },
  feedbackRequest: { type: 'message', icon: MessageSquareIcon },
  exclusiveOfferEmail: { type: 'email', icon: MailIcon },
  personalizedCheckIn: { type: 'message', icon: MessageSquareIcon },
  specialEventInvitation: { type: 'email', icon: MailIcon },
  reactivationCampaign: { type: 'message', icon: MessageSquareIcon }
};

const MotionCard = motion.create(Card);

export function BentoCampaignsCard({
  className,
  ...other
}: React.ComponentPropsWithoutRef<typeof MotionCard>): React.JSX.Element {
  const t = useTranslations('bentoCards.campaigns');

  const DATA = CAMPAIGN_KEYS.map((key) => ({
    title: t(`items.${key}.title`),
    timing: t(`items.${key}.timing`),
    icon: CAMPAIGN_TYPES[key].icon
  }));

  return (
    <MotionCard
      className={cn(
        'relative h-[300px] max-h-[300px] overflow-hidden',
        className
      )}
      {...other}
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {t('description')}
        </p>
        <Carousel
          opts={{
            align: 'start',
            skipSnaps: true,
            loop: true,
            dragFree: true
          }}
          plugins={[
            Autoplay({
              delay: 2000
            })
          ]}
          orientation="vertical"
          className="pointer-events-none size-full select-none"
        >
          <CarouselContent className="pointer-events-none -mt-1 h-[232px] select-none sm:h-[146px]">
            {DATA.map(({ title, timing, icon: Icon }, index) => (
              <CarouselItem
                key={index}
                className="pointer-events-none basis-1/4 select-none pt-1 will-change-transform"
              >
                <Card className="m-1 p-0">
                  <CardContent className="flex w-full flex-row items-center justify-start gap-4 p-6">
                    <div className="rounded-full bg-primary p-2 text-primary-foreground">
                      <Icon className="size-5 shrink-0" />
                    </div>
                    <div>
                      <div className="text-xs font-medium sm:text-sm">
                        {title}
                      </div>
                      <div className="text-[10px] text-muted-foreground sm:text-xs">
                        {timing}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </MotionCard>
  );
}
