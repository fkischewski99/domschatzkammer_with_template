'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import type { Purchase } from '@workspace/database';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Download } from 'lucide-react';

interface PurchaseListProps {
  purchases: (Purchase & {
    ticket?: {
      id: string;
      name: string;
      description: string | null;
    } | null;
    organization?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  })[];
}

export function PurchaseList({ purchases }: PurchaseListProps): React.JSX.Element {
  const t = useTranslations('purchases');

  const handleDownloadPDF = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${purchaseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t('noPurchases')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {t('table.date')}
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {t('table.ticket')}
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {t('table.organization')}
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {t('table.amount')}
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {t('table.status')}
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
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
                  {new Date(purchase.purchasedAt).toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">
                  <div className="font-medium">{purchase.ticket?.name ?? 'Unknown'}</div>
                  {purchase.ticket?.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {purchase.ticket.description}
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  {purchase.organization?.name ?? 'Unknown'}
                </td>
                <td className="p-4 align-middle">
                  {Number(purchase.totalAmount).toFixed(2)} {purchase.currency}
                </td>
                <td className="p-4 align-middle">
                  <Badge
                    variant={
                      purchase.status === 'COMPLETED'
                        ? 'default'
                        : purchase.status === 'REFUNDED'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {purchase.status}
                  </Badge>
                </td>
                <td className="p-4 align-middle text-right">
                  {purchase.status === 'COMPLETED' && !purchase.invalidated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(purchase.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('downloadPDF')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
