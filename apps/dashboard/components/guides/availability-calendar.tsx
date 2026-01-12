'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { de, enUS } from 'date-fns/locale';
import { AvailabilityStatus } from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';

import { Calendar } from '@workspace/ui/components/calendar';
import {
  Card,
  CardContent,
} from '@workspace/ui/components/card';

import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';
import { SetAvailabilityModal } from './set-availability-modal';
import { setAvailability } from '~/actions/guide-availability/set-availability';
import { deleteAvailability } from '~/actions/guide-availability/delete-availability';

// Format Date to YYYY-MM-DD string (timezone-safe)
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface AvailabilityCalendarProps {
  availabilities: GuideAvailabilityDto[];
}

export function AvailabilityCalendar({
  availabilities,
}: AvailabilityCalendarProps): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('guides.availability');
  const dateLocale = locale === 'de' ? de : enUS;

  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Local state for INSTANT updates - no useOptimistic, no transitions
  const [localAvailabilities, setLocalAvailabilities] = React.useState(availabilities);

  // Sync with server data when props change
  React.useEffect(() => {
    setLocalAvailabilities(availabilities);
  }, [availabilities]);

  // Create a map of dates to availability for quick lookup
  const availabilityMap = React.useMemo(() => {
    const map = new Map<string, GuideAvailabilityDto>();
    for (const a of localAvailabilities) {
      const dateKey = new Date(a.date).toDateString();
      map.set(dateKey, a);
    }
    return map;
  }, [localAvailabilities]);

  const getAvailabilityForDate = (date: Date): GuideAvailabilityDto | undefined => {
    return availabilityMap.get(date.toDateString());
  };

  const handleDayClick = React.useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setModalOpen(true);
    }
  }, []);

  const handleModalClose = React.useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedDate(null);
    }
  }, []);

  // INSTANT save - pure setState, no transitions, no awaits
  const handleOptimisticSave = React.useCallback(
    (date: Date, status: AvailabilityStatus, notes: string | null) => {
      const dateString = formatDateString(date);

      // 1. INSTANT local state update (synchronous!)
      setLocalAvailabilities((prev) => {
        const existingIndex = prev.findIndex(
          (a) => formatDateString(new Date(a.date)) === dateString
        );
        if (existingIndex >= 0) {
          return prev.map((a, i) =>
            i === existingIndex ? { ...a, status, notes } : a
          );
        }
        return [
          ...prev,
          {
            id: `local-${dateString}`,
            date: dateString,
            status,
            notes,
          } as GuideAvailabilityDto,
        ];
      });

      // 2. Close modal INSTANTLY
      setModalOpen(false);
      setSelectedDate(null);

      // 3. Fire and forget - server action runs in background
      setAvailability({ date: dateString, status, notes })
        .then((result) => {
          if (result?.serverError) {
            toast.error(t('saveError'));
          } else {
            toast.success(t('saveSuccess'));
          }
        })
        .catch(() => {
          toast.error(t('saveError'));
        });
    },
    [t]
  );

  // INSTANT delete - pure setState
  const handleOptimisticDelete = React.useCallback(
    (date: Date) => {
      const dateString = formatDateString(date);

      // 1. INSTANT local state update
      setLocalAvailabilities((prev) =>
        prev.filter((a) => formatDateString(new Date(a.date)) !== dateString)
      );

      // 2. Close modal INSTANTLY
      setModalOpen(false);
      setSelectedDate(null);

      // 3. Fire and forget
      deleteAvailability({ date: dateString })
        .then((result) => {
          if (result?.serverError) {
            toast.error(t('deleteError'));
          } else {
            toast.success(t('deleteSuccess'));
          }
        })
        .catch(() => {
          toast.error(t('deleteError'));
        });
    },
    [t]
  );

  // Memoize modifiers for available and unavailable days - single iteration
  const { availableDays, unavailableDays } = React.useMemo(() => {
    const available: Date[] = [];
    const unavailable: Date[] = [];

    for (const a of localAvailabilities) {
      const date = new Date(a.date);
      if (a.status === AvailabilityStatus.AVAILABLE) {
        available.push(date);
      } else if (a.status === AvailabilityStatus.UNAVAILABLE) {
        unavailable.push(date);
      }
    }

    return { availableDays: available, unavailableDays: unavailable };
  }, [localAvailabilities]);

  // Memoize modifiers object to prevent Calendar re-renders
  const modifiers = React.useMemo(
    () => ({
      available: availableDays,
      unavailable: unavailableDays,
    }),
    [availableDays, unavailableDays]
  );

  return (
    <div className="max-w-md">
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={dateLocale}
            weekStartsOn={1}
            showOutsideDays
            onSelect={handleDayClick}
            className="w-full"
            modifiers={modifiers}
            modifiersClassNames={{
              available: 'bg-green-500/20 border border-green-500',
              unavailable: 'bg-red-500/20 border border-red-500',
            }}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <SetAvailabilityModal
          date={selectedDate}
          existingAvailability={getAvailabilityForDate(selectedDate)}
          open={modalOpen}
          onOpenChange={handleModalClose}
          onOptimisticSave={handleOptimisticSave}
          onOptimisticDelete={handleOptimisticDelete}
        />
      )}
    </div>
  );
}
