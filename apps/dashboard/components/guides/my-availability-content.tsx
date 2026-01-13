'use client';

import * as React from 'react';

import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';
import { AvailabilityCalendar } from './availability-calendar';
import { AvailabilityList } from './availability-list';

interface MyAvailabilityContentProps {
  initialAvailabilities: GuideAvailabilityDto[];
  view: 'list' | 'calendar';
}

export function MyAvailabilityContent({
  initialAvailabilities,
  view,
}: MyAvailabilityContentProps): React.JSX.Element {
  return view === 'calendar' ? (
    <AvailabilityCalendar availabilities={initialAvailabilities} />
  ) : (
    <AvailabilityList availabilities={initialAvailabilities} />
  );
}
