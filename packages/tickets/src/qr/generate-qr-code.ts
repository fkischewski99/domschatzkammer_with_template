/**
 * QR Code Generation
 * Generates deterministic QR codes for ticket purchases
 */

import QRCode from 'qrcode';
import { encodePurchaseData, type QRCodePayload } from './encode-purchase-data';

export interface GenerateQRCodeOptions {
  /**
   * Error correction level (L = 7%, M = 15%, Q = 25%, H = 30%)
   * Higher levels allow QR code to be read even if partially damaged
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';

  /**
   * QR code size in pixels (default: 256)
   */
  width?: number;

  /**
   * Output format (default: 'dataURL' for embedding in PDFs/emails)
   */
  format?: 'dataURL' | 'buffer';
}

/**
 * Generate a QR code as a data URL for a purchase
 * This function is deterministic - same input always produces same output
 */
export async function generateQRCode(
  payload: QRCodePayload,
  options: GenerateQRCodeOptions = {}
): Promise<string> {
  const {
    errorCorrectionLevel = 'M',
    width = 256,
    format = 'dataURL',
  } = options;

  const data = encodePurchaseData(payload);

  try {
    if (format === 'dataURL') {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel,
        width,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } else {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel,
        width,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return buffer.toString('base64');
    }
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate QR code as Buffer for server-side processing
 */
export async function generateQRCodeBuffer(
  payload: QRCodePayload,
  options: Omit<GenerateQRCodeOptions, 'format'> = {}
): Promise<Buffer> {
  const data = encodePurchaseData(payload);

  const {
    errorCorrectionLevel = 'M',
    width = 256,
  } = options;

  try {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel,
      width,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to generate QR code buffer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
