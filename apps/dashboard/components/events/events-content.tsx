'use client';

import * as React from 'react';
import { useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { toast } from '@workspace/ui/components/sonner';

import { EventCalendar } from './event-calendar';
import { EventList } from './event-list';
import { toggleEventPublish } from '~/actions/events/admin/toggle-publish';
import { updateEventTime } from '~/actions/events/admin/update-event-time';
import type { SerializedEventWithRelations } from '~/data/events/get-organization-events';

type OptimisticAction =
  | { type: 'togglePublish'; eventId: string; isPublished: boolean }
  | { type: 'updateTime'; eventId: string; startTime: string; endTime: string };

export type EventsContentProps = {
  events: SerializedEventWithRelations[];
  organizationSlug: string;
  view: 'list' | 'calendar';
  filter: string;
};

export function EventsContent({
  events,
  organizationSlug,
  view,
  filter
}: EventsContentProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');
  const [isPending, startTransition] = useTransition();

  const [optimisticEvents, setOptimisticEvents] = useOptimistic(
    events,
    (state, action: OptimisticAction) => {
      if (action.type === 'togglePublish') {
        return state.map((event) =>
          event.id === action.eventId ? { ...event, isPublished: action.isPublished } : event
        );
      }
      if (action.type === 'updateTime') {
        return state.map((event) =>
          event.id === action.eventId
            ? { ...event, startTime: new Date(action.startTime), endTime: new Date(action.endTime) }
            : event
        );
      }
      return state;
    }
  );

  const handleTogglePublish = async (eventId: string, newStatus: boolean) => {
    startTransition(async () => {
      setOptimisticEvents({ type: 'togglePublish', eventId, isPublished: newStatus });

      try {
        const result = await toggleEventPublish({
          eventId,
          isPublished: newStatus,
        });

        if (result?.serverError) {
          toast.error(result.serverError);
        } else {
          toast.success(
            newStatus ? t('status.publishedSuccess') : t('status.unpublishedSuccess')
          );
        }
      } catch (error) {
        toast.error(t('status.toggleError'));
      }
    });
  };

  const handleEventTimeUpdate = (eventId: string, startTime: string, endTime: string) => {
    startTransition(async () => {
      setOptimisticEvents({ type: 'updateTime', eventId, startTime, endTime });

      try {
        const result = await updateEventTime({ eventId, startTime, endTime });

        if (result?.serverError) {
          toast.error(result.serverError);
        }
      } catch (error) {
        toast.error(t('calendar.updateError'));
      }
    });
  };

  // Filter events based on the selected filter
  const filteredEvents = React.useMemo(() => {
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return optimisticEvents.filter(
          (e) => !e.isCancelled && new Date(e.startTime) >= now
        );
      case 'past':
        return optimisticEvents.filter(
          (e) => !e.isCancelled && new Date(e.startTime) < now
        );
      case 'cancelled':
        return optimisticEvents.filter((e) => e.isCancelled);
      default:
        return optimisticEvents;
    }
  }, [optimisticEvents, filter]);

  if (view === 'calendar') {
    return (
      <div className="h-[700px] px-4 py-4 sm:px-6">
        <EventCalendar
          events={filteredEvents}
          organizationSlug={organizationSlug}
          onEventTimeUpdate={handleEventTimeUpdate}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-6">
      <EventList
        events={filteredEvents}
        organizationSlug={organizationSlug}
      />
    </div>
  );
}
