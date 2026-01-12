'use client';

import { CalendarPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@workspace/ui/components/empty-state';

import { AddEventButton } from './add-event-button';

export type EventsEmptyStateProps = {
  organizationSlug: string;
};

export function EventsEmptyState({
  organizationSlug
}: EventsEmptyStateProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');

  return (
    <div className="p-6">
      <EmptyState
        icon={
          <div className="flex size-12 items-center justify-center rounded-md border">
            <CalendarPlus className="size-6 shrink-0 text-muted-foreground" />
          </div>
        }
        title={t('emptyState.title')}
        description={t('emptyState.description')}
      >
        <AddEventButton organizationSlug={organizationSlug} />
      </EmptyState>
    </div>
  );
}
