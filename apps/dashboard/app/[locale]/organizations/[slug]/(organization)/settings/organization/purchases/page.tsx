import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PurchaseListItem } from '~/data/purchases/get-organization-purchases';
import type { PurchaseStatus } from '@workspace/database';
import { prisma } from '@workspace/database/client';
import { getOrganizationPurchases } from '~/data/purchases/get-organization-purchases';
import { PurchaseFilters } from '~/components/purchases/purchase-filters';

/**
 * Admin Purchase Management Page
 * Lists all purchases for the organization with filtering
 */
export default async function AdminPurchasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    status?: string;
    ticketId?: string;
    email?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const filters = await searchParams;

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Get all tickets for the filter dropdown
  const tickets = await prisma.ticket.findMany({
    where: { organizationId: organization.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Parse filter parameters
  const purchaseFilters = {
    organizationId: organization.id,
    ...(filters.status && { status: filters.status as PurchaseStatus }),
    ...(filters.ticketId && { ticketId: filters.ticketId }),
    ...(filters.email && { email: filters.email }),
    ...(filters.dateFrom && { dateFrom: new Date(filters.dateFrom) }),
    ...(filters.dateTo && { dateTo: new Date(filters.dateTo) }),
  };

  // Fetch purchases with filters
  const purchases = await getOrganizationPurchases(purchaseFilters);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Purchase Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage all ticket purchases
          </p>
        </div>
      </div>

      {/* Filters */}
      <PurchaseFilters
        organizationSlug={organization.slug}
        availableTickets={tickets}
      />

      {purchases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No purchases yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase: PurchaseListItem) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(purchase.purchasedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.customerName || purchase.email}
                    </div>
                    <div className="text-sm text-gray-500">{purchase.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.ticket.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(purchase.totalAmount).toFixed(2)} {purchase.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        purchase.status
                      )}`}
                    >
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/organizations/${organization.slug}/settings/organization/purchases/${purchase.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
