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

import { deleteTicket } from '~/actions/tickets/admin/delete-ticket';

interface DeleteTicketButtonProps {
  ticketId: string;
  ticketName: string;
  organizationSlug: string;
}

export function DeleteTicketButton({
  ticketId,
  ticketName,
  organizationSlug,
}: DeleteTicketButtonProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.tickets.delete');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteTicket({ id: ticketId });

      if (result?.serverError) {
        setError(result.serverError);
        setLoading(false);
        return;
      }

      // Success - redirect to tickets list
      router.push(`/organizations/${organizationSlug}/settings/organization/tickets`);
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
              {t('confirm.description', { name: ticketName })}
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
