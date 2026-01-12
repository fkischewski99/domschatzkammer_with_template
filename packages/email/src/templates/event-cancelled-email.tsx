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

export type EventCancelledEmailProps = {
  appName: string;
  organizationName: string;
  customerName?: string;
  eventName: string;
  eventDate: string;
  locationName?: string;
  ticketTypeName: string;
  ticketNumber: string;
  refundAmount?: string;
  currency?: string;
  cancellationReason?: string;
  refundProcessed: boolean;
};

export function EventCancelledEmail({
  appName,
  organizationName,
  customerName,
  eventName,
  eventDate,
  locationName,
  ticketTypeName,
  ticketNumber,
  refundAmount,
  currency,
  cancellationReason,
  refundProcessed,
}: EventCancelledEmailProps): React.JSX.Element {
  const greeting = customerName ? `Hello ${customerName}` : 'Hello';

  return (
    <Html>
      <Head />
      <Preview>Event Cancelled: {eventName}</Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Event Cancelled
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">{greeting},</Text>

            <Text className="text-[14px] leading-[24px] text-black">
              We regret to inform you that the event <strong>{eventName}</strong> organized by{' '}
              <strong>{organizationName}</strong> has been cancelled.
            </Text>

            {cancellationReason && (
              <Text className="text-[14px] leading-[24px] text-black">
                <strong>Reason:</strong> {cancellationReason}
              </Text>
            )}

            <Section className="my-[24px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
              <Text className="m-0 mb-[12px] text-[14px] font-semibold text-black">
                Event Details
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Event:</strong> {eventName}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Date:</strong> {eventDate}
              </Text>
              {locationName && (
                <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                  <strong>Location:</strong> {locationName}
                </Text>
              )}
              <Text className="m-0 mt-[12px] text-[14px] leading-[20px] text-[#666666]">
                <strong>Ticket Type:</strong> {ticketTypeName}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Ticket Number:</strong> {ticketNumber}
              </Text>
            </Section>

            {refundProcessed && refundAmount && currency && (
              <Section className="my-[24px] rounded-sm border border-solid border-[#22c55e] bg-[#f0fdf4] p-[20px]">
                <Text className="m-0 mb-[12px] text-[14px] font-semibold text-[#166534]">
                  Refund Processed
                </Text>
                <Text className="m-0 text-[14px] leading-[20px] text-[#166534]">
                  <strong>Refund Amount:</strong> {refundAmount} {currency}
                </Text>
                <Text className="m-0 mt-[12px] text-[14px] leading-[20px] text-[#166534]">
                  The refund will be credited back to your original payment method within 5-10
                  business days, depending on your bank or payment provider.
                </Text>
              </Section>
            )}

            {!refundProcessed && (
              <Section className="my-[24px] rounded-sm border border-solid border-[#d1d5db] bg-[#f9fafb] p-[20px]">
                <Text className="m-0 text-[14px] leading-[20px] text-[#374151]">
                  This was a free ticket, so no refund is required.
                </Text>
              </Section>
            )}

            <Text className="text-[14px] leading-[24px] text-black">
              <strong>Important:</strong> Your ticket has been invalidated and can no longer be
              used. Please do not attempt to use the QR code from the original ticket.
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              We apologize for any inconvenience this may cause.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you have any questions, please contact {organizationName} directly.
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
