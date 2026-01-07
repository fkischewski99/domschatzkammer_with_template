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
import { PurchaseDetail } from '~/components/purchases/purchase-detail';
import { getPurchaseById } from '~/data/purchases/get-purchase-by-id';
import { prisma } from '@workspace/database/client';
import { createTitle } from '~/lib/formatters';

export const metadata: Metadata = {
  title: createTitle('Purchase Details')
};

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; purchaseId: string }>;
}): Promise<React.JSX.Element> {
  const { slug, purchaseId } = await params;

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Fetch purchase details
  const purchase = await getPurchaseById(purchaseId);

  if (!purchase || purchase.organizationId !== organization.id) {
    notFound();
  }

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            title="Purchase Details"
            info={`Purchase #${purchase.id.slice(0, 8)}`}
          />
        </PagePrimaryBar>
      </PageHeader>
      <PageBody>
        <PurchaseDetail purchase={purchase} organizationSlug={organization.slug} />
      </PageBody>
    </Page>
  );
}
