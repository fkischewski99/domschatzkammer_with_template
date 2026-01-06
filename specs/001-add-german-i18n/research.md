# Research & Technical Decisions: Ticket Purchase System

**Date**: 2026-01-02
**Feature**: Ticket Purchase System
**Phase**: 0 - Research

## Overview

This document captures all technical research findings and decisions made during the planning phase for the ticket purchase system implementation.

## Key Technical Decisions

### 1. PDF Generation Library

**Decision**: Use `@react-pdf/renderer` (v4.2.0)

**Rationale**:
- **React Integration**: Already using React Email for email templates, consistent pattern
- **Server-Side Rendering**: Works in Node.js environment (Next.js API routes/server actions)
- **Declarative Syntax**: JSX-based API familiar to team
- **Active Maintenance**: Well-maintained with 13k+ GitHub stars
- **TypeScript Support**: First-class TypeScript support
- **Deterministic Output**: Same input produces identical PDF (critical for on-demand regeneration)

**Alternatives Considered**:
- **PDFKit**: More low-level API, harder to maintain templates
- **Puppeteer**: Heavy dependency (Chrome instance), overkill for ticket generation
- **jsPDF**: Imperative API, less React-friendly
- **pdfmake**: JSON-based configuration, less flexible than JSX

**Implementation Pattern**:
```typescript
// packages/tickets/src/pdf/templates/ticket-template.tsx
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

export const TicketTemplate = ({ purchase, ticket, organization, qrCode }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Organization branding, QR code, ticket details */}
    </Page>
  </Document>
);

// packages/tickets/src/pdf/generate-ticket-pdf.ts
import { renderToBuffer } from '@react-pdf/renderer';

export async function generateTicketPDF(purchase: Purchase): Promise<Buffer> {
  const qrCode = await generateQRCode(purchase);
  const pdf = <TicketTemplate purchase={purchase} qrCode={qrCode} />;
  return await renderToBuffer(pdf);
}
```

---

### 2. QR Code Generation

**Decision**: Use `qrcode` (v1.5.4)

**Rationale**:
- **Simple API**: Straightforward generation to PNG/SVG/data URL
- **Deterministic**: Same input = same output (critical requirement)
- **Lightweight**: No heavy dependencies
- **Proven**: 10k+ GitHub stars, used in production systems
- **Error Correction**: Configurable error correction levels (use 'H' for tickets)

**Alternatives Considered**:
- **node-qrcode**: Similar but less actively maintained
- **qr-image**: Generates only PNG/SVG files (not data URLs)
- **fast-qr-code-generator**: Newer but less proven

**QR Code Data Format**:
```typescript
// Encode purchase data deterministically
interface QRCodePayload {
  purchaseId: string;        // Unique purchase identifier
  qrCode: string;            // Stored QR code UUID
  organizationId: string;    // For validation scoping
  version: number;           // Schema version (future-proofing)
}

// Generate deterministic QR code
export async function generateQRCode(purchase: Purchase): Promise<string> {
  const payload: QRCodePayload = {
    purchaseId: purchase.id,
    qrCode: purchase.qrCode,  // UUID stored in database
    organizationId: purchase.organizationId,
    version: 1
  };

  const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
    errorCorrectionLevel: 'H',  // High error correction (30%)
    type: 'image/png',
    width: 300,
    margin: 2
  });

  return dataUrl;  // Embeddable in PDF as data URL
}
```

---

### 3. Background Job Queue (Critical for Performance)

**Decision**: Use `pg-boss` (v11.1.0) - PostgreSQL-based job queue

**Rationale**:
- **No New Infrastructure**: Uses existing PostgreSQL database
- **Reliability**: ACID transactions, at-least-once delivery
- **Simple Setup**: No Redis/RabbitMQ required
- **Cron Support**: Built-in scheduled job support
- **Monitoring**: Query-based job monitoring
- **TypeScript Support**: Fully typed API

**Why Needed**:
- Stripe webhook timeout limit: 30 seconds
- PDF generation: 1-5 seconds per ticket
- Email delivery: 1-3 seconds
- **Total**: 2-8 seconds (acceptable, but should be async for reliability)

**Alternatives Considered**:
- **BullMQ**: Requires Redis (new infrastructure)
- **Graphile Worker**: Similar to pg-boss but less adoption
- **Inngest**: External service, adds cost
- **Trigger.dev**: External service, adds cost

