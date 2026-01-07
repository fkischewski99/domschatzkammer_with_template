import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';
import { generateTicketPDF } from '@workspace/tickets';
import { auth } from '@workspace/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { purchaseId } = await params;

    // Fetch purchase with ticket and organization data
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        ticket: true,
        organization: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Verify purchase belongs to authenticated user
    if (purchase.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify purchase is completed and not invalidated
    if (purchase.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Purchase is not completed' },
        { status: 400 }
      );
    }

    if (purchase.invalidated) {
      return NextResponse.json(
        { error: 'This ticket has been invalidated' },
        { status: 400 }
      );
    }

    if (!purchase.qrCode) {
      return NextResponse.json(
        { error: 'QR code not available for this purchase' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateTicketPDF({
      organizationId: purchase.organizationId,
      organizationName: purchase.organization!.name,
      ticketId: purchase.ticketId,
      ticketTypeName: purchase.ticket!.name,
      ticketDescription: purchase.ticket!.description ?? undefined,
      ticketFeatures: purchase.ticket!.features as string[],
      purchaseId: purchase.id,
      qrCode: purchase.qrCode,
      customerName: purchase.customerName ?? undefined,
      customerEmail: purchase.email,
      totalAmount: Number(purchase.totalAmount),
      currency: purchase.currency,
      purchaseDate: purchase.purchasedAt,
      validFrom: purchase.ticket!.validFrom ?? undefined,
      validUntil: purchase.ticket!.validUntil ?? undefined,
    });

    // Return PDF as download
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${purchase.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
