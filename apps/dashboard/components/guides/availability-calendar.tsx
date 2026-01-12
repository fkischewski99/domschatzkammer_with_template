'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { isSameDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AvailabilityStatus } from '@workspace/database';

import { Button, buttonVariants } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { cn } from '@workspace/ui/lib/utils';

import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';
import { SetAvailabilityModal } from './set-availability-modal';
import { AvailabilityLegend } from './availability-legend';

interface AvailabilityCalendarProps {
  availabilities: GuideAvailabilityDto[];
  onRefresh?: () => void;
}

export function AvailabilityCalendar({
  availabilities,
  onRefresh,
}: AvailabilityCalendarProps): React.JSX.Element {
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;

  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Create a map of dates to availability for quick lookup
  const availabilityMap = React.useMemo(() => {
    const map = new Map<string, GuideAvailabilityDto>();
    for (const a of availabilities) {
      const dateKey = new Date(a.date).toDateString();
      map.set(dateKey, a);
    }
    return map;
  }, [availabilities]);

  const getAvailabilityForDate = (date: Date): GuideAvailabilityDto | undefined => {
    return availabilityMap.get(date.toDateString());
  };

  const handleDayClick = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setModalOpen(true);
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedDate(null);
    }
  };

  const handleSuccess = () => {
    onRefresh?.();
  };

  // Create modifiers for available and unavailable days
  const availableDays = availabilities
    .filter((a) => a.status === AvailabilityStatus.AVAILABLE)
    .map((a) => new Date(a.date));

  const unavailableDays = availabilities
    .filter((a) => a.status === AvailabilityStatus.UNAVAILABLE)
    .map((a) => new Date(a.date));

  return (
    <div className="space-y-4">
      <AvailabilityLegend />

      <Calendar
        mode="single"
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        locale={dateLocale}
        weekStartsOn={1}
        showOutsideDays
        onSelect={handleDayClick}
        className="p-3 border rounded-lg"
        modifiers={{
          available: availableDays,
          unavailable: unavailableDays,
        }}
        modifiersClassNames={{
          available: 'bg-green-500/20 border border-green-500',
          unavailable: 'bg-red-500/20 border border-red-500',
        }}
      />

      {selectedDate && (
        <SetAvailabilityModal
          date={selectedDate}
          existingAvailability={getAvailabilityForDate(selectedDate)}
          open={modalOpen}
          onOpenChange={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
