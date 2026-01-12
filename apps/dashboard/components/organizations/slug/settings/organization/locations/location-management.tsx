'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useOptimistic, useTransition } from 'react';
import type { Location } from '@workspace/database';
import { toast } from '@workspace/ui/components/sonner';

import { Button } from '@workspace/ui/components/button';
import { AnnotatedSection } from '@workspace/ui/components/annotated';
import { Switch } from '@workspace/ui/components/switch';

import { updateLocation } from '~/actions/locations/admin/update-location';

interface LocationManagementProps {
  locations: Location[];
  organizationSlug: string;
}

export function LocationManagement({
  locations,
  organizationSlug
}: LocationManagementProps): React.JSX.Element {
  const t = useTranslations('organization.settings.locations');
  const [isPending, startTransition] = useTransition();

  const [optimisticLocations, setOptimisticLocations] = useOptimistic(
    locations,
    (state, { locationId, isActive }: { locationId: string; isActive: boolean }) =>
      state.map((location) =>
        location.id === locationId ? { ...location, isActive } : location
      )
  );

  const handleToggleStatus = async (location: Location, newStatus: boolean) => {
    startTransition(async () => {
      setOptimisticLocations({ locationId: location.id, isActive: newStatus });

      try {
        const result = await updateLocation({
          id: location.id,
          name: location.name,
          description: location.description || '',
          address: location.address,
          city: location.city,
          postalCode: location.postalCode || '',
          isActive: newStatus,
        });

        if (result?.serverError) {
          toast.error(result.serverError);
        } else {
          toast.success(
            newStatus ? t('status.activated') : t('status.deactivated')
          );
        }
      } catch (error) {
        toast.error(t('status.toggleError'));
      }
    });
  };

  return (
    <AnnotatedSection
      title={t('heading')}
      description={t('subheading')}
      contentClassName={locations.length > 0 ? "md:col-span-12" : undefined}
    >
      <div className="space-y-4">
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('noLocations')}
            </p>
            <Link href={`/organizations/${organizationSlug}/settings/organization/locations/create`}>
              <Button size="sm">
                {t('createFirst')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Link href={`/organizations/${organizationSlug}/settings/organization/locations/create`}>
                <Button size="sm">
                  {t('createLocation')}
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[30%]">
                        {t('table.name')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[35%]">
                        {t('table.address')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[20%]">
                        {t('table.city')}
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[10%]">
                        {t('table.status')}
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[5%]">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {optimisticLocations.map((location) => (
                      <tr
                        key={location.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle">
                          <div className="font-medium">{location.name}</div>
                          {location.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {location.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {location.address}
                        </td>
                        <td className="p-4 align-middle">
                          {location.city}
                          {location.postalCode && `, ${location.postalCode}`}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={location.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleStatus(location, checked)
                              }
                              disabled={isPending}
                              aria-label={location.isActive ? t('active') : t('inactive')}
                            />
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Link
                            href={`/organizations/${organizationSlug}/settings/organization/locations/${location.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {t('editAction')}
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
