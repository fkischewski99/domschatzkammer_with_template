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
  const [status, setStatus] = React.useState(searchParams.get('status') || 'all');
  const [ticketId, setTicketId] = React.useState(searchParams.get('ticketId') || 'all');
  const [email, setEmail] = React.useState(searchParams.get('email') || '');
  const [dateFrom, setDateFrom] = React.useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = React.useState(searchParams.get('dateTo') || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (status && status !== 'all') params.set('status', status);
    if (ticketId && ticketId !== 'all') params.set('ticketId', ticketId);
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
    setStatus('all');
    setTicketId('all');
    setEmail('');
    setDateFrom('');
    setDateTo('');

    router.push(`/organizations/${organizationSlug}/settings/organization/purchases`);
  };

  const hasActiveFilters = (status && status !== 'all') || (ticketId && ticketId !== 'all') || email || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Status Filter */}
        <div className="w-[160px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ticket Type Filter */}
        <div className="w-[160px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Ticket Type
          </label>
          <Select value={ticketId} onValueChange={setTicketId}>
            <SelectTrigger>
              <SelectValue placeholder="All tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tickets</SelectItem>
              {availableTickets.map((ticket) => (
                <SelectItem key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email Filter */}
        <div className="w-[200px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
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
        <div className="w-[150px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            From Date
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* Date To Filter */}
        <div className="w-[150px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            To Date
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
