'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Location } from '@workspace/database';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Switch } from '@workspace/ui/components/switch';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import { createLocation } from '~/actions/locations/admin/create-location';
import { updateLocation } from '~/actions/locations/admin/update-location';

interface LocationFormProps {
  organizationSlug: string;
  location?: Location;
  mode: 'create' | 'edit';
}

export function LocationForm({
  organizationSlug,
  location,
  mode,
}: LocationFormProps): React.JSX.Element {
  const router = useRouter();
  const t = useTranslations('organization.settings.locations.form');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      postalCode: formData.get('postalCode') as string,
      isActive: formData.get('isActive') === 'on',
      color: formData.get('color') as string || null,
    };

    try {
      if (mode === 'create') {
        const result = await createLocation(data);

        if (result?.serverError) {
          setError(result.serverError);
          setLoading(false);
          return;
        }

        router.push(`/organizations/${organizationSlug}/settings/organization/locations`);
      } else {
        if (!location) {
          setError('Location data is missing');
          setLoading(false);
          return;
        }

        const result = await updateLocation({
          id: location.id,
          ...data,
        });

        if (result?.serverError) {
          setError(result.serverError);
          setLoading(false);
          return;
        }

        router.push(`/organizations/${organizationSlug}/settings/organization/locations`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/organizations/${organizationSlug}/settings/organization/locations`);
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
            defaultValue={location?.name}
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
            rows={3}
            maxLength={2000}
            defaultValue={location?.description || ''}
            placeholder={t('description.placeholder')}
            disabled={loading}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            {t('address.label')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            required
            maxLength={500}
            defaultValue={location?.address}
            placeholder={t('address.placeholder')}
            disabled={loading}
          />
        </div>

        {/* City and Postal Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              {t('city.label')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              maxLength={255}
              defaultValue={location?.city}
              placeholder={t('city.placeholder')}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">{t('postalCode.label')}</Label>
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              maxLength={20}
              defaultValue={location?.postalCode || ''}
              placeholder={t('postalCode.placeholder')}
              disabled={loading}
            />
          </div>
        </div>

        {/* Is Active */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={location?.isActive ?? true}
            disabled={loading}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            {t('isActive.label')}
          </Label>
        </div>

        {/* Calendar Color */}
        <div className="space-y-2">
          <Label htmlFor="color">{t('color.label')}</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color"
              name="color"
              type="color"
              className="h-10 w-20 p-1 cursor-pointer"
              defaultValue={location?.color || '#3B82F6'}
              disabled={loading}
            />
            <span className="text-sm text-muted-foreground">
              {t('color.hint')}
            </span>
          </div>
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
