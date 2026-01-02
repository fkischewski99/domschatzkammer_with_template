'use client';

import * as React from 'react';
import { FormProvider, type SubmitHandler } from 'react-hook-form';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@workspace/ui/components/form';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';
import { Switch } from '@workspace/ui/components/switch';

import { updateMarketingEmails } from '~/actions/account/update-marketing-emails';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  updateMarketingEmailsSchema,
  type UpdateMarketingEmailsSchema
} from '~/schemas/account/update-marketing-email-settings';
import type { MarketingEmailsDto } from '~/types/dtos/marketing-emails-dto';

export type MarketingEmailsCardProps = CardProps & {
  settings: MarketingEmailsDto;
};

export function MarketingEmailsCard({
  settings,
  ...other
}: MarketingEmailsCardProps): React.JSX.Element {
  const t = useTranslations('account.notifications.marketing');
  const tCommon = useTranslations('common');

  const methods = useZodForm({
    schema: updateMarketingEmailsSchema,
    mode: 'onSubmit',
    defaultValues: settings
  });
  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdateMarketingEmailsSchema> = async (
    values
  ) => {
    if (!canSubmit) {
      return;
    }
    const result = await updateMarketingEmails(values);
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
            className="space-y-4"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormField
              control={methods.control}
              name="enabledNewsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('newsletter')}</FormLabel>
                    <FormDescription>
                      {t('newsletterDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={methods.formState.isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="enabledProductUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('productUpdates')}</FormLabel>
                    <FormDescription>
                      {t('productUpdatesDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={methods.formState.isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
