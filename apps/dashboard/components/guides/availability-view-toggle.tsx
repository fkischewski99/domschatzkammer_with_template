'use client';

import * as React from 'react';
import { CalendarDays, LayoutList } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group';

export type AvailabilityView = 'calendar' | 'list';

interface AvailabilityViewToggleProps {
  value: AvailabilityView;
  onValueChange: (value: AvailabilityView) => void;
}

export function AvailabilityViewToggle({
  value,
  onValueChange,
}: AvailabilityViewToggleProps): React.JSX.Element {
  const t = useTranslations('guides.availability.views');

  const handleValueChange = (newValue: string) => {
    if (newValue === 'calendar' || newValue === 'list') {
      onValueChange(newValue);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
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
