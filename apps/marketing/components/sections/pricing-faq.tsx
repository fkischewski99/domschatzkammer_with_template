'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '~/src/i18n/navigation';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';

import { GridSection } from '~/components/fragments/grid-section';

export function PricingFAQ(): React.JSX.Element {
  const t = useTranslations('pricing.faq');

  const faqData = [
    {
      question: t('questions.plans.question', { appName: APP_NAME }),
      answer: (
        <div>
          {t('questions.plans.answer.intro')}
          <br />
          <ul className="mt-2 list-disc pl-5">
            <li>
              <strong>{t('questions.plans.answer.free')}</strong> {t('questions.plans.answer.freeDesc')}
            </li>
            <li>
              <strong>{t('questions.plans.answer.pro')}</strong> {t('questions.plans.answer.proDesc')}
            </li>
            <li>
              <strong>{t('questions.plans.answer.enterprise')}</strong> {t('questions.plans.answer.enterpriseDesc')}
            </li>
          </ul>
          <p className="mt-2">{t('questions.plans.answer.outro')}</p>
        </div>
      )
    },
    {
      question: t('questions.freeFeatures.question'),
      answer: (
        <div>
          {t('questions.freeFeatures.answer.intro')}
          <ul className="mt-2 list-disc pl-5">
            <li>{t('questions.freeFeatures.answer.scoring')}</li>
            <li>{t('questions.freeFeatures.answer.email')}</li>
            <li>{t('questions.freeFeatures.answer.team')}</li>
          </ul>
        </div>
      )
    },
    {
      question: t('questions.proFeatures.question'),
      answer: (
        <div>
          {t('questions.proFeatures.answer.intro')}
          <ul className="mt-2 list-disc pl-5">
            <li>{t('questions.proFeatures.answer.unlimited')}</li>
            <li>{t('questions.proFeatures.answer.predictions')}</li>
            <li>{t('questions.proFeatures.answer.sentiment')}</li>
            <li>{t('questions.proFeatures.answer.team')}</li>
          </ul>
        </div>
      )
    },
    {
      question: t('questions.enterpriseFeatures.question'),
      answer: (
        <div>
          {t('questions.enterpriseFeatures.answer.intro')}
          <ul className="mt-2 list-disc pl-5">
            <li>{t('questions.enterpriseFeatures.answer.custom')}</li>
            <li>{t('questions.enterpriseFeatures.answer.models')}</li>
            <li>{t('questions.enterpriseFeatures.answer.storage')}</li>
            <li>{t('questions.enterpriseFeatures.answer.support')}</li>
            <li>{t('questions.enterpriseFeatures.answer.team')}</li>
          </ul>
          <p className="mt-2">{t('questions.enterpriseFeatures.answer.outro')}</p>
        </div>
      )
    },
    {
      question: t('questions.upgradeDowngrade.question'),
      answer: <p>{t('questions.upgradeDowngrade.answer')}</p>
    },
    {
      question: t('questions.setupFee.question'),
      answer: <p>{t('questions.setupFee.answer', { appName: APP_NAME })}</p>
    },
    {
      question: t('questions.exceedLimits.question'),
      answer: <p>{t('questions.exceedLimits.answer')}</p>
    }
  ];

  return (
    <GridSection>
      <div className="container py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="mb-2.5 text-3xl font-semibold md:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-6 hidden text-muted-foreground md:block lg:max-w-[75%]">
              {t('subtitle')}{' '}
              <Link
                href={routes.marketing.Contact}
                className="font-normal text-inherit underline hover:text-foreground"
              >
                {t('contact')}
              </Link>{' '}
              {t('helpText')}
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-xl flex-col">
            <Accordion
              type="single"
              collapsible
            >
              {faqData.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={index.toString()}
                >
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
