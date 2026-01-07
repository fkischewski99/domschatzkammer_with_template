'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { PurchaseStatus } from '@workspace/database';

import { Button } from '@workspace/ui/components/button';
import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { Badge } from '@workspace/ui/components/badge';
import type { PurchaseListItem } from '~/data/purchases/get-organization-purchases';

interface PurchaseManagementProps {
  purchases: PurchaseListItem[];
  organizationSlug: string;
}

export function PurchaseManagement({
  purchases,
  organizationSlug,
}: PurchaseManagementProps): React.JSX.Element {
  const t = useTranslations('organization.settings.purchases');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: PurchaseStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'REFUNDED':
        return 'outline';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <AnnotatedSection
      title={t('heading')}
      description={t('subheading')}
      contentClassName={purchases.length > 0 ? "md:col-span-12" : undefined}
    >
      <div className="space-y-4">
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('noPurchases')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link
                  href={`/organizations/${organizationSlug}/settings/organization/purchases/analytics`}
                >
                  {t('analytics')}
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={`/organizations/${organizationSlug}/settings/organization/purchases/issue`}
                >
                  {t('issueTicket')}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" asChild>
                <Link
                  href={`/organizations/${organizationSlug}/settings/organization/purchases/analytics`}
                >
                  {t('analytics')}
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={`/organizations/${organizationSlug}/settings/organization/purchases/issue`}
                >
                  {t('issueTicket')}
                </Link>
              </Button>
            </div>
            <div className="rounded-lg border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[20%]">
                      {t('table.date')}
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[25%]">
                      {t('table.customer')}
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[20%]">
                      {t('table.ticket')}
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[12%]">
                      {t('table.amount')}
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[13%]">
                      {t('table.status')}
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[10%]">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        <div className="text-sm">
                          {formatDate(purchase.purchasedAt)}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">
                          {purchase.customerName || purchase.email}
                        </div>
                        {purchase.customerName && (
                          <div className="text-sm text-muted-foreground">
                            {purchase.email}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">{purchase.ticket.name}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">
                          {Number(purchase.totalAmount).toFixed(2)} {purchase.currency}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={getStatusVariant(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Link
                          href={`/organizations/${organizationSlug}/settings/organization/purchases/${purchase.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {t('viewDetails')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
    </AnnotatedSection>
  );
}
