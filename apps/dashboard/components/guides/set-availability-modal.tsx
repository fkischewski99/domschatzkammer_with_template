'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { AvailabilityStatus } from '@workspace/database';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import { setAvailability } from '~/actions/guide-availability/set-availability';
import { deleteAvailability } from '~/actions/guide-availability/delete-availability';
import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';

interface SetAvailabilityModalProps {
  date: Date;
  existingAvailability?: GuideAvailabilityDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SetAvailabilityModal({
  date,
  existingAvailability,
  open,
  onOpenChange,
  onSuccess,
}: SetAvailabilityModalProps): React.JSX.Element {
  const t = useTranslations('guides.availability');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<AvailabilityStatus>(
    existingAvailability?.status ?? AvailabilityStatus.AVAILABLE
  );
  const [notes, setNotes] = React.useState(existingAvailability?.notes ?? '');

  // Reset form when modal opens with new date
  React.useEffect(() => {
    if (open) {
      setStatus(existingAvailability?.status ?? AvailabilityStatus.AVAILABLE);
      setNotes(existingAvailability?.notes ?? '');
      setError(null);
    }
  }, [open, existingAvailability]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await setAvailability({
        date,
        status,
        notes: notes.trim() || null,
      });

      if (result?.serverError) {
        setError(result.serverError);
        setLoading(false);
        return;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteAvailability({ date });

      if (result?.serverError) {
        setError(result.serverError);
        setLoading(false);
        return;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('setAvailability')}</DialogTitle>
          <DialogDescription>
            {format(date, 'EEEE, d. MMMM yyyy', { locale: dateLocale })}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">{t('status.label')}</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AvailabilityStatus)}
              disabled={loading}
            >
              <SelectTrigger id="status">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
              maxLength={500}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {existingAvailability && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t('delete')}
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
