'use client';

import * as React from 'react';
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
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';

import { assignGuideToEvent } from '~/actions/events/admin/assign-guide-to-event';
import type { GuideForAssignment } from '~/data/events/get-available-guides-for-event';

interface AssignGuideModalProps {
  eventId: string;
  eventName: string;
  guides: GuideForAssignment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AssignGuideModal({
  eventId,
  eventName,
  guides,
  open,
  onOpenChange,
  onSuccess,
}: AssignGuideModalProps): React.JSX.Element {
  const t = useTranslations('organization.settings.events.guide');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedGuideId, setSelectedGuideId] = React.useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedGuideId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await assignGuideToEvent({
        eventId,
        guideId: selectedGuideId,
      });

      if (result?.serverError) {
        setError(result.serverError);
        setLoading(false);
        return;
      }

      setLoading(false);
      onOpenChange(false);
      setSelectedGuideId(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedGuideId(null);
      setError(null);
      setLoading(false);
    }
    onOpenChange(open);
  };

  // Sort guides: available first, then by name
  const sortedGuides = [...guides].sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1;
    }
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('assign')}</DialogTitle>
          <DialogDescription>
            {t('selectGuide')} - {eventName}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          {sortedGuides.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('noGuidesAvailable')}
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sortedGuides.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  disabled={loading}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                    selectedGuideId === guide.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50',
                    !guide.isAvailable && 'opacity-60'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    {guide.image && <AvatarImage src={guide.image} alt={guide.name || ''} />}
                    <AvatarFallback>{getInitials(guide.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{guide.name || guide.email}</p>
                    {guide.name && (
                      <p className="text-sm text-muted-foreground truncate">{guide.email}</p>
                    )}
                    {guide.availabilityNote && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {guide.availabilityNote}
                      </p>
                    )}
                  </div>
                  <Badge variant={guide.isAvailable ? 'default' : 'secondary'}>
                    {guide.isAvailable ? t('available') : t('unavailable')}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={loading || !selectedGuideId}
          >
            {loading ? t('assigning') : t('confirmAssign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
