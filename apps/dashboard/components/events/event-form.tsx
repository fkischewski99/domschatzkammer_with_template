'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Location } from '@workspace/database';
import { X } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Switch } from '@workspace/ui/components/switch';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import { createEvent } from '~/actions/events/admin/create-event';
import { updateEvent } from '~/actions/events/admin/update-event';
import type { SerializedEventDetail } from '~/data/events/get-event-by-id';

interface EventFormProps {
  organizationSlug: string;
  locations: Location[];
  event?: SerializedEventDetail;
  mode: 'create' | 'edit';
}

export function EventForm({
  organizationSlug,
  locations,
  event,
  mode,
}: EventFormProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.events.form');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [locationId, setLocationId] = React.useState(event?.locationId || '');
  const [features, setFeatures] = React.useState<string[]>(
    event?.ticket?.features ? (event.ticket.features as string[]) : []
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
      startTime: new Date(formData.get('startTime') as string),
      endTime: new Date(formData.get('endTime') as string),
      locationId,
      ticketPrice: Number(formData.get('ticketPrice')),
      ticketCurrency: formData.get('ticketCurrency') as string,
      ticketStock: formData.get('ticketStock') ? Number(formData.get('ticketStock')) : null,
      ticketFeatures: features,
      coverImage: formData.get('coverImage') as string,
      isPublished: formData.get('isPublished') === 'on',
    };

    try {
      if (mode === 'create') {
        const result = await createEvent(data);

        if (result?.serverError) {
          setError(result.serverError);
          setLoading(false);
          return;
        }

        router.push(`/organizations/${organizationSlug}/events`);
      } else {
        if (!event) {
          setError('Event data is missing');
          setLoading(false);
          return;
        }

        const result = await updateEvent({
          id: event.id,
          ...data,
        });

        if (result?.serverError) {
          setError(result.serverError);
          setLoading(false);
          return;
        }

        router.push(`/organizations/${organizationSlug}/events`);
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
    router.push(`/organizations/${organizationSlug}/events`);
  };

  const formatDateTimeLocal = (date: Date | null | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Event Name */}
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
            defaultValue={event?.name}
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
            defaultValue={event?.description || ''}
            placeholder={t('description.placeholder')}
            disabled={loading}
          />
        </div>

        {/* Start and End Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">
              {t('startTime.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              defaultValue={formatDateTimeLocal(event?.startTime)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">
              {t('endTime.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endTime"
              name="endTime"
              type="datetime-local"
              required
              defaultValue={formatDateTimeLocal(event?.endTime)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">
            {t('location.label')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={locationId}
            onValueChange={setLocationId}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('location.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {locations.filter(l => l.isActive).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} - {location.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ticket Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-4">{t('ticketSection.title')}</h3>

          {/* Price and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticketPrice">
                {t('ticketPrice.label')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ticketPrice"
                name="ticketPrice"
                type="number"
                step="0.01"
                min="0"
                max="99999999.99"
                required
                defaultValue={event?.ticket ? Number(event.ticket.price) : undefined}
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketCurrency">
                {t('ticketCurrency.label')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ticketCurrency"
                name="ticketCurrency"
                type="text"
                maxLength={3}
                required
                defaultValue={event?.ticket?.currency || 'EUR'}
                placeholder="EUR"
                disabled={loading}
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="ticketStock">{t('ticketStock.label')}</Label>
            <Input
              id="ticketStock"
              name="ticketStock"
              type="number"
              min="0"
              defaultValue={event?.ticket?.stock ?? undefined}
              placeholder={t('ticketStock.placeholder')}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              {t('ticketStock.hint')}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mt-4">
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
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label htmlFor="coverImage">{t('coverImage.label')}</Label>
          <Input
            id="coverImage"
            name="coverImage"
            type="url"
            maxLength={2048}
            defaultValue={event?.coverImage || ''}
            placeholder={t('coverImage.placeholder')}
            disabled={loading}
          />
        </div>

        {/* Is Published */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isPublished"
            name="isPublished"
            defaultChecked={event?.isPublished ?? false}
            disabled={loading}
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            {t('isPublished.label')}
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
        <Button type="submit" disabled={loading || !locationId}>
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
