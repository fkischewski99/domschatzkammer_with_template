'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { AvailabilityStatus } from '@workspace/database';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';

import type { GuideWithAvailabilityDto } from '~/types/dtos/guide-availability-dto';

interface GuideAvailabilityOverviewProps {
  guides: GuideWithAvailabilityDto[];
  daysToShow?: number;
}

export function GuideAvailabilityOverview({
  guides,
  daysToShow = 14,
}: GuideAvailabilityOverviewProps): React.JSX.Element {
  const t = useTranslations('guides.overview');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;

  // Generate list of dates from today
  const dates = React.useMemo(() => {
    const result: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < daysToShow; i++) {
      result.push(addDays(today, i));
    }
    return result;
  }, [daysToShow]);

  const getInitials = (name: string | null, email: string | null): string => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const getAvailabilityStatus = (
    guide: GuideWithAvailabilityDto,
    date: Date
  ): AvailabilityStatus | null => {
    const availability = guide.availabilities.find((a) =>
      isSameDay(new Date(a.date), date)
    );
    return availability?.status ?? null;
  };

  if (guides.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noGuides')}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                {t('guide')}
              </TableHead>
              {dates.map((date) => (
                <TableHead
                  key={date.toISOString()}
                  className={cn(
                    'text-center min-w-[80px]',
                    isSameDay(date, new Date()) && 'bg-accent'
                  )}
                >
                  <div className="text-xs font-normal">
                    {format(date, 'EEE', { locale: dateLocale })}
                  </div>
                  <div className="font-medium">
                    {format(date, 'd.M.', { locale: dateLocale })}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides.map((guide) => (
              <TableRow key={guide.id}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={guide.image ?? undefined} />
                      <AvatarFallback>
                        {getInitials(guide.name, guide.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {guide.name || guide.email}
                      </div>
                      {guide.name && (
                        <div className="text-sm text-muted-foreground truncate">
                          {guide.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                {dates.map((date) => {
                  const status = getAvailabilityStatus(guide, date);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <TableCell
                      key={date.toISOString()}
                      className={cn(
                        'text-center',
                        isToday && 'bg-accent/50'
                      )}
                    >
                      {status === AvailabilityStatus.AVAILABLE && (
                        <div className="mx-auto h-6 w-6 rounded bg-green-500/20 border border-green-500" />
                      )}
                      {status === AvailabilityStatus.UNAVAILABLE && (
                        <div className="mx-auto h-6 w-6 rounded bg-red-500/20 border border-red-500" />
                      )}
                      {status === null && (
                        <div className="mx-auto h-6 w-6 rounded border border-dashed border-muted-foreground/30" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
