'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

interface PurchaseFiltersProps {
  organizationSlug: string;
  availableTickets: Array<{ id: string; name: string }>;
}

export function PurchaseFilters({
  organizationSlug,
  availableTickets,
}: PurchaseFiltersProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [status, setStatus] = React.useState(searchParams.get('status') || '');
  const [ticketId, setTicketId] = React.useState(searchParams.get('ticketId') || '');
  const [email, setEmail] = React.useState(searchParams.get('email') || '');
  const [dateFrom, setDateFrom] = React.useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = React.useState(searchParams.get('dateTo') || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (ticketId) params.set('ticketId', ticketId);
    if (email) params.set('email', email);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    const queryString = params.toString();
    const newPath = `/organizations/${organizationSlug}/settings/organization/purchases${
      queryString ? `?${queryString}` : ''
    }`;

    router.push(newPath);
  };

  const handleClearFilters = () => {
    setStatus('');
    setTicketId('');
    setEmail('');
    setDateFrom('');
    setDateTo('');

    router.push(`/organizations/${organizationSlug}/settings/organization/purchases`);
  };

  const hasActiveFilters = status || ticketId || email || dateFrom || dateTo;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ticket Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ticket Type
          </label>
          <Select value={ticketId} onValueChange={setTicketId}>
            <SelectTrigger>
              <SelectValue placeholder="All tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tickets</SelectItem>
              {availableTickets.map((ticket) => (
                <SelectItem key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Email
          </label>
          <Input
            type="email"
            placeholder="Search by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Date From Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* Date To Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