**Implementation Pattern**:
```typescript
// packages/tickets/src/jobs/process-purchase.ts
import PgBoss from 'pg-boss';

export async function enqueuePurchaseProcessing(purchaseId: string) {
  const boss = await createPgBoss();
  await boss.send('process-purchase', { purchaseId });
}

export async function processPurchase(job: { data: { purchaseId: string } }) {
  const purchase = await getPurchase(job.data.purchaseId);

  // Generate PDF
  const pdfBuffer = await generateTicketPDF(purchase);

  // Send email with PDF attachment
  await sendPurchaseConfirmationEmail({
    to: purchase.email,
    purchase,
    attachment: pdfBuffer
  });

  // Log success
  await logPurchaseEvent(purchase.id, 'ticket_delivered');
}

// Stripe webhook (apps/dashboard/app/api/billing/webhook/route.ts)
export async function POST(request: Request) {
  const event = await verifyStripeWebhook(request);

  if (event.type === 'checkout.session.completed') {
    const purchase = await createPurchase(event.data);

    // Enqueue async processing instead of inline
    await enqueuePurchaseProcessing(purchase.id);

    return new Response('OK', { status: 200 });  // Fast response
  }
}
```

---

### 4. Database Schema Design

**Decision**: Extend Prisma schema with normalized tables

**Key Design Decisions**:

#### 4.1 Ticket Model
```prisma
model Ticket {
  id             String    @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Ticket attributes
  name           String
  description    String?   @db.Text
  price          Decimal   @db.Decimal(10, 2)  // Max 99,999,999.99
  currency       String    @default("EUR") @db.VarChar(3)
  features       Json      @default("[]")  // Array of feature strings

  // Stock management
  stock          Int?      // null = unlimited

  // Validity period
  validFrom      DateTime?
  validUntil     DateTime?

  // Status
  isActive       Boolean   @default(true)

  // Stripe references
  stripeProductId String?  @unique
  stripePriceId   String?  @unique

  // Relations
  purchases      Purchase[]

  // Timestamps
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([organizationId, isActive])  // List active tickets per org
  @@index([stripeProductId])
}
```

#### 4.2 Purchase Model
```prisma
model Purchase {
  id                    String    @id @default(cuid())

  // Customer information
  email                 String
  customerName          String?
  customerPhone         String?
  userId                String?   // null for anonymous
  user                  User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Purchase details
  ticketId              String
  ticket                Ticket    @relation(fields: [ticketId], references: [id], onDelete: Restrict)
  organizationId        String    // Denormalized for queries
  organization          Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Payment information
  stripeSessionId       String    @unique
  stripePaymentIntentId String?
  status                String    // pending|completed|refunded|cancelled
  totalAmount           Decimal   @db.Decimal(10, 2)
  currency              String    @db.VarChar(3)

  // Ticket delivery
  qrCode                String    @unique @default(uuid())  // Deterministic UUID

  // Invalidation
  invalidated           Boolean   @default(false)
  invalidatedAt         DateTime?

  // Validation (future feature)
  validated             Boolean   @default(false)
  validatedAt           DateTime?
  validatedBy           String?   // UserId of validator

  // Metadata
  metadata              Json?     @db.JsonB

  // Timestamps
  purchasedAt           DateTime  @default(now())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  claimToken            ClaimToken?

  @@index([organizationId, status])      // List purchases per org
  @@index([userId, status])              // User purchase history
  @@index([email])                       // Find purchases by email
  @@index([qrCode])                      // QR code validation
  @@index([ticketId])                    // Tickets sold per type
  @@index([purchasedAt])                 // Analytics by date
}
```

#### 4.3 ClaimToken Model
```prisma
model ClaimToken {
  id            String    @id @default(cuid())

  purchaseId    String    @unique
  purchase      Purchase  @relation(fields: [purchaseId], references: [id], onDelete: Cascade)

  token         String    @unique @default(uuid())  // Cryptographically secure
  expiresAt     DateTime  // createdAt + 30 days
  used          Boolean   @default(false)
  usedAt        DateTime?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([token, expiresAt, used])  // Token validation query
}
```

**Indexing Strategy**:
- **organizationId**: All tables scoped to organization (multi-tenancy)
- **Status fields**: Frequent filtering (active tickets, completed purchases)
- **Foreign keys**: Automatic indexes for joins
- **qrCode**: Unique lookup for validation
- **email**: Find purchases for claim-all feature
- **Timestamps**: Analytics queries by date range

---

### 5. Email Attachment Handling

**Decision**: Use Nodemailer's `attachments` property with Buffer

