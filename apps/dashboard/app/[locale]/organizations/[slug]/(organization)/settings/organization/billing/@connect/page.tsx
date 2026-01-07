import * as React from 'react';

import { getAuthOrganizationContext } from '@workspace/auth/context';

import { ConnectAccountStatus } from '~/components/billing/connect-account-status';

export default async function ConnectPage(): Promise<React.JSX.Element> {
  const { organization } = await getAuthOrganizationContext();

  return (
    <ConnectAccountStatus
      organizationSlug={organization.slug}
      stripeConnectAccountId={organization.stripeConnectAccountId}
    />
  );
}
