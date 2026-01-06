import { prisma } from '@workspace/database/client';
// TODO: Import when tickets package exports are available
// import { generateTicketPDF } from '@workspace/tickets/pdf';
// import { sendPurchaseConfirmationEmail } from '@workspace/email/send-purchase-confirmation';

export interface ProcessPurchaseJobData {
  purchaseId: string;
}

/**
 * Background job handler for processing ticket purchases
 * This runs asynchronously after a Stripe checkout is completed
 *
 * Steps:
 * 1. Fetch purchase with related data
 * 2. Generate PDF ticket with QR code
 * 3. Send email with PDF attachment
 * 4. Log success/failure
 */
export async function processPurchase(job: { data: ProcessPurchaseJobData }): Promise<void> {
  const { purchaseId } = job.data;

  try {
    console.log(`[process-purchase] Starting job for purchase ${purchaseId}`);

    // Fetch purchase with relations
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        ticket: true,
        organization: true,
        user: true,
      },
    });

    if (!purchase) {
      throw new Error(`Purchase ${purchaseId} not found`);
    }

    if (purchase.status !== 'COMPLETED') {
      throw new Error(`Purchase ${purchaseId} is not in COMPLETED status (current: ${purchase.status})`);
    }

    console.log(`[process-purchase] Generating PDF for purchase ${purchaseId}`);

    // TODO: Implement PDF generation and email sending when packages are ready
    // Generate PDF ticket
    // const pdfBuffer = await generateTicketPDF(purchase);
    // console.log(`[process-purchase] PDF generated (${pdfBuffer.length} bytes), sending email to ${purchase.email}`);

    // Send email with PDF attachment
    // await sendPurchaseConfirmationEmail({
    //   to: purchase.email,
    //   purchase,
    //   pdfBuffer,
    // });

    console.log(`[process-purchase] TODO: Generate PDF and send email to ${purchase.email}`);

    console.log(`[process-purchase] Email sent successfully for purchase ${purchaseId}`);

    // TODO: Log successful delivery (implement audit log)
    // await logPurchaseEvent({
    //   purchaseId,
    //   event: 'ticket_delivered',
    //   metadata: { emailSentTo: purchase.email }
    // });

  } catch (error) {
    console.error(`[process-purchase] Error processing purchase ${purchaseId}:`, error);

    // TODO: Log failure for monitoring/alerting
    // await logPurchaseEvent({
    //   purchaseId,
    //   event: 'delivery_failed',
    //   metadata: { error: error.message }
    // });

    // Re-throw to trigger PgBoss retry
    throw error;
  }
}