**Implementation**:
```typescript
// packages/email/src/send-purchase-confirmation-email.ts
import { sendEmail } from './provider';
import { render } from '@react-email/components';
import { PurchaseConfirmationEmail } from './templates/purchase-confirmation-email';

export async function sendPurchaseConfirmationEmail({
  to,
  purchase,
  pdfBuffer
}: {
  to: string;
  purchase: Purchase;
  pdfBuffer: Buffer;
}) {
  const html = await render(<PurchaseConfirmationEmail purchase={purchase} />);

  await sendEmail({
    to,
    subject: `Your ticket for ${purchase.ticket.name}`,
    html,
    attachments: [
      {
        filename: `ticket-${purchase.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
}
```

**Email Retry Strategy**:
- pg-boss automatic retries: 3 attempts with exponential backoff
- Manual retry: Admin action to resend email from purchase detail page

---

### 6. Stripe Product/Price Management

**Decision**: Create one Stripe Price per Ticket (one-time payment)

**Pattern**:
```typescript
// packages/billing/src/data/tickets.ts
export async function createStripeProductForTicket(ticket: Ticket) {
  const stripe = getStripeClient();

  // Create product
  const product = await stripe.products.create({
    name: ticket.name,
    description: ticket.description || undefined,
    metadata: {
      organizationId: ticket.organizationId,
      ticketId: ticket.id
    }
  });

  // Create price (one-time payment)
  const price = await stripe.prices.create({
    product: product.id,
    currency: ticket.currency.toLowerCase(),
    unit_amount: Math.round(ticket.price.toNumber() * 100),  // Convert to cents
    metadata: {
      ticketId: ticket.id
    }
  });

  // Update ticket with Stripe IDs
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      stripeProductId: product.id,
      stripePriceId: price.id
    }
  });

  return { product, price };
}
```

**Why Not Recurring Prices**:
- Tickets are one-time purchases (per spec requirement)
- Simplified Stripe configuration (no subscription management)
- Easier webhook handling (only `checkout.session.completed`)

---

### 7. Server Action Authorization Pattern

**Decision**: Use existing `authOrganizationActionClient` for admin actions

**Pattern**:
```typescript
// apps/dashboard/actions/tickets/create-ticket.ts
import { authOrganizationActionClient } from '../safe-action';
import { createTicketSchema } from './schemas';

export const createTicket = authOrganizationActionClient
  .metadata({ actionName: 'createTicket' })
  .schema(createTicketSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { organization, user, membership } = ctx;

    // Authorization check (must be admin)
    if (membership.role !== 'ADMIN' && !membership.isOwner) {
      throw new Error('Unauthorized: Admin role required');
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ...parsedInput,
        organizationId: organization.id
      }
    });

    // Create Stripe product/price
    await createStripeProductForTicket(ticket);

    // Log action
    await logAdminAction({
      userId: user.id,
      organizationId: organization.id,
      action: 'create_ticket',
      resourceId: ticket.id
    });

    revalidatePath(`/organizations/${organization.slug}/settings/organization/tickets`);

    return { ticket };
  });
```

---

### 8. i18n Strategy for Tickets

**Decision**: Store ticket content in database (not i18n files)

**Rationale**:
- **User-Generated Content**: Ticket names/descriptions created by org admins
- **Dynamic**: Cannot be pre-translated in static files
- **Organization-Scoped**: Each org defines their own tickets
- **Future Enhancement**: Could add `language` field to Ticket model for multi-language support

**System Messages**: Use next-intl for UI labels, buttons, errors
```json
// apps/dashboard/messages/en.json
{
  "tickets": {
    "create": "Create Ticket",
    "edit": "Edit Ticket",
    "delete": "Delete Ticket",
    "active": "Active",
    "inactive": "Inactive",
    "soldOut": "Sold Out"
  }
}
```

---

### 9. CSV Export Format

**Decision**: Use `papaparse` (v5.4.1) for CSV generation

**Format**:
```typescript
// apps/dashboard/actions/purchases/export-purchases.ts
import Papa from 'papaparse';

