'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';

import { EventCard } from './event-card';
import type { SerializedEventWithRelations } from '~/data/events/get-organization-events';

interface EventListProps {
  events: SerializedEventWithRelations[];
  organizationSlug: string;
}

export function EventList({ events, organizationSlug }: EventListProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
        <p className="text-muted-foreground mt-1">{t('empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          organizationSlug={organizationSlug}
        />
      ))}
    </div>
  );
}
