import * as React from 'react';
import { useTranslations } from 'next-intl';

import { GridSection } from '~/components/fragments/grid-section';

export default function NotFound(): React.JSX.Element {
  const t = useTranslations('errors');

  return (
    <GridSection>
      <div className="flex flex-col py-32 items-center justify-center text-center">
        <span className="text-[10rem] font-semibold leading-none">404</span>
        <h2 className="font-heading my-2 text-2xl font-bold">
          {t('notFoundTitle')}
        </h2>
        <p>
          {t('notFoundMessage')}
        </p>
      </div>
    </GridSection>
  );
}
