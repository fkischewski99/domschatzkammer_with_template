'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import type { PurchaseDetails } from '~/data/purchases/get-purchase-by-id';
import Image from 'next/image';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { resendPurchaseEmail } from '~/actions/purchases/resend-email';

interface PurchaseDetailProps {
  purchase: PurchaseDetails;
  organizationSlug: string;
}

export function PurchaseDetail({
  purchase,
  organizationSlug
}: PurchaseDetailProps): React.JSX.Element {
  const t = useTranslations('purchases');
  const [isResending, setIsResending] = React.useState(false);

  const handleResendEmail = async () => {
    if (!confirm('Resend purchase confirmation email to the customer?')) {
      return;
    }

    setIsResending(true);
    try {
      const result = await resendPurchaseEmail({ purchaseId: purchase.id });
      if (result?.data) {
        alert('Email resent successfully!');
      } else if (result?.serverError) {
        alert(`Failed to resend email: ${result.serverError}`);
      } else if (result?.validationErrors) {
        alert('Invalid purchase ID');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
    PENDING: 'secondary',
    COMPLETED: 'default',
    REFUNDED: 'destructive',
  };

  return (
    <div className="space-y-6">
      {/* Purchase Status Section */}
      <AnnotatedSection
        title="Status"
        description="Current state of this purchase"
        contentClassName="md:col-span-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <Badge variant={statusColors[purchase.status]}>
              {purchase.status}
            </Badge>
            {purchase.invalidated && (
              <Badge variant="destructive" className="ml-2">
                Invalidated
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Purchased on {purchase.purchasedAt.toLocaleDateString()}
          </div>
        </div>
      </AnnotatedSection>

      {/* Customer Information */}
      <AnnotatedSection
        title="Customer Information"
        description="Details about the customer"
        contentClassName="md:col-span-8"
      >
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm">{purchase.email}</dd>
          </div>
          {purchase.customerName && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="mt-1 text-sm">{purchase.customerName}</dd>
            </div>
          )}
          {purchase.customerPhone && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-sm">{purchase.customerPhone}</dd>
            </div>
          )}
          {purchase.user && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">User Account</dt>
              <dd className="mt-1 text-sm">{purchase.user.email}</dd>
            </div>
          )}
        </dl>
      </AnnotatedSection>

      {/* Ticket Information */}
      <AnnotatedSection
        title="Ticket Information"
        description="Details about the purchased ticket"
        contentClassName="md:col-span-8"
      >
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Ticket Type</dt>
            <dd className="mt-1 text-sm font-medium">{purchase.ticket.name}</dd>
          </div>
          {purchase.ticket.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="mt-1 text-sm">{purchase.ticket.description}</dd>
            </div>
          )}
          {purchase.ticket.validFrom && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Valid From</dt>
              <dd className="mt-1 text-sm">{purchase.ticket.validFrom.toLocaleDateString()}</dd>
            </div>
          )}
          {purchase.ticket.validUntil && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Valid Until</dt>
              <dd className="mt-1 text-sm">{purchase.ticket.validUntil.toLocaleDateString()}</dd>
            </div>
          )}
        </dl>
      </AnnotatedSection>

      {/* Payment Information */}
      <AnnotatedSection
        title="Payment Information"
        description="Transaction and payment details"
        contentClassName="md:col-span-8"
      >
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Amount</dt>
            <dd className="mt-1 text-sm font-medium">
              {Number(purchase.totalAmount).toFixed(2)} {purchase.currency}
            </dd>
          </div>
          {purchase.stripeSessionId && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Stripe Session ID</dt>
              <dd className="mt-1 text-sm font-mono text-xs break-all">{purchase.stripeSessionId}</dd>
            </div>
          )}
          {purchase.stripePaymentIntentId && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Payment Intent ID</dt>
              <dd className="mt-1 text-sm font-mono text-xs break-all">{purchase.stripePaymentIntentId}</dd>
            </div>
          )}
        </dl>
      </AnnotatedSection>

      {/* QR Code */}
      {purchase.qrCode && (
        <AnnotatedSection
          title="QR Code"
          description="Ticket verification QR code"
          contentClassName="md:col-span-8"
        >
          <div className="flex items-center justify-center bg-white p-4 rounded-lg border">
            <Image
              src={purchase.qrCode}
              alt="Ticket QR Code"
              width={200}
              height={200}
            />
          </div>
        </AnnotatedSection>
      )}

      {/* Actions */}
      <AnnotatedSection
        title="Actions"
        description="Available operations for this purchase"
        contentClassName="md:col-span-8"
      >
        <div className="flex flex-wrap gap-3">
          {purchase.status === 'COMPLETED' && !purchase.invalidated && (
            <>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend Email'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // TODO: Implement refund flow in next task
                  alert('Refund functionality coming soon');
                }}
              >
                Process Refund
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(`/api/purchases/${purchase.id}/pdf`, '_blank')}
          >
            Download PDF
          </Button>
        </div>
      </AnnotatedSection>
    </div>
  );
}
