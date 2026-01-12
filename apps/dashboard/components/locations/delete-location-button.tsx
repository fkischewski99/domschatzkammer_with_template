'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@workspace/ui/components/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import { deleteLocation } from '~/actions/locations/admin/delete-location';

interface DeleteLocationButtonProps {
  locationId: string;
  locationName: string;
  organizationSlug: string;
}

export function DeleteLocationButton({
  locationId,
  locationName,
  organizationSlug,
}: DeleteLocationButtonProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.locations.delete');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteLocation({ id: locationId });

      if (result?.serverError) {
        setError(result.serverError);
        setLoading(false);
        return;
      }

      router.push(`/organizations/${organizationSlug}/settings/organization/locations`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={loading}>
            {t('button')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm.description', { name: locationName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t('confirm.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? t('confirm.deleting') : t('confirm.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
