'use client';

import * as React from 'react';
import { Calendar, List } from 'lucide-react';
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
      className="justify-start"
    >
      <ToggleGroupItem value="calendar" aria-label={t('calendar')}>
        <Calendar className="h-4 w-4 mr-2" />
        {t('calendar')}
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label={t('list')}>
        <List className="h-4 w-4 mr-2" />
        {t('list')}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
