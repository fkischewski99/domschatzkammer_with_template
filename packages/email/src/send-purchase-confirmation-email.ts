import { render } from '@react-email/render';
import { APP_NAME } from '@workspace/common/app';
import { EmailProvider } from './provider';
import {
  PurchaseConfirmationEmail,
  type PurchaseConfirmationEmailProps,
} from './templates/purchase-confirmation-email';

export type SendPurchaseConfirmationEmailInput = Omit<PurchaseConfirmationEmailProps, 'totalAmount' | 'purchaseDate'> & {
  recipient: string;
  totalAmount: number;
  purchaseDate?: Date;
  pdfAttachment?: {
    filename: string;
    content: Buffer;
  };
};

export async function sendPurchaseConfirmationEmail(
  input: SendPurchaseConfirmationEmailInput
): Promise<void> {
  const emailProps: PurchaseConfirmationEmailProps = {
    appName: input.appName,
    organizationName: input.organizationName,
    customerName: input.customerName,
    ticketTypeName: input.ticketTypeName,
    ticketDescription: input.ticketDescription,
    purchaseDate: input.purchaseDate?.toLocaleDateString() ?? new Date().toLocaleDateString(),
    ticketNumber: input.ticketNumber,
    totalAmount: input.totalAmount.toFixed(2),
    currency: input.currency,
    downloadLink: input.downloadLink,
    isComplimentary: input.isComplimentary,
  };

  const component = PurchaseConfirmationEmail(emailProps);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  const subject = input.isComplimentary
    ? `Complimentary Ticket: ${input.ticketTypeName}`
    : `Your ${input.ticketTypeName} Ticket - Purchase Confirmed`;

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject,
    html,
    text,
    attachments: input.pdfAttachment
      ? [
          {
            filename: input.pdfAttachment.filename,
            content: input.pdfAttachment.content,
            contentType: 'application/pdf',
          },
        ]
      : undefined,
  });
}
