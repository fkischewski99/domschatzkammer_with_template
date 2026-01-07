'use server';

import { prisma } from '@workspace/database/client';
import { sendPurchaseConfirmationEmail } from '@workspace/email/send-purchase-confirmation-email';
import { generateTicketPDF } from '@workspace/tickets';
import { APP_NAME } from '@workspace/common/app';
import { isOrganizationAdmin } from '@workspace/auth/permissions';
import { ForbiddenError } from '@workspace/common/errors';
import { authOrganizationActionClient } from '~/actions/safe-action';
import { z } from 'zod';

const ResendEmailSchema = z.object({
  purchaseId: z.string(),
});

export const resendPurchaseEmail = authOrganizationActionClient
  .metadata({ actionName: 'resendPurchaseEmail' })
  .schema(ResendEmailSchema)
  .action(async ({ parsedInput: { purchaseId }, ctx }) => {
    // Authorization check (must be admin or owner)
    const currentUserIsAdmin = await isOrganizationAdmin(
      ctx.session.user.id,
      ctx.organization.id
    );

    if (!currentUserIsAdmin) {
      throw new ForbiddenError('Only organization admins can resend emails');
    }

    try {
      // Fetch purchase with all related data
      const purchase = await prisma.purchase.findUnique({
          where: { id: purchaseId },
          include: {
            ticket: true,
            organization: true,
          },
        });

        if (!purchase) {
          return { success: false, error: 'Purchase not found' };
        }

        // Verify purchase belongs to the organization
        if (purchase.organizationId !== ctx.organization.id) {
          return { success: false, error: 'Unauthorized access to purchase' };
        }

        // Check purchase status
        if (purchase.status !== 'COMPLETED') {
          return { success: false, error: 'Can only resend email for completed purchases' };
        }

        if (purchase.invalidated) {
          return { success: false, error: 'Cannot resend email for invalidated purchases' };
        }

        if (!purchase.qrCode) {
          return { success: false, error: 'QR code not available for this purchase' };
        }

        // Generate PDF
        const pdfBuffer = await generateTicketPDF({
          organizationId: purchase.organizationId,
          organizationName: purchase.organization!.name,
          ticketId: purchase.ticketId,
          ticketTypeName: purchase.ticket!.name,
          ticketDescription: purchase.ticket!.description ?? undefined,
          ticketFeatures: purchase.ticket!.features as string[],
          purchaseId: purchase.id,
          qrCode: purchase.qrCode,
          customerName: purchase.customerName ?? undefined,
          customerEmail: purchase.email,
          totalAmount: Number(purchase.totalAmount),
          currency: purchase.currency,
          purchaseDate: purchase.purchasedAt,
          validFrom: purchase.ticket!.validFrom ?? undefined,
          validUntil: purchase.ticket!.validUntil ?? undefined,
        });

        // Send email
        await sendPurchaseConfirmationEmail({
          recipient: purchase.email,
          appName: APP_NAME,
          organizationName: purchase.organization!.name,
          customerName: purchase.customerName ?? undefined,
          ticketTypeName: purchase.ticket!.name,
          ticketDescription: purchase.ticket!.description ?? undefined,
          ticketNumber: purchase.id,
          totalAmount: Number(purchase.totalAmount),
          currency: purchase.currency,
          purchaseDate: purchase.purchasedAt,
          downloadLink: `/api/purchases/${purchase.id}/pdf`,
          isComplimentary: Number(purchase.totalAmount) === 0,
          pdfAttachment: {
            filename: `ticket-${purchase.id}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        });

      return { success: true };
    } catch (error) {
      console.error('Error resending purchase email:', error);
      throw new Error('Failed to resend email');
    }
  });
