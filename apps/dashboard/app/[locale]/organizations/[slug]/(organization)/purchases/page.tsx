import * as React from 'react';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar
} from '@workspace/ui/components/page';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { PurchaseList } from '~/components/purchases/purchase-list';
import { getUserPurchases } from '~/data/purchases/get-user-purchases';
import { getAuthContext } from '@workspace/auth/context';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('My Purchases')
};

export default async function PurchasesPage(): Promise<React.JSX.Element> {
  // Get authenticated user
  const { session } = await getAuthContext();
  
  if (!session?.user?.id) {
    notFound();
  }

  // Fetch user's purchases
  const purchases = await getUserPurchases(session.user.id);

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            title="My Purchases"
            info={`Total ${purchases.length} ${purchases.length === 1 ? 'purchase' : 'purchases'}`}
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <PurchaseList purchases={purchases} />
      </PageBody>
    </Page>
  );
}
