'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';
import { AvailabilityCalendar } from './availability-calendar';
import { AvailabilityList } from './availability-list';
import { AvailabilityViewToggle, type AvailabilityView } from './availability-view-toggle';

interface MyAvailabilityContentProps {
  availabilities: GuideAvailabilityDto[];
}

const VIEW_STORAGE_KEY = 'availability-view-preference';

export function MyAvailabilityContent({
  availabilities,
}: MyAvailabilityContentProps): React.JSX.Element {
  const router = useRouter();
  const [view, setView] = React.useState<AvailabilityView>('calendar');

  // Load preference from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'calendar' || stored === 'list') {
      setView(stored);
    }
  }, []);

  // Save preference to localStorage when changed
  const handleViewChange = (newView: AvailabilityView) => {
    setView(newView);
    localStorage.setItem(VIEW_STORAGE_KEY, newView);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <AvailabilityViewToggle value={view} onValueChange={handleViewChange} />

      {view === 'calendar' ? (
        <AvailabilityCalendar
          availabilities={availabilities}
          onRefresh={handleRefresh}
        />
      ) : (
        <AvailabilityList
          availabilities={availabilities}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
