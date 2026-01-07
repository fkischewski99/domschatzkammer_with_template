'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Ticket } from '@workspace/database';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Switch } from '@workspace/ui/components/switch';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { X } from 'lucide-react';

import { createTicket } from '~/actions/tickets/admin/create-ticket';
import { updateTicket } from '~/actions/tickets/admin/update-ticket';

interface TicketFormProps {
  organizationSlug: string;
  ticket?: Ticket;
  mode: 'create' | 'edit';
}

export function TicketForm({
  organizationSlug,
  ticket,
  mode,
}: TicketFormProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.tickets.form');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [features, setFeatures] = React.useState<string[]>(
    ticket?.features ? (ticket.features as string[]) : []
  );
  const [featureInput, setFeatureInput] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      currency: formData.get('currency') as string,
      features,
      stock: formData.get('stock') ? Number(formData.get('stock')) : null,
      validFrom: formData.get('validFrom') ? new Date(formData.get('validFrom') as string) : null,
      validUntil: formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null,
      isActive: formData.get('isActive') === 'on',
    };

    try {
      if (mode === 'create') {
        const result = await createTicket(data);

        if (result?.serverError) {
          setError(result.serverError);
          setLoading(false);
          return;
        }

        router.push(`/organizations/${organizationSlug}/settings/organization/tickets`);
      } else {
        if (!ticket) {
          setError('Ticket data is missing');
          setLoading(false);
          return;
        }

        const result = await updateTicket({
          id: ticket.id,
          ...data,
        });

        if (result?.serverError) {
          setError(result.serverError);
          setLoading(false);
          return;
        }

        router.push(`/organizations/${organizationSlug}/settings/organization/tickets`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && features.length < 20) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    router.push(`/organizations/${organizationSlug}/settings/organization/tickets`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('name.label')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            maxLength={255}
            defaultValue={ticket?.name}
            placeholder={t('name.placeholder')}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('description.label')}</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            maxLength={10000}
            defaultValue={ticket?.description || ''}
            placeholder={t('description.placeholder')}
            disabled={loading}
          />
        </div>

        {/* Price and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">
              {t('price.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              max="99999999.99"
              required
              defaultValue={ticket?.price ? Number(ticket.price) : undefined}
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">
              {t('currency.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="currency"
              name="currency"
              type="text"
              maxLength={3}
              required
              defaultValue={ticket?.currency || 'EUR'}
              placeholder="EUR"
              disabled={loading}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label htmlFor="feature-input">{t('features.label')}</Label>
          <div className="flex gap-2">
            <Input
              id="feature-input"
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              placeholder={t('features.placeholder')}
              disabled={loading || features.length >= 20}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFeature}
              disabled={loading || !featureInput.trim() || features.length >= 20}
            >
              {t('features.add')}
            </Button>
          </div>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="ml-1 hover:text-destructive"
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {features.length >= 20 && (
            <p className="text-sm text-muted-foreground">
              {t('features.maxReached')}
            </p>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock">{t('stock.label')}</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            defaultValue={ticket?.stock !== null && ticket?.stock !== undefined ? ticket.stock : undefined}
            placeholder={t('stock.placeholder')}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            {t('stock.hint')}
          </p>
        </div>

        {/* Valid From and Until */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="validFrom">{t('validFrom.label')}</Label>
            <Input
              id="validFrom"
              name="validFrom"
              type="datetime-local"
              defaultValue={
                ticket?.validFrom
                  ? new Date(ticket.validFrom).toISOString().slice(0, 16)
                  : undefined
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">{t('validUntil.label')}</Label>
            <Input
              id="validUntil"
              name="validUntil"
              type="datetime-local"
              defaultValue={
                ticket?.validUntil
                  ? new Date(ticket.validUntil).toISOString().slice(0, 16)
                  : undefined
              }
              disabled={loading}
            />
          </div>
        </div>

        {/* Is Active */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={ticket?.isActive ?? true}
            disabled={loading}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            {t('isActive.label')}
          </Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? t('submitting')
            : mode === 'create'
              ? t('create')
              : t('update')}
        </Button>
      </div>
    </form>
  );
}
