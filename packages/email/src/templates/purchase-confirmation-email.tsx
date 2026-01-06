import * as React from 'react';
import {
  Body,
  Button,
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

export type PurchaseConfirmationEmailProps = {
  appName: string;
  organizationName: string;
  customerName?: string;
  ticketTypeName: string;
  ticketDescription?: string;
  purchaseDate: string;
  ticketNumber: string;
  totalAmount: string;
  currency: string;
  downloadLink: string;
  isComplimentary?: boolean;
};

export function PurchaseConfirmationEmail({
  appName,
  organizationName,
  customerName,
  ticketTypeName,
  ticketDescription,
  purchaseDate,
  ticketNumber,
  totalAmount,
  currency,
  downloadLink,
  isComplimentary = false,
}: PurchaseConfirmationEmailProps): React.JSX.Element {
  const greeting = customerName ? `Hello ${customerName}` : 'Hello';

  return (
    <Html>
      <Head />
      <Preview>
        Your {ticketTypeName} ticket from {organizationName}
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              {isComplimentary ? 'Complimentary Ticket Issued' : 'Purchase Confirmed!'}
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">{greeting},</Text>

            {isComplimentary ? (
              <Text className="text-[14px] leading-[24px] text-black">
                A complimentary ticket has been issued to you by {organizationName}. Your ticket
                is attached to this email.
              </Text>
            ) : (
              <Text className="text-[14px] leading-[24px] text-black">
                Thank you for your purchase! Your ticket for <strong>{ticketTypeName}</strong> from{' '}
                <strong>{organizationName}</strong> has been confirmed.
              </Text>
            )}

            {ticketDescription && (
              <Text className="text-[14px] leading-[24px] text-[#666666]">
                {ticketDescription}
              </Text>
            )}

            <Section className="my-[24px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
              <Text className="m-0 mb-[12px] text-[14px] font-semibold text-black">
                Ticket Details
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Ticket Number:</strong> {ticketNumber}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Purchase Date:</strong> {purchaseDate}
              </Text>
              {!isComplimentary && (
                <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                  <strong>Amount:</strong> {totalAmount} {currency}
                </Text>
              )}
              {isComplimentary && (
                <Text className="m-0 text-[14px] leading-[20px] text-[#10B981] font-semibold">
                  COMPLIMENTARY - No payment required
                </Text>
              )}
            </Section>

            <Text className="text-[14px] leading-[24px] text-black">
              Your PDF ticket with QR code is attached to this email. You can also download it
              using the button below:
            </Text>

            <Section className="my-[32px] text-center">
              <Button
                href={downloadLink}
                className="rounded-sm bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
              >
                Download Ticket PDF
              </Button>
            </Section>

            <Text className="text-[14px] leading-[24px] text-black">
              Please bring this ticket (printed or on your mobile device) along with a valid ID
              for entry. Make sure to arrive on time and follow the organization's guidelines.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              If you have any questions about your ticket, please contact {organizationName}{' '}
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
