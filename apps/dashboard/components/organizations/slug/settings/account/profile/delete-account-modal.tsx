'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, type SubmitHandler } from 'react-hook-form';

import { replaceOrgSlug, routes } from '@workspace/routes';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { DialogFooter } from '@workspace/ui/components/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@workspace/ui/components/form';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';
import { cn } from '@workspace/ui/lib/utils';

import { deleteAccount } from '~/actions/account/delete-account';
import { signOut } from '~/actions/auth/sign-out';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  deleteAccountSchema,
  type DeleteAccountSchema
} from '~/schemas/account/delete-account-schema';

export type DeleteAccountModalProps = NiceModalHocProps & {
  ownedOrganizations: { name: string; slug: string }[];
};

export const DeleteAccountModal = NiceModal.create<DeleteAccountModalProps>(
  ({ ownedOrganizations }) => {
    const modal = useEnhancedModal();
    const router = useRouter();
    const t = useTranslations('account.profile.dangerZone.deleteModal');
    const tCommon = useTranslations('common');
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const methods = useZodForm({
      schema: deleteAccountSchema,
      mode: 'all',
      defaultValues: {
        statement: false
      }
    });
    const title = t('title');
    const description = t('description');
    const canSubmit =
      !methods.formState.isSubmitting &&
      methods.formState.isValid &&
      !!methods.watch('statement') &&
      ownedOrganizations.length === 0;
    const onSubmit: SubmitHandler<DeleteAccountSchema> = async () => {
      if (!canSubmit) {
        return;
      }
      const result = await deleteAccount();
      if (result) {
        if (!result.serverError && !result.validationErrors) {
          toast.error(t('success'));
          modal.handleClose();
          const result = await signOut({ redirect: false });
          if (!result?.serverError && !result?.validationErrors) {
            router.push(routes.dashboard.auth.SignIn);
          } else {
            toast.error(t('signOutError'));
          }
        } else {
          toast.error(t('error'));
        }
      }
    };
    const renderForm = (
      <form
        className={cn('space-y-4 text-sm leading-relaxed', !mdUp && 'px-4')}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <FormField
          control={methods.control}
          name="statement"
          render={({ field }) => (
            <FormItem className="mx-1 flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(e) => field.onChange(!!e)}
                  disabled={methods.formState.isSubmitting}
                />
              </FormControl>
              <FormLabel className="leading-2 cursor-pointer">
                {t('statement')}
              </FormLabel>
            </FormItem>
          )}
        />
        {ownedOrganizations.length > 0 && (
          <Alert variant="warning">
            <AlertCircleIcon className="size-[18px] shrink-0" />
            <AlertDescription className="inline">
              {t('assignOwnerWarning')}
              <div className="max-h-40 overflow-y-auto overflow-x-hidden">
                <ul className="list-disc">
                  {ownedOrganizations.map((organization) => (
                    <li
                      key={organization.slug}
                      className="ml-4"
                    >
                      <Link
                        href={replaceOrgSlug(
                          routes.dashboard.organizations.slug.settings
                            .organization.Members,
                          organization.slug
                        )}
                        className="underline"
                        onClick={modal.handleClose}
                      >
                        {organization.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </form>
    );
    const renderButtons = (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={modal.handleClose}
        >
          {tCommon('cancel')}
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={!canSubmit}
          loading={methods.formState.isSubmitting}
          onClick={methods.handleSubmit(onSubmit)}
        >
          {tCommon('delete')}
        </Button>
      </>
    );
    return (
      <FormProvider {...methods}>
        {mdUp ? (
          <AlertDialog open={modal.visible}>
            <AlertDialogContent
              className="max-w-lg"
              onClose={modal.handleClose}
              onAnimationEndCapture={modal.handleAnimationEndCapture}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
              </AlertDialogHeader>
              {renderForm}
              <DialogFooter>{renderButtons}</DialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Drawer
            open={modal.visible}
            onOpenChange={modal.handleOpenChange}
          >
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
              </DrawerHeader>
              {renderForm}
              <DrawerFooter className="flex-col-reverse pt-4">
                {renderButtons}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </FormProvider>
    );
  }
);
