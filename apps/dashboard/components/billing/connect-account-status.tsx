'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';

import { setupStripeConnect } from '~/actions/billing/setup-stripe-connect';

export type ConnectAccountStatusProps = CardProps & {
  organizationSlug: string;
  stripeConnectAccountId?: string | null;
};

export function ConnectAccountStatus({
  organizationSlug,
  stripeConnectAccountId,
  ...other
}: ConnectAccountStatusProps): React.JSX.Element {
  const t = useTranslations('organization.settings.billing.connect');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const result = await setupStripeConnect({});

      if (result?.serverError || result?.validationErrors) {
        toast.error(t('setupError'));
        return;
      }

      if (result?.data?.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.data.onboardingUrl;
      } else {
        toast.error(t('setupError'));
      }
    } catch (error) {
      toast.error(t('setupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = !!stripeConnectAccountId;
  const showSetupButton = !stripeConnectAccountId;
  const showManageButton = !!stripeConnectAccountId;

  return (
    <Card {...other}>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{t('status')}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? t('statusActive') : t('statusNotSetup')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isConnected ? t('statusActiveDescription') : t('statusNotSetupDescription')}
          </p>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end gap-2">
        {showSetupButton && (
          <Button
            variant="default"
            onClick={handleSetup}
            loading={isLoading}
            disabled={isLoading}
          >
            {t('setupConnect')}
          </Button>
        )}
        {showManageButton && (
          <Button
            variant="outline"
            onClick={handleSetup}
            loading={isLoading}
            disabled={isLoading}
          >
            {t('manageDashboard')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
