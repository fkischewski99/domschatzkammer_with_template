/**
 * PDF Ticket Generation
 * Generates PDF tickets from purchase data using React PDF
 */

import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { TicketTemplate, type TicketTemplateProps } from './templates/ticket-template';
import { generateQRCode } from '../qr/generate-qr-code';
import type { QRCodePayload } from '../qr/encode-purchase-data';

export interface GenerateTicketPDFInput {
  // Organization
  organizationId: string;
  organizationName: string;
  organizationLogo?: string;

  // Ticket Type
  ticketId: string;
  ticketTypeName: string;
  ticketDescription?: string;
  ticketFeatures: string[];

  // Purchase
  purchaseId: string;
  qrCode: string;
  customerName?: string;
  customerEmail: string;
  purchaseDate: Date;
  totalAmount: number;
  currency: string;
  isComplimentary?: boolean;

  // Validity
  validFrom?: Date;
  validUntil?: Date;
}

/**
 * Generate a PDF ticket from purchase data
 * This function is deterministic - same input produces same output
 */
export async function generateTicketPDF(
  input: GenerateTicketPDFInput
): Promise<Buffer> {
  try {
    // Generate QR code
    const qrPayload: QRCodePayload = {
      purchaseId: input.purchaseId,
      organizationId: input.organizationId,
      qrCode: input.qrCode,
      ticketId: input.ticketId,
    };

    const qrCodeDataURL = await generateQRCode(qrPayload, {
      errorCorrectionLevel: 'M',
      width: 256,
    });

    // Format dates
    const purchaseDate = input.purchaseDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const validFrom = input.validFrom?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const validUntil = input.validUntil?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format price
    const price = input.totalAmount.toFixed(2);

    // Generate ticket number from purchase ID (last 8 characters)
    const ticketNumber = `#${input.purchaseId.slice(-8).toUpperCase()}`;

    // Prepare template props
    const templateProps: TicketTemplateProps = {
      organizationName: input.organizationName,
      organizationLogo: input.organizationLogo,
      ticketTypeName: input.ticketTypeName,
      ticketDescription: input.ticketDescription,
      ticketFeatures: input.ticketFeatures,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      purchaseDate,
      ticketNumber,
      qrCodeDataURL,
      validFrom,
      validUntil,
      price,
      currency: input.currency,
      isComplimentary: input.isComplimentary,
    };

    // Render PDF to buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(TicketTemplate, templateProps) as any
    );

    return pdfBuffer;
  } catch (error) {
    throw new Error(
      `Failed to generate ticket PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate ticket PDF filename
 */
export function generateTicketFilename(
  purchaseId: string,
  organizationName: string
): string {
  const cleanOrgName = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const ticketNumber = purchaseId.slice(-8).toLowerCase();

  return `ticket-${cleanOrgName}-${ticketNumber}.pdf`;
}
