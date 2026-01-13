'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  startOfDay,
  addMinutes,
  addHours,
  differenceInMinutes,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

import { Link } from '~/src/i18n/navigation';
import type { SerializedEventWithRelations } from '~/data/events/get-organization-events';
import { getLocationColor, getContrastColor } from '~/lib/location-colors';
import { calculateEventLayout } from '~/lib/calendar-layout';

interface EventCalendarProps {
  events: SerializedEventWithRelations[];
  organizationSlug: string;
  initialDate?: Date;
  onEventTimeUpdate?: (eventId: string, startTime: string, endTime: string) => void;
}

const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 6; // 6 AM
const END_HOUR = 24; // 12 AM (midnight)
const TOTAL_HOURS = END_HOUR - START_HOUR;
const LAYOUT_PADDING = 2; // percentage padding from edges

interface PendingCreate {
  day: Date;
  startTime: Date;
  endTime: Date;
  position: { top: number; height: number };
}

// Draggable Event Component
function DraggableEvent({
  event,
  position,
  bgColor,
  textColor,
  organizationSlug,
  isDragging,
}: {
  event: SerializedEventWithRelations;
  position: { top: number; height: number; left: string; width: string };
  bgColor: string;
  textColor: string;
  organizationSlug: string;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: event.id,
    data: { event },
  });

  const isCancelled = event.isCancelled;
  const isUnpublished = !event.isPublished;

  // Don't allow dragging cancelled events
  const canDrag = !isCancelled;

  const style: React.CSSProperties = {
    top: position.top,
    height: position.height,
    left: position.left,
    width: position.width,
    backgroundColor: isCancelled ? 'hsl(var(--destructive) / 0.5)' : bgColor,
    color: isCancelled ? 'hsl(var(--muted-foreground))' : textColor,
    opacity: isDragging ? 0.5 : isUnpublished ? 0.7 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div
      ref={canDrag ? setNodeRef : undefined}
      data-event
      className={cn(
        'absolute rounded-md px-2 py-1 text-xs overflow-hidden transition-opacity z-10',
        'hover:opacity-90',
        isCancelled && 'opacity-50 line-through',
        isUnpublished && 'border border-dashed',
        canDrag && 'cursor-grab active:cursor-grabbing'
      )}
      style={style}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
    >
      <Link
        href={`/organizations/${organizationSlug}/events/${event.id}`}
        className="block w-full h-full"
        onClick={(e) => {
          // Allow click-through for navigation when not dragging
          if (transform) {
            e.preventDefault();
          }
        }}
      >
        <div className="font-medium truncate">{event.name}</div>
        <div className="text-[10px] opacity-80 truncate">
          {format(new Date(event.startTime), 'h:mm a')} -{' '}
          {format(new Date(event.endTime), 'h:mm a')}
        </div>
        {event.guide && (
          <div className="text-[10px] opacity-70 truncate mt-0.5">
            {event.guide.name || event.guide.email}
          </div>
        )}
      </Link>
    </div>
  );
}

// Droppable Time Slot Component
function DroppableTimeSlot({
  day,
  hour,
  isOver,
}: {
  day: Date;
  hour: number;
  isOver: boolean;
}) {
  const dropId = `${day.toISOString()}-${hour}`;
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: { day, hour },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-[60px] border-b',
        isOver && 'bg-primary/10'
      )}
    />
  );
}

