import { render } from '@react-email/render';
import { EmailProvider } from './provider';
import {
  GuideEventCancelledEmail,
  type GuideEventCancelledEmailProps,
} from './templates/guide-event-cancelled-email';

export type SendGuideEventCancelledEmailInput = Omit<
  GuideEventCancelledEmailProps,
  'eventDate'
> & {
  recipient: string;
  eventDate: Date;
};

export async function sendGuideEventCancelledEmail(
  input: SendGuideEventCancelledEmailInput
): Promise<void> {
  const emailProps: GuideEventCancelledEmailProps = {
    appName: input.appName,
    organizationName: input.organizationName,
    guideName: input.guideName,
    eventName: input.eventName,
    eventDate: input.eventDate.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    locationName: input.locationName,
    cancellationReason: input.cancellationReason,
  };

  const component = GuideEventCancelledEmail(emailProps);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `Veranstaltung abgesagt: ${input.eventName}`,
    html,
    text,
  });
}
