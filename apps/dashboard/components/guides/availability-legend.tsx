'use client';

import { useTranslations } from 'next-intl';

export function AvailabilityLegend(): React.JSX.Element {
  const t = useTranslations('guides.availability.status');

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-green-500/20 border border-green-500" />
        <span>{t('available')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-red-500/20 border border-red-500" />
        <span>{t('unavailable')}</span>
      </div>
    </div>
  );
}
