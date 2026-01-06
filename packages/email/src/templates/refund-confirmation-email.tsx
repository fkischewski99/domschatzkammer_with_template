import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export type RefundConfirmationEmailProps = {
  appName: string;
  organizationName: string;
  customerName?: string;
  ticketTypeName: string;
  ticketNumber: string;
  refundAmount: string;
  currency: string;
  refundDate: string;
  refundReason?: string;
};

export function RefundConfirmationEmail({
  appName,
  organizationName,
  customerName,
  ticketTypeName,
  ticketNumber,
  refundAmount,
  currency,
  refundDate,
  refundReason,
}: RefundConfirmationEmailProps): React.JSX.Element {
  const greeting = customerName ? `Hello ${customerName}` : 'Hello';

  return (
    <Html>
      <Head />
      <Preview>
        Refund processed for your {ticketTypeName} ticket
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Refund Processed
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">{greeting},</Text>

            <Text className="text-[14px] leading-[24px] text-black">
              Your refund request for ticket <strong>{ticketTypeName}</strong> from{' '}
              <strong>{organizationName}</strong> has been processed successfully.
            </Text>

            <Section className="my-[24px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
              <Text className="m-0 mb-[12px] text-[14px] font-semibold text-black">
                Refund Details
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Ticket Number:</strong> {ticketNumber}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Refund Amount:</strong> {refundAmount} {currency}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Refund Date:</strong> {refundDate}
              </Text>
              {refundReason && (
                <Text className="m-0 mt-[12px] text-[14px] leading-[20px] text-[#666666]">
                  <strong>Reason:</strong> {refundReason}
                </Text>
              )}
            </Section>

            <Text className="text-[14px] leading-[24px] text-black">
              The refund will be credited back to your original payment method within 5-10
              business days, depending on your bank or payment provider.
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              <strong>Important:</strong> Your ticket has been invalidated and can no longer be
              used for entry. Please do not attempt to use the QR code from the original ticket.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you have any questions about this refund, please contact {organizationName}{' '}
              directly.
            </Text>

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This email was sent from {appName}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
