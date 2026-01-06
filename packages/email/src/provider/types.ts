export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type EmailPayload = {
  recipient: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

export type EmailProvider = {
  sendEmail(payload: EmailPayload): Promise<unknown>;
};
