import * as React from 'react';
import { notFound } from 'next/navigation';

import { prisma } from '@workspace/database/client';
import { getOrganizationPurchases } from '~/data/purchases/get-organization-purchases';
import { PurchaseManagement } from '~/components/purchases/purchase-management';

/**
 * Admin Purchase Management Page
 * Lists all purchases for the organization
 */
export default async function AdminPurchasesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;

  // Get organization by slug
  const organization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (!organization) {
    notFound();
  }

  // Fetch all purchases for the organization
  const purchases = await getOrganizationPurchases({
    organizationId: organization.id,
  });

  return (
    <PurchaseManagement
      purchases={purchases}
      organizationSlug={organization.slug}
    />
  );
}