// Drag Overlay for showing event while dragging
function EventDragOverlay({
  event,
  bgColor,
  textColor,
}: {
  event: SerializedEventWithRelations;
  bgColor: string;
  textColor: string;
}) {
  const duration = differenceInMinutes(new Date(event.endTime), new Date(event.startTime));
  const height = (duration / 60) * HOUR_HEIGHT;

  return (
    <div
      className="rounded-md px-2 py-1 text-xs overflow-hidden shadow-lg cursor-grabbing opacity-90"
      style={{
        width: 150,
        height: Math.max(height, 30),
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="font-medium truncate">{event.name}</div>
      <div className="text-[10px] opacity-80 truncate">
        {format(new Date(event.startTime), 'h:mm a')} -{' '}
        {format(new Date(event.endTime), 'h:mm a')}
      </div>
    </div>
  );
}

export function EventCalendar({
  events,
  organizationSlug,
  initialDate = new Date(),
  onEventTimeUpdate,
}: EventCalendarProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.events.calendar');
  const [currentDate, setCurrentDate] = React.useState(initialDate);
  const [pendingCreate, setPendingCreate] = React.useState<PendingCreate | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  // Configure drag sensor with activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
      },
    })
  );

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = React.useCallback((day: Date) => {
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
  }, [events]);

  // Calculate layout positions for each day
  const layoutPositions = React.useMemo(() => {
    const positions: Map<string, Map<string, ReturnType<typeof calculateEventLayout> extends Map<string, infer V> ? V : never>> = new Map();

    for (const day of weekDays) {
      const dayEvents = getEventsForDay(day);
      const dayLayout = calculateEventLayout(dayEvents, day, {
        hourHeight: HOUR_HEIGHT,
        startHour: START_HOUR,
        endHour: END_HOUR,
        padding: LAYOUT_PADDING,
      });
      positions.set(day.toISOString(), dayLayout);
    }

    return positions;
  }, [weekDays, getEventsForDay]);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // Create a map of location IDs to indices for consistent default colors
  const locationIndexMap = React.useMemo(() => {
    const uniqueLocationIds = [...new Set(events.map((e) => e.locationId))];
    return new Map(uniqueLocationIds.map((id, index) => [id, index]));
  }, [events]);

  // Find active event for drag overlay
  const activeEvent = React.useMemo(() => {
    if (!activeId) return null;
    return events.find((e) => e.id === activeId);
  }, [activeId, events]);

  // Click handler for creating new events
  const handleDayClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
    // Ignore clicks on existing events or during drag
    if ((e.target as HTMLElement).closest('[data-event]')) return;
    if (activeId) return; // Don't create while dragging

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    // Round to full hour
    const minutes = Math.round(clickY / HOUR_HEIGHT) * 60;
    const startTime = addMinutes(startOfDay(day), START_HOUR * 60 + minutes);
    const endTime = addHours(startTime, 1); // 1 hour default duration

    const topPosition = (minutes / 60) * HOUR_HEIGHT;

    setPendingCreate({
      day,
      startTime,
      endTime,
      position: { top: topPosition, height: HOUR_HEIGHT },
    });
  };

  // Handle click on create button
  const handleCreateClick = () => {
    if (!pendingCreate) return;

    router.push(
      `/organizations/${organizationSlug}/events/create?startTime=${pendingCreate.startTime.toISOString()}&endTime=${pendingCreate.endTime.toISOString()}`
    );
  };

  // Escape handler to dismiss pending create
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingCreate(null);
        setActiveId(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setPendingCreate(null); // Clear pending create when starting drag
  };

  const handleDragOver = (event: { over: { id: string | number } | null }) => {
    setOverId(event.over?.id?.toString() ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || !onEventTimeUpdate) return;

    const eventId = active.id as string;
    const draggedEvent = events.find((e) => e.id === eventId);
    if (!draggedEvent) return;

    // Parse drop target ID: "day-hour"
    const dropData = over.data.current as { day: Date; hour: number } | undefined;
    if (!dropData) return;

    const { day, hour } = dropData;

    // Calculate new times
    const eventDuration = differenceInMinutes(
      new Date(draggedEvent.endTime),
      new Date(draggedEvent.startTime)
    );

    const newStartTime = addMinutes(startOfDay(day), hour * 60);
    const newEndTime = addMinutes(newStartTime, eventDuration);

    // Don't update if time hasn't changed
    const oldStart = new Date(draggedEvent.startTime);
    if (
      isSameDay(oldStart, newStartTime) &&
      oldStart.getHours() === newStartTime.getHours() &&
      oldStart.getMinutes() === newStartTime.getMinutes()
    ) {
      return;
    }

    // Call the parent's handler - it manages optimistic state via useOptimistic
    onEventTimeUpdate(eventId, newStartTime.toISOString(), newEndTime.toISOString());
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Use a stable ID to prevent hydration mismatch with dnd-kit
  const dndContextId = React.useId();

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
              {weekDays.map((day) => {
                const dayLayout = layoutPositions.get(day.toISOString());
                const dayEvents = getEventsForDay(day);
                const isPendingDay = pendingCreate && isSameDay(pendingCreate.day, day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'flex-1 border-r last:border-r-0 relative cursor-pointer',
                      isSameDay(day, new Date()) && 'bg-primary/5'
                    )}
                    onClick={(e) => handleDayClick(e, day)}
                  >
                    {/* Hour grid lines (droppable) */}
                    {hours.map((hour) => {
                      const dropId = `${day.toISOString()}-${hour}`;
                      const isOverThisSlot = overId === dropId;
                      return (
                        <DroppableTimeSlot
                          key={hour}
                          day={day}
                          hour={hour}
                          isOver={isOverThisSlot}
                        />
                      );
                    })}

                    {/* Click-to-Create Overlay */}
                    {isPendingDay && pendingCreate && !activeId && (
                      <div
                        data-create-overlay
                        className="absolute left-1 right-1 bg-primary/20 border-2 border-dashed border-primary rounded-md flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors z-20"
                        style={{
                          top: pendingCreate.position.top,
                          height: pendingCreate.position.height,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateClick();
                        }}
                      >
                        <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                          <Plus className="h-6 w-6" />
                        </div>
                        <span className="sr-only">{t('clickToCreate')}</span>
                      </div>
                    )}

                    {/* Events */}
                    {dayEvents.map((event) => {
                      const position = dayLayout?.get(event.id);
                      if (!position) return null;

                      const locationIndex = locationIndexMap.get(event.locationId) ?? 0;
                      const bgColor = getLocationColor(event.location?.color, locationIndex);
                      const textColor = getContrastColor(bgColor);

                      return (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          position={position}
                          bgColor={bgColor}
                          textColor={textColor}
                          organizationSlug={organizationSlug}
                          isDragging={activeId === event.id}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeEvent && (
          <EventDragOverlay
            event={activeEvent}
            bgColor={getLocationColor(
              activeEvent.location?.color,
              locationIndexMap.get(activeEvent.locationId) ?? 0
            )}
            textColor={getContrastColor(
              getLocationColor(
                activeEvent.location?.color,
                locationIndexMap.get(activeEvent.locationId) ?? 0
              )
            )}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
