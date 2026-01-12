import { render } from '@react-email/render';
import { EmailProvider } from './provider';
import {
  EventCancelledEmail,
  type EventCancelledEmailProps,
} from './templates/event-cancelled-email';

export type SendEventCancelledEmailInput = Omit<
  EventCancelledEmailProps,
  'refundAmount' | 'eventDate'
> & {
  recipient: string;
  refundAmount?: number;
  eventDate: Date;
};

export async function sendEventCancelledEmail(
  input: SendEventCancelledEmailInput
): Promise<void> {
  const emailProps: EventCancelledEmailProps = {
    appName: input.appName,
    organizationName: input.organizationName,
    customerName: input.customerName,
    eventName: input.eventName,
    eventDate: input.eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    locationName: input.locationName,
    ticketTypeName: input.ticketTypeName,
    ticketNumber: input.ticketNumber,
    refundAmount: input.refundAmount?.toFixed(2),
    currency: input.currency,
    cancellationReason: input.cancellationReason,
    refundProcessed: input.refundProcessed,
  };

  const component = EventCancelledEmail(emailProps);
  const html = await render(component);
  const text = await render(component, { plainText: true });

  await EmailProvider.sendEmail({
    recipient: input.recipient,
    subject: `Event Cancelled: ${input.eventName}`,
    html,
    text,
  });
}
