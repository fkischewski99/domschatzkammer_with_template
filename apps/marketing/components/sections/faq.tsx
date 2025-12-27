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

export function FAQ(): React.JSX.Element {
  const t = useTranslations('faqHome');

  const faqData = [
    {
      question: t('questions.whatDoes.question', { appName: APP_NAME }),
      answer: t('questions.whatDoes.answer', { appName: APP_NAME })
    },
    {
      question: t('questions.benefits.question'),
      answer: t('questions.benefits.answer', { appName: APP_NAME })
    },
    {
      question: t('questions.dataSafe.question'),
      answer: t('questions.dataSafe.answer')
    },
    {
      question: t('questions.integrations.question'),
      answer: t('questions.integrations.answer', { appName: APP_NAME })
    },
    {
      question: t('questions.onboarding.question'),
      answer: t('questions.onboarding.answer')
    },
    {
      question: t('questions.businessTypes.question'),
      answer: t('questions.businessTypes.answer', { appName: APP_NAME })
    },
    {
      question: t('questions.customize.question'),
      answer: t('questions.customize.answer')
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
              </Link>
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