export async function exportPurchases(organizationId: string, filters: Filters) {
  const purchases = await getPurchases(organizationId, filters);

  const csv = Papa.unparse(purchases.map(p => ({
    'Purchase ID': p.id,
    'Date': p.purchasedAt.toISOString(),
    'Customer Email': p.email,
    'Customer Name': p.customerName || '',
    'Ticket Type': p.ticket.name,
    'Amount': p.totalAmount.toString(),
    'Currency': p.currency,
    'Status': p.status,
    'QR Code': p.qrCode,
    'Validated': p.validated ? 'Yes' : 'No',
    'Validated At': p.validatedAt?.toISOString() || ''
  })));

  return new Blob([csv], { type: 'text/csv' });
}
```

---

### 10. Analytics Queries Optimization

**Decision**: Use Prisma aggregations with proper indexes

**Pattern**:
```typescript
// apps/dashboard/data/purchases/get-purchase-analytics.ts
export async function getPurchaseAnalytics(
  organizationId: string,
  dateRange: { from: Date; to: Date }
) {
  const [totalRevenue, ticketsSold, byTicketType] = await Promise.all([
    // Total revenue
    prisma.purchase.aggregate({
      where: {
        organizationId,
        status: 'completed',
        purchasedAt: { gte: dateRange.from, lte: dateRange.to }
      },
      _sum: { totalAmount: true }
    }),

    // Total tickets sold
    prisma.purchase.count({
      where: {
        organizationId,
        status: 'completed',
        purchasedAt: { gte: dateRange.from, lte: dateRange.to }
      }
    }),

    // Breakdown by ticket type
    prisma.purchase.groupBy({
      by: ['ticketId'],
      where: {
        organizationId,
        status: 'completed',
        purchasedAt: { gte: dateRange.from, lte: dateRange.to }
      },
      _count: { id: true },
      _sum: { totalAmount: true }
    })
  ]);

  return {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    ticketsSold,
    byTicketType
  };
}
```

**Performance Target**: <3 seconds for 10,000 purchases (per spec SC-008)
**Strategy**: Indexed queries + parallel aggregations

---

## Dependencies to Add

### New Packages

**Core Dependencies**:
```json
{
  "@react-pdf/renderer": "^4.2.0",
  "qrcode": "^1.5.4",
  "pg-boss": "^11.1.0",
  "papaparse": "^5.4.1"
}
```

**Dev Dependencies**:
```json
{
  "@types/qrcode": "^1.5.5",
  "@types/papaparse": "^5.3.14"
}
```

### Package Installation

```bash
# In workspace root
pnpm add @react-pdf/renderer qrcode pg-boss papaparse

# In new tickets package
cd packages/tickets
pnpm add @react-pdf/renderer qrcode

# In billing package
cd packages/billing
pnpm add pg-boss

# Dev dependencies
pnpm add -D @types/qrcode @types/papaparse
```

---

## Migration Strategy

### Phase 1: Additive Changes (No Breaking Changes)
1. Add new Prisma models (Ticket, Purchase, ClaimToken)
2. Create new `@workspace/tickets` package
3. Add new routes in dashboard app
4. Existing subscription features continue to work

### Phase 2: Coexistence
- Organizations can use EITHER subscriptions OR tickets (not both initially)
- Flag in Organization model: `billingMode: 'subscription' | 'tickets'`
- UI shows appropriate interface based on flag

### Phase 3: Deprecation (Future)
- Migrate remaining subscription orgs to tickets
- Remove subscription-related code
- Archive Stripe subscription products

---

## Testing Strategy

### E2E Tests (Playwright)

**Critical Flows**:
1. **Admin creates ticket** → Verify Stripe product/price created
2. **Anonymous purchase** → Checkout → Webhook → PDF email delivery
3. **Authenticated purchase** → Appears in user dashboard
4. **Admin refund** → Status updated → QR invalidated → Email sent
5. **Claim anonymous purchase** → Link userId → Appears in dashboard
6. **Purchase filtering & export** → CSV download

**Test File**: `e2e/ticket-purchase.spec.ts`

**No Unit Tests**: Project doesn't have unit testing setup
**Recommendation**: Consider adding Vitest for:
- PDF generation (snapshot testing)
- QR code encoding/decoding
- Analytics calculations
- Validation logic

---

## Open Questions / Future Research

### 1. PDF Generation Performance
- **Question**: Can @react-pdf/renderer handle 100+ concurrent PDF generations?
- **Next Step**: Load test with pg-boss + realistic PDF templates
- **Fallback**: If slow, consider pre-rendered templates with dynamic text overlay

### 2. QR Code Validation (Future Feature)
- **Question**: Mobile app or web-based scanner?
- **Current**: QR validation out of scope (FR-008 stores code, but validation not implemented)
- **Future**: Decide on validation endpoint pattern when implementing Domführer role

### 3. Multi-Language Tickets
- **Question**: Should tickets support multiple languages?
- **Current**: Single language per ticket (admin-defined content)
- **Future**: Add `translations` JSON field or separate TicketTranslation model

### 4. Stock Race Conditions
- **Question**: How to prevent overselling when stock=1 and 2 checkouts?
- **Solution**: Use Prisma transaction with `decrement`:
  ```typescript
  await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({ where: { id } });
    if (ticket.stock !== null && ticket.stock <= 0) {
      throw new Error('Sold out');
    }
    await tx.ticket.update({
      where: { id, stock: { gt: 0 } },  // Atomic decrement only if > 0
      data: { stock: { decrement: 1 } }
    });
  });
  ```

---

## Summary

All technical decisions documented. Key takeaways:

1. **PDF**: @react-pdf/renderer (React-based, deterministic)
2. **QR**: qrcode library (simple, reliable)
3. **Jobs**: pg-boss (no new infrastructure)
4. **Database**: Prisma with proper indexing
5. **Email**: Extend existing Nodemailer setup
6. **Stripe**: One Price per Ticket (one-time payment)

**Ready for Phase 1**: Data model design and API contracts.
