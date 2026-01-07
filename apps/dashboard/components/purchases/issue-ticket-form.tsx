'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAction } from 'next-safe-action/hooks';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';

import { issueComplimentaryTicket } from '~/actions/purchases/issue-complimentary-ticket';

interface IssueTicketFormProps {
  organizationSlug: string;
  availableTickets: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    stock: number | null;
  }>;
}

export function IssueTicketForm({
  organizationSlug,
  availableTickets,
}: IssueTicketFormProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.purchases');

  const [ticketId, setTicketId] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [customerName, setCustomerName] = React.useState<string>('');
  const [customerPhone, setCustomerPhone] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');

  const { execute, isPending } = useAction(issueComplimentaryTicket, {
    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success(t('issue.success'));
        router.push(`/organizations/${organizationSlug}/settings/organization/purchases`);
      }
    },
    onError: (error) => {
      toast.error(error.error.serverError || t('issue.error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketId || !email) {
      toast.error(t('issue.validationError'));
      return;
    }

    execute({
      ticketId,
      email,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      reason: reason || undefined,
    });
  };

  const selectedTicket = availableTickets.find((t) => t.id === ticketId);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Ticket Selection */}
          <div className="space-y-2">
            <Label htmlFor="ticketId">{t('issue.ticketType')}</Label>
            <Select value={ticketId} onValueChange={setTicketId}>
              <SelectTrigger id="ticketId">
                <SelectValue placeholder={t('issue.selectTicket')} />
              </SelectTrigger>
              <SelectContent>
                {availableTickets.map((ticket) => (
                  <SelectItem
                    key={ticket.id}
                    value={ticket.id}
                    disabled={ticket.stock !== null && ticket.stock <= 0}
                  >
                    {ticket.name}
                    {ticket.stock !== null && ticket.stock <= 0 && ' (Sold out)'}
                    {ticket.stock !== null && ticket.stock > 0 && ` (${ticket.stock} left)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTicket && (
              <p className="text-sm text-muted-foreground">
                {t('issue.normalPrice')}: {selectedTicket.price.toFixed(2)} {selectedTicket.currency}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('issue.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('issue.emailPlaceholder')}
              required
            />
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">{t('issue.customerName')}</Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('issue.customerNamePlaceholder')}
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone">{t('issue.customerPhone')}</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={t('issue.customerPhonePlaceholder')}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t('issue.reason')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('issue.reasonPlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t('issue.cancel')}
          </Button>
          <Button type="submit" disabled={isPending || !ticketId || !email}>
            {isPending ? t('issue.issuing') : t('issue.issueTicket')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
