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
import { Label } from '@workspace/ui/components/label';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';
import { Switch } from '@workspace/ui/components/switch';

import { updateTransactionalEmails } from '~/actions/account/update-transactional-emails';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  updateTransactionalEmailsSchema,
  type UpdateTransactionalEmailsSchema
} from '~/schemas/account/update-transactional-emails-schema';
import type { TransactionalEmailsDto } from '~/types/dtos/transactional-emails-dto';

export type TransactionalEmailsCardProps = CardProps & {
  settings: TransactionalEmailsDto;
};

export function TransactionalEmailsCard({
  settings,
  ...other
}: TransactionalEmailsCardProps): React.JSX.Element {
  const t = useTranslations('account.notifications.transactional');
  const tCommon = useTranslations('common');

  const methods = useZodForm({
    schema: updateTransactionalEmailsSchema,
    mode: 'onSubmit',
    defaultValues: settings
  });
  const canSubmit = !methods.formState.isSubmitting;
  const onSubmit: SubmitHandler<UpdateTransactionalEmailsSchema> = async (
    values
  ) => {
    if (!canSubmit) {
      return;
    }
    const result = await updateTransactionalEmails(values);
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
              name="enabledContactsNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('contacts')}</FormLabel>
                    <FormDescription>
                      {t('contactsDescription')}
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
              name="enabledInboxNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('inbox')}</FormLabel>
                    <FormDescription>
                      {t('inboxDescription')}
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
              name="enabledWeeklySummary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('weeklySummary')}</FormLabel>
                    <FormDescription>
                      {t('weeklySummaryDescription')}
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
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('securityEmails')}</Label>
                <FormDescription>
                  {t('securityEmailsDescription')}
                </FormDescription>
              </div>
              <Switch
                checked
                disabled
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
