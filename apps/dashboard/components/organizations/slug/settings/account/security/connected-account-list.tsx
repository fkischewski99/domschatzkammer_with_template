'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { OAuthProvider } from '@workspace/auth/providers.types';
import {
  GoogleIcon,
  MicrosoftIcon
} from '@workspace/ui/components/brand-icons';
import { Button } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { connectAccount } from '~/actions/account/connect-account';
import { disconnectAccount } from '~/actions/account/disconnect-account';
import { identityProviderLabels } from '~/lib/labels';
import type { ConnectedAccountDto } from '~/types/dtos/connected-account-dto';

export type ConnectedAccountListProps =
  React.HtmlHTMLAttributes<HTMLUListElement> & {
    connectedAccounts: ConnectedAccountDto[];
  };

export function ConnectedAccountList({
  connectedAccounts,
  className,
  ...other
}: ConnectedAccountListProps): React.JSX.Element {
  return (
    <ul
      role="list"
      className={cn('m-0 list-none divide-y p-0', className)}
      {...other}
    >
      {connectedAccounts.map((connectedAccount) => (
        <ConnectedAccountListItem
          key={connectedAccount.id}
          connectedAccount={connectedAccount}
        />
      ))}
    </ul>
  );
}

type ConnectedAccountListItemProps = React.HTMLAttributes<HTMLLIElement> & {
  connectedAccount: ConnectedAccountDto;
};

function ConnectedAccountListItem({
  connectedAccount,
  className,
  ...other
}: ConnectedAccountListItemProps): React.JSX.Element {
  const t = useTranslations('account.security.connectedAccounts');

  const handleConnect = async () => {
    const result = await connectAccount({
      provider: connectedAccount.id as OAuthProvider
    });
    if (result?.serverError || result?.validationErrors) {
      toast.error(t('connectError'));
    }
  };
  const handleDisconnect = async () => {
    const result = await disconnectAccount({
      provider: connectedAccount.id as OAuthProvider
    });
    if (!result?.serverError && !result?.validationErrors) {
      toast.success(t('disconnectSuccess'));
    } else {
      toast.error(t('disconnectError'));
    }
  };
  return (
    <li
      className={cn(
        'flex flex-row items-center justify-between p-6',
        className
      )}
      {...other}
    >
      <div className="flex flex-row items-center gap-4">
        <Icon connectedAccount={connectedAccount} />
        <div>
          <h5 className="text-sm font-medium">
            {identityProviderLabels[connectedAccount.id as OAuthProvider]}
          </h5>
          <p className="text-sm text-muted-foreground">
            {connectedAccount.linked ? t('connected') : t('notConnected')}
          </p>
        </div>
      </div>
      {connectedAccount.linked ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleDisconnect}
        >
          {t('disconnect')}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleConnect}
        >
          {t('connect')}
        </Button>
      )}
    </li>
  );
}

function Icon({
  connectedAccount
}: {
  connectedAccount: ConnectedAccountDto;
}): React.JSX.Element {
  switch (connectedAccount.id) {
    case OAuthProvider.Google:
      return (
        <GoogleIcon
          width="20"
          height="20"
        />
      );
    case OAuthProvider.MicrosoftEntraId:
      return (
        <MicrosoftIcon
          width="20"
          height="20"
        />
      );
  }
}
