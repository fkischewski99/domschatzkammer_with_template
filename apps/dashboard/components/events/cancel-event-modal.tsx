'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import { cancelEvent } from '~/actions/events/admin/cancel-event';

interface CancelEventModalProps {
  eventId: string;
  eventName: string;
  organizationSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelEventModal({
  eventId,
  eventName,
  organizationSlug,
  open,
  onOpenChange,
}: CancelEventModalProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.events.cancel');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await cancelEvent({
        eventId,
        reason: reason.trim() || undefined,
      });

      if (result?.serverError) {
        setError(result.serverError);
        setLoading(false);
        return;
      }

      onOpenChange(false);
      router.push(`/organizations/${organizationSlug}/events`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { name: eventName })}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{t('reason.label')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reason.placeholder')}
              rows={3}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              {t('reason.hint')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('goBack')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? t('cancelling') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
