/**
 * QR Code Payload Interface and Encoding
 * Provides deterministic encoding of purchase data for QR codes
 */

export interface QRCodePayload {
  purchaseId: string;
  organizationId: string;
  qrCode: string;
  ticketId: string;
}

/**
 * Encode purchase data into a deterministic JSON string for QR code
 * This ensures the same QR code is generated every time for the same purchase
 */
export function encodePurchaseData(payload: QRCodePayload): string {
  // Sort keys alphabetically for deterministic output
  const sorted: QRCodePayload = {
    organizationId: payload.organizationId,
    purchaseId: payload.purchaseId,
    qrCode: payload.qrCode,
    ticketId: payload.ticketId,
  };

  return JSON.stringify(sorted);
}

/**
 * Decode QR code data back into payload
 */
export function decodePurchaseData(data: string): QRCodePayload {
  try {
    const parsed = JSON.parse(data);

    if (!parsed.purchaseId || !parsed.organizationId || !parsed.qrCode || !parsed.ticketId) {
      throw new Error('Invalid QR code data: missing required fields');
    }

    return parsed as QRCodePayload;
  } catch (error) {
    throw new Error(`Failed to decode QR code data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
