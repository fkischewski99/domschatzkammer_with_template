'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AvailabilityStatus } from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';

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

import { setAvailability } from '~/actions/guide-availability/set-availability';
import { deleteAvailability } from '~/actions/guide-availability/delete-availability';
import type { GuideAvailabilityDto } from '~/types/dtos/guide-availability-dto';

// Format Date to YYYY-MM-DD string (timezone-safe)
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface SetAvailabilityModalProps {
  date: Date;
  existingAvailability?: GuideAvailabilityDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetAvailabilityModal({
  date,
  existingAvailability,
  open,
  onOpenChange,
}: SetAvailabilityModalProps): React.JSX.Element {
  const t = useTranslations('guides.availability');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;
  const router = useRouter();

  const [status, setStatus] = React.useState<AvailabilityStatus>(
    existingAvailability?.status ?? AvailabilityStatus.AVAILABLE
  );
  const [notes, setNotes] = React.useState(existingAvailability?.notes ?? '');
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form when modal opens with new date
  React.useEffect(() => {
    if (open) {
      setStatus(existingAvailability?.status ?? AvailabilityStatus.AVAILABLE);
      setNotes(existingAvailability?.notes ?? '');
    }
  }, [open, existingAvailability]);

  const handleSave = async () => {
    const trimmedNotes = notes.trim() || null;
    setIsSaving(true);

    try {
      const result = await setAvailability({
        date: formatDateString(date),
        status,
        notes: trimmedNotes,
      });

      if (result?.serverError) {
        toast.error(t('saveError'));
        return;
      }

      toast.success(t('saveSuccess'));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast.error(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);

    try {
      const result = await deleteAvailability({ date: formatDateString(date) });

      if (result?.serverError) {
        toast.error(t('deleteError'));
        return;
      }

      toast.success(t('deleteSuccess'));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete availability:', error);
      toast.error(t('deleteError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('setAvailability')}</DialogTitle>
          <DialogDescription>
            {format(date, 'EEEE, d. MMMM yyyy', { locale: dateLocale })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">{t('status.label')}</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AvailabilityStatus)}
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
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {existingAvailability && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
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
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
