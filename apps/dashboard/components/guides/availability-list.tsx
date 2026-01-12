'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { AvailabilityStatus } from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';
import { Check, X } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
} from '@workspace/ui/components/card';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';
import { setAvailability } from '~/actions/guide-availability/set-availability';
import { setAvailabilityRange } from '~/actions/guide-availability/set-availability-range';

// Format Date to YYYY-MM-DD string (timezone-safe)
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface AvailabilityListProps {
  availabilities: GuideAvailabilityDto[];
  daysToShow?: number;
}

export function AvailabilityList({
  availabilities,
  daysToShow = 30,
}: AvailabilityListProps): React.JSX.Element {
  const t = useTranslations('guides.availability');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;

  const [selectedDates, setSelectedDates] = React.useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = React.useState<AvailabilityStatus>(
    AvailabilityStatus.AVAILABLE
  );

  // Local state for INSTANT optimistic updates
  const [localAvailabilities, setLocalAvailabilities] =
    React.useState(availabilities);

  // Sync with server data when props change
  React.useEffect(() => {
    setLocalAvailabilities(availabilities);
  }, [availabilities]);

  // Generate list of dates from today
  const dates = React.useMemo(() => {
    const result: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < daysToShow; i++) {
      result.push(addDays(today, i));
    }
    return result;
  }, [daysToShow]);

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

  const toggleDate = (date: Date) => {
    const dateKey = date.toDateString();
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateKey)) {
      newSelected.delete(dateKey);
    } else {
      newSelected.add(dateKey);
    }
    setSelectedDates(newSelected);
  };

  const selectAll = () => {
    const allDateKeys = new Set(dates.map((d) => d.toDateString()));
    setSelectedDates(allDateKeys);
  };

  const clearSelection = () => {
    setSelectedDates(new Set());
  };

  // INSTANT status change - optimistic update pattern
  const handleSingleStatusChange = (date: Date, status: AvailabilityStatus) => {
    const dateString = formatDateString(date);

    // 1. INSTANT local state update
    setLocalAvailabilities((prev) => {
      const existingIndex = prev.findIndex(
        (a) => formatDateString(new Date(a.date)) === dateString
      );
      if (existingIndex >= 0) {
        return prev.map((a, i) =>
          i === existingIndex ? { ...a, status } : a
        );
      }
      return [
        ...prev,
        {
          id: `local-${dateString}`,
          date: dateString,
          status,
          notes: null,
        } as GuideAvailabilityDto,
      ];
    });

    // 2. Fire and forget - server action runs in background
    setAvailability({ date: dateString, status, notes: null })
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
  };

  // INSTANT bulk status change - optimistic update pattern
  const handleBulkSetStatus = () => {
    if (selectedDates.size === 0) return;

    // Find the date range from selected dates
    const selectedDateObjects = Array.from(selectedDates).map((ds) => new Date(ds));
    selectedDateObjects.sort((a, b) => a.getTime() - b.getTime());

    const startDate = selectedDateObjects[0];
    const endDate = selectedDateObjects[selectedDateObjects.length - 1];

    // Check if dates are consecutive - if so, use range endpoint
    const isConsecutive = selectedDateObjects.every((date, i) => {
      if (i === 0) return true;
      const prevDate = selectedDateObjects[i - 1];
      return isSameDay(addDays(prevDate, 1), date);
    });

    // 1. INSTANT local state update for all selected dates
    setLocalAvailabilities((prev) => {
      const selectedDateStrings = new Set(
        selectedDateObjects.map((d) => formatDateString(d))
      );

      // Update existing and track which ones we updated
      const updatedDateStrings = new Set<string>();
      const updated = prev.map((a) => {
        const aDateString = formatDateString(new Date(a.date));
        if (selectedDateStrings.has(aDateString)) {
          updatedDateStrings.add(aDateString);
          return { ...a, status: bulkStatus };
        }
        return a;
      });

      // Add new entries for dates that didn't exist
      const newEntries: GuideAvailabilityDto[] = [];
      for (const dateStr of selectedDateStrings) {
        if (!updatedDateStrings.has(dateStr)) {
          newEntries.push({
            id: `local-${dateStr}`,
            date: dateStr,
            status: bulkStatus,
            notes: null,
          } as GuideAvailabilityDto);
        }
      }

      return [...updated, ...newEntries];
    });

    // 2. Clear selection INSTANTLY
    setSelectedDates(new Set());

    // 3. Fire and forget - server actions run in background
    if (isConsecutive && selectedDateObjects.length > 1) {
      // Use range endpoint for consecutive dates
      setAvailabilityRange({
        startDate: formatDateString(startDate),
        endDate: formatDateString(endDate),
        status: bulkStatus,
        notes: null,
      })
        .then((result) => {
          if (result?.serverError) {
            toast.error(t('saveError'));
          } else {
            toast.success(t('bulkSaveSuccess'));
          }
        })
        .catch(() => {
          toast.error(t('saveError'));
        });
    } else {
      // Set each date individually in parallel
      Promise.all(
        selectedDateObjects.map((date) =>
          setAvailability({
            date: formatDateString(date),
            status: bulkStatus,
            notes: null,
          })
        )
      )
        .then((results) => {
          const hasError = results.some((r) => r?.serverError);
          if (hasError) {
            toast.error(t('saveError'));
          } else {
            toast.success(t('bulkSaveSuccess'));
          }
        })
        .catch(() => {
          toast.error(t('saveError'));
        });
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {t('list.selectAll')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedDates.size === 0}
          >
            {t('list.clearSelection')}
          </Button>
        </div>

        {selectedDates.size > 0 && (
          <div className="flex items-center gap-2">
            <Select
              value={bulkStatus}
              onValueChange={(value) => setBulkStatus(value as AvailabilityStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AvailabilityStatus.AVAILABLE}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {t('status.available')}
                  </span>
                </SelectItem>
                <SelectItem value={AvailabilityStatus.UNAVAILABLE}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {t('status.unavailable')}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleBulkSetStatus}>
              {t('list.setSelected')} ({selectedDates.size})
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('list.date')}</TableHead>
              <TableHead>{t('list.day')}</TableHead>
              <TableHead>{t('list.status')}</TableHead>
              <TableHead>{t('list.notes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dates.map((date) => {
              const dateKey = date.toDateString();
              const availability = getAvailabilityForDate(date);
              const isSelected = selectedDates.has(dateKey);
              const isToday = isSameDay(date, new Date());

              return (
                <TableRow
                  key={dateKey}
                  className={cn(
                    isToday && 'bg-accent/50',
                    isSelected && 'bg-primary/10'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDate(date)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {format(date, 'd. MMM yyyy', { locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    {format(date, 'EEEE', { locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={availability?.status === AvailabilityStatus.AVAILABLE ? 'default' : 'outline'}
                        size="icon"
                        className={cn(
                          'h-8 w-8',
                          availability?.status === AvailabilityStatus.AVAILABLE &&
                            'bg-green-500 hover:bg-green-600 text-white'
                        )}
                        onClick={() =>
                          handleSingleStatusChange(date, AvailabilityStatus.AVAILABLE)
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={availability?.status === AvailabilityStatus.UNAVAILABLE ? 'default' : 'outline'}
                        size="icon"
                        className={cn(
                          'h-8 w-8',
                          availability?.status === AvailabilityStatus.UNAVAILABLE &&
                            'bg-red-500 hover:bg-red-600 text-white'
                        )}
                        onClick={() =>
                          handleSingleStatusChange(date, AvailabilityStatus.UNAVAILABLE)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {availability?.notes || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
    </div>
  );
}
