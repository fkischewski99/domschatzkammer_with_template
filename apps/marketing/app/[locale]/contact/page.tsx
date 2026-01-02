import * as React from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Contact } from '~/components/sections/contact';
import { FAQ } from '~/components/sections/faq';
import { createTitle } from '~/lib/formatters';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: createTitle(t('contact'))
  };
}

export default function ContactPage(): React.JSX.Element {
  return (
    <>
      <Contact />
      <FAQ />
    </>
  );
}
