'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { Button } from '@workspace/ui/components/button';

import { CancelEventWithRefundsModal } from '~/components/events/cancel-event-with-refunds-modal';

interface CancelEventSectionProps {
  eventId: string;
  eventName: string;
  organizationSlug: string;
}

export function CancelEventSection({
  eventId,
  eventName,
  organizationSlug,
}: CancelEventSectionProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events');
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = React.useState(searchParams.get('cancel') === 'true');

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Remove cancel param from URL
      router.replace(`/organizations/${organizationSlug}/events/${eventId}`);
    }
  };

  return (
    <>
      <AnnotatedSection
        title={t('cancel.sectionTitle')}
        description={t('cancel.sectionDescription')}
      >
        <Button variant="outline" onClick={() => setOpen(true)}>
          {t('cancel.button')}
        </Button>
      </AnnotatedSection>

      <CancelEventWithRefundsModal
        eventId={eventId}
        eventName={eventName}
        organizationSlug={organizationSlug}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
