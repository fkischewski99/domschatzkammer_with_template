'use client';

import * as React from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';

import { updateBillingAddress } from '~/actions/billing/update-billing-address';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  billingAddressCountries,
  updateBillingAddressSchema,
  type UpdateBillingAddressSchema
} from '~/schemas/billing/update-billing-address-schema';
import type { BillingAddressDto } from '~/types/dtos/billing-address-dto';

export type BillingAddressCardProps = CardProps & {
  address: BillingAddressDto;
};

export function BillingAddressCard({
  address,
  ...other
}: BillingAddressCardProps): React.JSX.Element {
  const t = useTranslations('organization.settings.billing.address');
  const tCommon = useTranslations('common');

  const methods = useZodForm({
    schema: updateBillingAddressSchema,
    mode: 'onSubmit',
    defaultValues: {
      line1: address.line1 ?? '',
      line2: address.line2 ?? '',
      country: address.country ?? '',
      postalCode: address.postalCode ?? '',
      city: address.city ?? '',
      state: address.state ?? ''
    }
  });
  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdateBillingAddressSchema> = async (
    values
  ) => {
    if (!canSubmit) {
      return;
    }
    const result = await updateBillingAddress(values);
    if (!result?.serverError && !result?.validationErrors) {
      toast.success(t('updateSuccess'));
    } else {
      toast.error(t('updateError'));
    }
  };
  return (
    <FormProvider {...methods}>
      <Card {...other}>
        <CardContent>
          <form
            className="grid grid-cols-12 gap-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="col-span-12">
              <FormField
                control={methods.control}
                name="line1"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>{t('line1')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="address-line1"
                        maxLength={512}
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-12">
              <FormField
                control={methods.control}
                name="line2"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>{t('line2')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="address-line2"
                        maxLength={512}
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-12">
              <FormField
                control={methods.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>{t('country')}</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value}
                        disabled={methods.formState.isSubmitting}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="[&>span]:truncate w-full">
                          <SelectValue placeholder="---" />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea style={{ maxHeight: '176px' }}>
                            <SelectItem
                              key="empty"
                              value={null as unknown as string}
                            >
                              ---
                            </SelectItem>
                            <SelectSeparator />
                            {billingAddressCountries.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-5">
              <FormField
                control={methods.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>{t('postalCode')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="postal-code"
                        maxLength={12}
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-7">
              <FormField
                control={methods.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>{t('city')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="address-level2"
                        maxLength={512}
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-12">
              <FormField
                control={methods.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>{t('state')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="address-level1"
                        maxLength={512}
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </CardContent>
        <Separator />
        <CardFooter className="flex w-full justify-end">
          <Button
            type="button"
            variant="default"
            size="default"
            disabled={!canSubmit}
            loading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onSubmit)}
          >
            {tCommon('save')}
          </Button>
        </CardFooter>
      </Card>
    </FormProvider>
  );
}
