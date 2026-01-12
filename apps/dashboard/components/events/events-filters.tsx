'use client';

import * as React from 'react';
import {
  CalendarDays,
  CalendarX2,
  Clock,
  History,
  LayoutList,
  ListFilter
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ToggleGroup,
  ToggleGroupItem
} from '@workspace/ui/components/toggle-group';
import {
  UnderlinedTabs,
  UnderlinedTabsList,
  UnderlinedTabsTrigger
} from '@workspace/ui/components/tabs';

import { usePathname, useRouter } from '~/src/i18n/navigation';
import { useTransitionContext } from '~/hooks/use-transition-context';

export type EventsFiltersProps = {
  view: 'list' | 'calendar';
  filter: string;
};

const filterOptions = [
  {
    value: 'all',
    labelKey: 'filters.all',
    icon: <ListFilter className="size-4 shrink-0" />
  },
  {
    value: 'upcoming',
    labelKey: 'filters.upcoming',
    icon: <Clock className="size-4 shrink-0" />
  },
  {
    value: 'past',
    labelKey: 'filters.past',
    icon: <History className="size-4 shrink-0" />
  },
  {
    value: 'cancelled',
    labelKey: 'filters.cancelled',
    icon: <CalendarX2 className="size-4 shrink-0" />
  }
];

export function EventsFilters({
  view,
  filter
}: EventsFiltersProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');
  const router = useRouter();
  const pathname = usePathname();
  const { startTransition } = useTransitionContext();

  const handleFilterChange = (value: string) => {
    if (value) {
      startTransition(() => {
        const params = new URLSearchParams();
        params.set('view', view);
        if (value !== 'all') {
          params.set('filter', value);
        }
        router.push(`${pathname}?${params.toString()}`);
      });
    }
  };

  const handleViewChange = (value: string) => {
    if (value === 'list' || value === 'calendar') {
      startTransition(() => {
        const params = new URLSearchParams();
        params.set('view', value);
        if (filter !== 'all') {
          params.set('filter', filter);
        }
        router.push(`${pathname}?${params.toString()}`);
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <UnderlinedTabs
          value={filter}
          onValueChange={handleFilterChange}
          className="-ml-2"
        >
          <UnderlinedTabsList className="mr-2 h-12 max-h-12 min-h-12 gap-x-2 border-none">
            {filterOptions.map((option) => (
              <UnderlinedTabsTrigger
                key={option.value}
                value={option.value}
                className="mx-0 border-t-4 border-t-transparent"
              >
                <div className="flex flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                  {option.icon}
                  {t(option.labelKey)}
                </div>
              </UnderlinedTabsTrigger>
            ))}
          </UnderlinedTabsList>
        </UnderlinedTabs>
      </div>
      <div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={handleViewChange}
          className="rounded-lg border p-1"
        >
          <ToggleGroupItem
            value="list"
            aria-label={t('viewToggle.list')}
            className="h-7 w-7"
          >
            <LayoutList className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="calendar"
            aria-label={t('viewToggle.calendar')}
            className="h-7 w-7"
          >
            <CalendarDays className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </>
  );
}
