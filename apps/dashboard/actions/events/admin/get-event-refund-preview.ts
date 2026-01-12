'use server';

import { z } from 'zod';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError, NotFoundError } from '@workspace/common/errors';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { getEventPurchasesForRefund } from '~/data/events/get-event-purchases-for-refund';

const GetEventRefundPreviewSchema = z.object({
  eventId: z.string().uuid(),
});

export const getEventRefundPreview = authOrganizationActionClient
  .metadata({ actionName: 'getEventRefundPreview' })
  .schema(GetEventRefundPreviewSchema)
  .action(async ({ parsedInput: { eventId }, ctx }) => {
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Admin role required');
    }

    const data = await getEventPurchasesForRefund(eventId, ctx.organization.id);

    if (!data) {
      throw new NotFoundError('Event not found');
    }

    return {
      eventId: data.event.id,
      eventName: data.event.name,
      eventDate: data.event.startTime,
      locationName: data.event.location.name,
      purchaseCount: data.count,
      paidPurchaseCount: data.paidCount,
      freePurchaseCount: data.freeCount,
      totalRefundAmount: data.totalAmount,
      currency: data.currency,
      hasStripeConnect: data.organization.stripeConnectAccountId !== null,
    };
  });
