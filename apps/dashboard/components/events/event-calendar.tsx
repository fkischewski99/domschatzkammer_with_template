'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  differenceInMinutes,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { Link } from '~/src/i18n/navigation';
import type { SerializedEventWithRelations } from '~/data/events/get-organization-events';

interface EventCalendarProps {
  events: SerializedEventWithRelations[];
  organizationSlug: string;
  initialDate?: Date;
}

const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 6; // 6 AM
const END_HOUR = 24; // 12 AM (midnight)
const TOTAL_HOURS = END_HOUR - START_HOUR;

export function EventCalendar({
  events,
  organizationSlug,
  initialDate = new Date(),
}: EventCalendarProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events.calendar');
  const [currentDate, setCurrentDate] = React.useState(initialDate);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const dayStart = startOfDay(day);
      const dayEnd = addDays(dayStart, 1);

      return (
        isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
        isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
        (eventStart <= dayStart && eventEnd >= dayEnd)
      );
    });
  };

  const getEventPosition = (event: SerializedEventWithRelations, day: Date) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const dayStart = startOfDay(day);

    // Calculate start position
    let startMinutes = differenceInMinutes(eventStart, dayStart);
    if (startMinutes < START_HOUR * 60) startMinutes = START_HOUR * 60;

    // Calculate end position
    let endMinutes = differenceInMinutes(eventEnd, dayStart);
    if (endMinutes > END_HOUR * 60) endMinutes = END_HOUR * 60;

    const topOffset = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;

    return { top: topOffset, height: Math.max(height, 20) };
  };

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t('today')}
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-16 flex-shrink-0 border-r" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex-1 text-center py-2 border-r last:border-r-0',
                  isSameDay(day, new Date()) && 'bg-primary/10'
                )}
              >
                <div className="text-sm font-medium">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    isSameDay(day, new Date()) && 'text-primary'
                  )}
                >
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="flex relative">
            {/* Time labels */}
            <div className="w-16 flex-shrink-0 border-r">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b text-xs text-muted-foreground pr-2 text-right pt-1"
                >
                  {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex-1 border-r last:border-r-0 relative',
                  isSameDay(day, new Date()) && 'bg-primary/5'
                )}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div key={hour} className="h-[60px] border-b" />
                ))}

                {/* Events */}
                {getEventsForDay(day).map((event) => {
                  const position = getEventPosition(event, day);
                  return (
                    <Link
                      key={event.id}
                      href={`/organizations/${organizationSlug}/events/${event.id}`}
                      className={cn(
                        'absolute left-1 right-1 rounded-md px-2 py-1 text-xs overflow-hidden',
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                        event.isCancelled && 'bg-destructive/50 line-through',
                        !event.isPublished && 'bg-muted text-muted-foreground border border-dashed'
                      )}
                      style={{
                        top: position.top,
                        height: position.height,
                      }}
                    >
                      <div className="font-medium truncate">{event.name}</div>
                      <div className="text-[10px] opacity-80 truncate">
                        {format(new Date(event.startTime), 'h:mm a')} -{' '}
                        {format(new Date(event.endTime), 'h:mm a')}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
