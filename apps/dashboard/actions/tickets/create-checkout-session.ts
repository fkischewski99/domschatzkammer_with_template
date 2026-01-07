'use server';

import { prisma } from '@workspace/database/client';
import { createTicketCheckoutSession } from '@workspace/billing/tickets';
import { validateTicketAvailability } from '@workspace/tickets';
import { z } from 'zod';

const CreateCheckoutSessionSchema = z.object({
  ticketId: z.string(),
  organizationId: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  quantity: z.number().int().positive().default(1),
});

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;

export interface CreateCheckoutSessionResult {
  success: boolean;
  sessionUrl?: string;
  error?: string;
}

/**
 * Create a Stripe Checkout session for anonymous ticket purchase
 * Public action - can be called by anonymous users
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionResult> {
  try {
    // Validate input
    const validated = CreateCheckoutSessionSchema.parse(input);
    const { ticketId, organizationId, customerEmail, customerName, customerPhone, quantity } = validated;

    // Fetch ticket and organization
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { organization: true },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    if (ticket.organizationId !== organizationId) {
      return { success: false, error: 'Invalid organization' };
    }

    // Check if organization has Stripe Connect set up
    if (!ticket.organization.stripeConnectAccountId) {
      return { success: false, error: 'Organization payment processing not configured' };
    }

    // Validate ticket availability
    const validation = validateTicketAvailability({
      isActive: ticket.isActive,
      stock: ticket.stock,
    });

    if (!validation.available) {
      return { success: false, error: validation.reason };
    }

    // Check stock for quantity
    if (ticket.stock !== null && ticket.stock < quantity) {
      return { success: false, error: 'Insufficient stock available' };
    }

    // Create checkout session
    const session = await createTicketCheckoutSession({
      ticketId: ticket.id,
      email: customerEmail,
      customerName,
      customerPhone,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/organizations/${ticket.organization.slug}/tickets/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/organizations/${ticket.organization.slug}/tickets`,
      metadata: {
        ticketId: ticket.id,
        organizationId: ticket.organizationId,
        customerName: customerName ?? '',
        customerPhone: customerPhone ?? '',
      },
    });

    // Create pending purchase record
    await prisma.purchase.create({
      data: {
        email: customerEmail,
        customerName,
        customerPhone,
        ticketId: ticket.id,
        organizationId: ticket.organizationId,
        stripeSessionId: session.id,
        status: 'PENDING',
        totalAmount: ticket.price.times(quantity),
        currency: ticket.currency,
      },
    });

    return { success: true, sessionUrl: session.url ?? undefined };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }
    return { success: false, error: 'Failed to create checkout session' };
  }
}
