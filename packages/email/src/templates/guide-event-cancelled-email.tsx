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

export type GuideEventCancelledEmailProps = {
  appName: string;
  organizationName: string;
  guideName?: string;
  eventName: string;
  eventDate: string;
  locationName?: string;
  cancellationReason?: string;
};

export function GuideEventCancelledEmail({
  appName,
  organizationName,
  guideName,
  eventName,
  eventDate,
  locationName,
  cancellationReason,
}: GuideEventCancelledEmailProps): React.JSX.Element {
  const greeting = guideName ? `Hallo ${guideName}` : 'Hallo';

  return (
    <Html>
      <Head />
      <Preview>Veranstaltung abgesagt: {eventName}</Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Veranstaltung abgesagt
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">{greeting},</Text>

            <Text className="text-[14px] leading-[24px] text-black">
              die Veranstaltung <strong>{eventName}</strong>, zu der du als Domführer eingeteilt
              warst, wurde abgesagt.
            </Text>

            {cancellationReason && (
              <Text className="text-[14px] leading-[24px] text-black">
                <strong>Grund:</strong> {cancellationReason}
              </Text>
            )}

            <Section className="my-[24px] rounded-sm border border-solid border-[#eaeaea] p-[20px]">
              <Text className="m-0 mb-[12px] text-[14px] font-semibold text-black">
                Veranstaltungsdetails
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Veranstaltung:</strong> {eventName}
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                <strong>Datum:</strong> {eventDate}
              </Text>
              {locationName && (
                <Text className="m-0 text-[14px] leading-[20px] text-[#666666]">
                  <strong>Ort:</strong> {locationName}
                </Text>
              )}
            </Section>

            <Text className="text-[14px] leading-[24px] text-black">
              Deine Zuweisung zu dieser Veranstaltung wurde automatisch entfernt.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              Bei Fragen wende dich bitte direkt an {organizationName}.
            </Text>

            <Text className="text-[12px] leading-[24px] text-[#666666]">
              Diese E-Mail wurde von {appName} gesendet.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
