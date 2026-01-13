'use client';

import * as React from 'react';
import { CalendarDays, LayoutList } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ToggleGroup,
  ToggleGroupItem
} from '@workspace/ui/components/toggle-group';

import { usePathname, useRouter } from '~/src/i18n/navigation';
import { useTransitionContext } from '~/hooks/use-transition-context';

export type AvailabilityFiltersProps = {
  view: 'list' | 'calendar';
};

export function AvailabilityFilters({
  view
}: AvailabilityFiltersProps): React.JSX.Element {
  const t = useTranslations('guides.availability.views');
  const router = useRouter();
  const pathname = usePathname();
  const { startTransition } = useTransitionContext();

  const handleViewChange = (value: string) => {
    if (value === 'list' || value === 'calendar') {
      startTransition(() => {
        const params = new URLSearchParams();
        params.set('view', value);
        router.push(`${pathname}?${params.toString()}`);
      });
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={handleViewChange}
      className="rounded-lg border p-1"
    >
      <ToggleGroupItem
        value="list"
        aria-label={t('list')}
        className="h-7 w-7"
      >
        <LayoutList className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="calendar"
        aria-label={t('calendar')}
        className="h-7 w-7"
      >
        <CalendarDays className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
