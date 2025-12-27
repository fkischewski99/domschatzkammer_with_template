'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircleIcon, BookIcon, ScaleIcon } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

const CARD_ICONS = {
  introduction: <BookIcon className="size-4 shrink-0" />,
  informationCollection: <ScaleIcon className="size-4 shrink-0" />,
  dataUsage: <AlertCircleIcon className="size-4 shrink-0" />
} as const;

const CARD_KEYS = ['introduction', 'informationCollection', 'dataUsage'] as const;
const ACCORDION_KEYS = ['dataProtection', 'thirdPartySharing', 'userRights', 'cookiesTracking', 'changes'] as const;

export function PrivacyPolicy(): React.JSX.Element {
  const t = useTranslations('privacyPolicy');

  const DATA_CARDS = CARD_KEYS.map((key) => ({
    title: t(`cards.${key}.title`),
    icon: CARD_ICONS[key],
    content: t(`cards.${key}.content`)
  }));

  const DATA_ACCORDION = ACCORDION_KEYS.map((key) => ({
    title: t(`accordion.${key}.title`),
    content: t(`accordion.${key}.content`)
  }));

  return (
    <GridSection>
      <div className="container space-y-16 py-20">
        <SiteHeading
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
        />
        <Alert variant="warning">
          <AlertDescription className="ml-3 text-base inline">
            {t('warning')}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DATA_CARDS.map((item, index) => (
            <Card
              key={index}
              className="border-none dark:bg-accent/40"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Accordion
          type="single"
          collapsible
        >
          {DATA_ACCORDION.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="flex items-center justify-between text-lg font-medium">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div>
          <CardTitle className="text-lg text-primary">
            {t('contactTitle')}
          </CardTitle>
          <p className="text-sm leading-relaxed">
            {t('contactText')}
            <br />
            <a
              href="mailto:support@yourdomain.com"
              className="text-blue-500 hover:underline"
            >
              support@yourdomain.com
            </a>
          </p>
        </div>
      </div>
    </GridSection>
  );
}
