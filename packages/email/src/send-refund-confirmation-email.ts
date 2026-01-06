import { render } from '@react-email/render';
import { EmailProvider } from './provider';
import {
  RefundConfirmationEmail,
  type RefundConfirmationEmailProps,
} from './templates/refund-confirmation-email';

export type SendRefundConfirmationEmailInput = Omit<RefundConfirmationEmailProps, 'refundAmount' | 'refundDate'> & {
  recipient: string;
  refundAmount: number;
  refundDate?: Date;
};

export async function sendRefundConfirmationEmail(
  input: SendRefundConfirmationEmailInput
): Promise<void> {
  const emailProps: RefundConfirmationEmailProps = {
    appName: input.appName,
    organizationName: input.organizationName,
    customerName: input.customerName,
    ticketTypeName: input.ticketTypeName,
    ticketNumber: input.ticketNumber,
    refundAmount: input.refundAmount.toFixed(2),
    currency: input.currency,
    refundDate: input.refundDate?.toLocaleDateString() ?? new Date().toLocaleDateString(),
    refundReason: input.refundReason,
  };

  const component = RefundConfirmationEmail(emailProps);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `Refund Processed: ${input.ticketTypeName}`,
    html,
    text,
  });
}
