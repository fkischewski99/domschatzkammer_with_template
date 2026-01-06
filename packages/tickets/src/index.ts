// Ticket Purchase System - Public API
// This package provides PDF generation, QR code generation, and validation for ticket purchases

// PDF Generation
export {
  generateTicketPDF,
  generateTicketFilename,
  type GenerateTicketPDFInput,
} from './pdf/generate-ticket-pdf';

export {
  TicketTemplate,
  type TicketTemplateProps,
} from './pdf/templates/ticket-template';

// QR Code Generation
export {
  generateQRCode,
  generateQRCodeBuffer,
  type GenerateQRCodeOptions,
} from './qr/generate-qr-code';

export {
  encodePurchaseData,
  decodePurchaseData,
  type QRCodePayload,
} from './qr/encode-purchase-data';

// Validation
export {
  validateTicketAvailability,
  validateTicketDateRange,
  validateRefund,
  validatePrice,
  validateFeatures,
  PurchaseStatusSchema,
  CustomerInfoSchema,
  PurchaseDataSchema,
  type StockValidationInput,
  type DateRangeValidationInput,
  type RefundValidationInput,
} from './validation/validate-purchase';

// Background Job Queue
export {
  initializeQueue,
  getQueue,
  stopQueue,
  isQueueReady,
  registerJobHandlers,
  enqueueWebhookJob,
  JOB_NAMES,
  processWebhookHandler,
  type QueueConfig,
  type WebhookJobPayload,
} from './jobs';
