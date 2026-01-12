'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin, Users, MoreHorizontal } from 'lucide-react';
import { Link } from '~/src/i18n/navigation';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

import type { SerializedEventWithRelations } from '~/data/events/get-organization-events';
import { toggleEventPublish } from '~/actions/events/admin/toggle-publish';

interface EventCardProps {
  event: SerializedEventWithRelations;
  organizationSlug: string;
}

export function EventCard({ event, organizationSlug }: EventCardProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');
  const [isToggling, setIsToggling] = React.useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleTogglePublish = async () => {
    setIsToggling(true);
    try {
      await toggleEventPublish({
        eventId: event.id,
        isPublished: !event.isPublished,
      });
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusBadge = () => {
    if (event.isCancelled) {
      return <Badge variant="destructive">{t('status.cancelled')}</Badge>;
    }
    if (event.isPublished) {
      return <Badge variant="default">{t('status.published')}</Badge>;
    }
    return <Badge variant="secondary">{t('status.draft')}</Badge>;
  };

  const ticketsSold = event.ticket.stock !== null
    ? (event.ticket.stock - (event.ticket.stock ?? 0))
    : null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {event.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description || t('noDescription')}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t('actions.menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/organizations/${organizationSlug}/events/${event.id}`}>
                  {t('actions.edit')}
                </Link>
              </DropdownMenuItem>
              {!event.isCancelled && (
                <DropdownMenuItem
                  onClick={handleTogglePublish}
                  disabled={isToggling}
                >
                  {event.isPublished ? t('actions.unpublish') : t('actions.publish')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/organizations/${organizationSlug}/events/${event.id}?cancel=true`}
                  className="text-destructive"
                >
                  {t('actions.cancel')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="pt-2">
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.startTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">
            {event.location.name}, {event.location.city}
          </span>
        </div>

        {event.ticket.stock !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {event.ticket.stock} {t('ticketsAvailable')}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="text-lg font-semibold">
            {Number(event.ticket.price).toFixed(2)} {event.ticket.currency}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organizations/${organizationSlug}/events/${event.id}`}>
              {t('actions.viewDetails')}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
