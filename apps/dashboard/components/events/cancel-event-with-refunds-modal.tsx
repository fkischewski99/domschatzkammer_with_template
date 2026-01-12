'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertTriangle, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

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
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { Progress } from '@workspace/ui/components/progress';

import { getEventRefundPreview } from '~/actions/events/admin/get-event-refund-preview';
import { cancelEventWithRefunds } from '~/actions/events/admin/cancel-event-with-refunds';
import { retryFailedRefunds } from '~/actions/events/admin/retry-failed-refunds';

type ModalState = 'loading' | 'confirm' | 'processing' | 'results' | 'error';

type PreviewData = {
  eventId: string;
  eventName: string;
  purchaseCount: number;
  paidPurchaseCount: number;
  freePurchaseCount: number;
  totalRefundAmount: number;
  currency: string;
  hasStripeConnect: boolean;
};

type CancelResult = {
  success: boolean;
  eventCancelled: boolean;
  refundResults: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    totalRefundedAmount: number;
  };
  emailsSent: number;
  failedRefunds: Array<{ purchaseId: string; error: string }>;
};

interface CancelEventWithRefundsModalProps {
  eventId: string;
  eventName: string;
  organizationSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelEventWithRefundsModal({
  eventId,
  eventName,
  organizationSlug,
  open,
  onOpenChange,
}: CancelEventWithRefundsModalProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.events.cancel');

  const [modalState, setModalState] = React.useState<ModalState>('loading');
  const [preview, setPreview] = React.useState<PreviewData | null>(null);
  const [result, setResult] = React.useState<CancelResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [retrying, setRetrying] = React.useState(false);

  // Load preview data when modal opens
  React.useEffect(() => {
    if (open) {
      setModalState('loading');
      setError(null);
      setResult(null);
      setProgress(0);

      getEventRefundPreview({ eventId })
        .then((res) => {
          if (res?.serverError) {
            setError(res.serverError);
            setModalState('error');
            return;
          }
          if (res?.data) {
            setPreview(res.data);
            setModalState('confirm');
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load preview');
          setModalState('error');
        });
    }
  }, [open, eventId]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCancel = async () => {
    if (!preview) return;

    setModalState('processing');
    setProgress(0);

    // Simulate progress (actual progress is not available from server action)
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const res = await cancelEventWithRefunds({
        eventId,
        reason: reason.trim() || undefined,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (res?.serverError) {
        setError(res.serverError);
        setModalState('error');
        return;
      }

      if (res?.data) {
        setResult(res.data);
        setModalState('results');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setModalState('error');
    }
  };

  const handleRetry = async () => {
    if (!result || result.failedRefunds.length === 0) return;

    setRetrying(true);

    try {
      const res = await retryFailedRefunds({
        eventId,
        purchaseIds: result.failedRefunds.map((f) => f.purchaseId),
      });

      if (res?.serverError) {
        setError(res.serverError);
        return;
      }

      if (res?.data) {
        const retryData = res.data;
        // Update result with new retry results
        setResult((prev) =>
          prev
            ? {
                ...prev,
                refundResults: {
                  ...prev.refundResults,
                  successful: prev.refundResults.successful + retryData.results.successful,
                  failed: retryData.results.failed,
                },
                emailsSent: prev.emailsSent + retryData.emailsSent,
                failedRefunds: retryData.failedRefunds,
              }
            : prev
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setRetrying(false);
    }
  };

  const handleClose = () => {
    if (result?.eventCancelled) {
      router.push(`/organizations/${organizationSlug}/events`);
    }
    onOpenChange(false);
  };

  const renderContent = () => {
    switch (modalState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t('withRefunds.loading')}
            </p>
          </div>
        );

      case 'confirm':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('withRefunds.title')}</DialogTitle>
              <DialogDescription>
                {t('description', { name: eventName })}
              </DialogDescription>
            </DialogHeader>

            {!preview?.hasStripeConnect && (preview?.paidPurchaseCount ?? 0) > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('withRefunds.noStripeConnect.title')}</AlertTitle>
                <AlertDescription>
                  {t('withRefunds.noStripeConnect.description')}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-4">
              {preview && preview.purchaseCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('withRefunds.summary.title')}</AlertTitle>
                  <AlertDescription className="mt-2 space-y-1">
                    <p>
                      {t('withRefunds.summary.purchases', { count: preview.purchaseCount })}
                    </p>
                    {preview.paidPurchaseCount > 0 && (
                      <p>
                        {t('withRefunds.summary.refundAmount', {
                          amount: formatCurrency(preview.totalRefundAmount, preview.currency),
                        })}
                      </p>
                    )}
                    {preview.freePurchaseCount > 0 && (
                      <p className="text-muted-foreground">
                        {t('withRefunds.summary.freeTickets', {
                          count: preview.freePurchaseCount,
                        })}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {preview && preview.purchaseCount === 0 && (
                <Alert>
                  <AlertDescription>
                    {t('withRefunds.noPurchases')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">{t('reason.label')}</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('reason.placeholder')}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">{t('reason.hint')}</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('goBack')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={!preview?.hasStripeConnect && (preview?.paidPurchaseCount ?? 0) > 0}
              >
                {t('withRefunds.confirm')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'processing':
        return (
          <div className="space-y-6 py-8">
            <DialogHeader>
              <DialogTitle>{t('withRefunds.processing.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {t('withRefunds.processing.description')}
              </p>
            </div>
          </div>
        );

      case 'results':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('withRefunds.results.title')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {result?.refundResults.failed === 0 ? (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">
                    {t('withRefunds.results.success')}
                  </AlertTitle>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{t('withRefunds.results.partial')}</AlertTitle>
                </Alert>
              )}

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('withRefunds.results.refundsProcessed')}
                  </span>
                  <span className="font-medium text-green-600">
                    {result?.refundResults.successful}
                  </span>
                </div>
                {result && result.refundResults.skipped > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('withRefunds.results.freeTicketsInvalidated')}
                    </span>
                    <span className="font-medium">{result.refundResults.skipped}</span>
                  </div>
                )}
                {result && result.refundResults.failed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('withRefunds.results.refundsFailed')}
                    </span>
                    <span className="font-medium text-red-600">
                      {result.refundResults.failed}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">
                    {t('withRefunds.results.emailsSent')}
                  </span>
                  <span className="font-medium">{result?.emailsSent}</span>
                </div>
                {result && result.refundResults.totalRefundedAmount > 0 && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">
                      {t('withRefunds.results.totalRefunded')}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        result.refundResults.totalRefundedAmount,
                        preview?.currency ?? 'EUR'
                      )}
                    </span>
                  </div>
                )}
              </div>

              {result && result.failedRefunds.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">
                    {t('withRefunds.results.failedDetails')}
                  </h4>
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-destructive/50 p-2">
                    {result.failedRefunds.map((f) => (
                      <div key={f.purchaseId} className="text-sm">
                        <span className="font-mono text-xs">{f.purchaseId.slice(0, 8)}...</span>
                        <span className="text-muted-foreground ml-2">{f.error}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="w-full"
                  >
                    {retrying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('withRefunds.results.retrying')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('withRefunds.results.retryFailed')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                {t('withRefunds.results.close')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'error':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('withRefunds.error.title')}</DialogTitle>
            </DialogHeader>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('goBack')}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={modalState === 'processing' ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">{renderContent()}</DialogContent>
    </Dialog>
  );
}
