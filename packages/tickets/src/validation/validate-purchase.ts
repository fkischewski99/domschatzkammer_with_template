/**
 * Purchase Validation Functions
 * Business rule validation for ticket purchases
 */

import { z } from 'zod';

/**
 * Purchase status validation
 */
export const PurchaseStatusSchema = z.enum(['PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED']);

/**
 * Customer information validation
 */
export const CustomerInfoSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  customerName: z.string().max(255).optional(),
  customerPhone: z.string().max(50).optional(),
});

/**
 * Ticket purchase validation
 */
export const PurchaseDataSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  organizationId: z.string().uuid('Invalid organization ID'),
  email: z.string().email('Invalid email address'),
  customerName: z.string().max(255).optional(),
  customerPhone: z.string().max(50).optional(),
  userId: z.string().uuid('Invalid user ID').optional().nullable(),
});

/**
 * Stock validation
 */
export interface StockValidationInput {
  stock: number | null;
  isActive: boolean;
}

export function validateTicketAvailability(ticket: StockValidationInput): {
  available: boolean;
  reason?: string;
} {
  // Check if ticket is active
  if (!ticket.isActive) {
    return {
      available: false,
      reason: 'This ticket type is no longer available for purchase',
    };
  }

  // Check stock (null means unlimited)
  if (ticket.stock !== null && ticket.stock <= 0) {
    return {
      available: false,
      reason: 'This ticket type is sold out',
    };
  }

  return { available: true };
}

/**
 * Date range validation for ticket validity
 */
export interface DateRangeValidationInput {
  validFrom?: Date | null;
  validUntil?: Date | null;
}

export function validateTicketDateRange(
  ticket: DateRangeValidationInput
): {
  valid: boolean;
  reason?: string;
} {
  const now = new Date();

  // If no date range specified, always valid
  if (!ticket.validFrom && !ticket.validUntil) {
    return { valid: true };
  }

  // Check valid from
  if (ticket.validFrom && now < ticket.validFrom) {
    return {
      valid: false,
      reason: `This ticket is not yet valid. Valid from: ${ticket.validFrom.toLocaleDateString()}`,
    };
  }

  // Check valid until
  if (ticket.validUntil && now > ticket.validUntil) {
    return {
      valid: false,
      reason: `This ticket has expired. Valid until: ${ticket.validUntil.toLocaleDateString()}`,
    };
  }

  return { valid: true };
}

/**
 * Refund validation
 */
export interface RefundValidationInput {
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED';
  totalAmount: number;
}

export function validateRefund(purchase: RefundValidationInput): {
  canRefund: boolean;
  reason?: string;
} {
  // Can only refund completed purchases
  if (purchase.status !== 'COMPLETED') {
    return {
      canRefund: false,
      reason: `Cannot refund purchase with status: ${purchase.status}`,
    };
  }

  // Cannot refund zero-amount purchases (complimentary tickets)
  if (purchase.totalAmount === 0) {
    return {
      canRefund: false,
      reason: 'Complimentary tickets cannot be refunded (amount is 0)',
    };
  }

  return { canRefund: true };
}

/**
 * Price validation
 */
export function validatePrice(price: number): {
  valid: boolean;
  reason?: string;
} {
  if (price < 0) {
    return {
      valid: false,
      reason: 'Price cannot be negative',
    };
  }

  if (price > 99999999.99) {
    return {
      valid: false,
      reason: 'Price exceeds maximum allowed value (99,999,999.99)',
    };
  }

  // Check decimal places
  const decimalPlaces = (price.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return {
      valid: false,
      reason: 'Price can have at most 2 decimal places',
    };
  }

  return { valid: true };
}

/**
 * Features validation (max 20 features, each max 255 characters)
 */
export function validateFeatures(features: string[]): {
  valid: boolean;
  reason?: string;
} {
  if (features.length > 20) {
    return {
      valid: false,
      reason: 'Cannot have more than 20 features',
    };
  }

  for (const feature of features) {
    if (feature.length > 255) {
      return {
        valid: false,
        reason: `Feature "${feature.substring(0, 30)}..." exceeds 255 characters`,
      };
    }
  }

  // Check for duplicates
  const uniqueFeatures = new Set(features);
  if (uniqueFeatures.size !== features.length) {
    return {
      valid: false,
      reason: 'Duplicate features are not allowed',
    };
  }

  return { valid: true };
}
