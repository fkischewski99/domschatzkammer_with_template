# Data Model: Ticket Purchase System

**Date**: 2026-01-02
**Feature**: Ticket Purchase System
**Phase**: 1 - Design

## Overview

This document defines the complete data model for the ticket purchase system, including Prisma schema definitions, relationships, validation rules, and state transitions.

## Entity Relationship Diagram

```
Organization (existing)
    ├── 1:N → Ticket (new)
    ├── 1:N → Purchase (new)
    └── 1:N → Membership (existing)

User (existing)
    ├── 1:N → Purchase (new, optional)
    └── 1:N → Membership (existing)

Ticket (new)
    └── 1:N → Purchase (new)

Purchase (new)
    ├── N:1 → Organization
    ├── N:1 → User (optional, null for anonymous)
    └── N:1 → Ticket
```

## Prisma Schema Definitions

### New Model: Ticket

Represents a ticket type/product that organizations can sell.

```prisma
model Ticket {
  id             String    @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Ticket attributes
  name           String    @db.VarChar(255)
  description    String?   @db.Text
  price          Decimal   @db.Decimal(10, 2)  // Max: 99,999,999.99
  currency       String    @default("EUR") @db.VarChar(3)
  features       Json      @default("[]") @db.JsonB  // string[]

  // Stock management
  stock          Int?      // null = unlimited stock

  // Validity period
  validFrom      DateTime?
  validUntil     DateTime?

  // Status
  isActive       Boolean   @default(true)

  // Stripe integration
  stripeProductId String?  @unique @db.VarChar(255)
  stripePriceId   String?  @unique @db.VarChar(255)

  // Relations
  purchases      Purchase[]

  // Timestamps
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Indexes
  @@index([organizationId, isActive], name: "idx_ticket_org_active")
  @@index([stripeProductId], name: "idx_ticket_stripe_product")
  @@index([stripePriceId], name: "idx_ticket_stripe_price")
}
```

**Validation Rules**:
- `name`: Required, 1-255 characters
- `description`: Optional, max 10,000 characters
- `price`: Required, ≥ 0, max 2 decimal places
- `currency`: Required, 3-char ISO code (USD, EUR, GBP, etc.)
- `features`: Array of strings, max 20 features
- `stock`: Optional integer ≥ 0, null = unlimited
- `validFrom`/`validUntil`: Optional, validUntil must be after validFrom
- `stripeProductId`/`stripePriceId`: Set after Stripe product/price creation

**Business Rules**:
- Cannot delete if `purchases.count > 0`
- Cannot change `price` after creation (must create new ticket)
- `stock` decrements atomically on purchase
- Inactive tickets hidden from public shop but visible in admin

---

### New Model: Purchase

Represents a single ticket purchase transaction.

```prisma
model Purchase {
  id                    String    @id @default(cuid())

  // Customer information
  email                 String    @db.VarChar(255)
  customerName          String?   @db.VarChar(255)
  customerPhone         String?   @db.VarChar(50)
  userId                String?   // null for anonymous purchases
  user                  User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Purchase details
  ticketId              String
  ticket                Ticket    @relation(fields: [ticketId], references: [id], onDelete: Restrict)
  organizationId        String    // Denormalized for fast queries
  organization          Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Payment information
  stripeSessionId       String    @unique @db.VarChar(255)
  stripePaymentIntentId String?   @db.VarChar(255)
  status                PurchaseStatus @default(PENDING)
  totalAmount           Decimal   @db.Decimal(10, 2)
  currency              String    @db.VarChar(3)

  // Ticket delivery
  qrCode                String    @unique @default(uuid()) @db.VarChar(36)

  // Invalidation
  invalidated           Boolean   @default(false)
  invalidatedAt         DateTime?
  invalidatedReason     String?   @db.Text  // For auditing

  // Validation (future feature - Domführer role)
  validated             Boolean   @default(false)
  validatedAt           DateTime?
  validatedBy           String?   @db.VarChar(255)  // UserId of validator

  // Metadata
  metadata              Json?     @db.JsonB  // Extensible for future fields

  // Timestamps
  purchasedAt           DateTime  @default(now())
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Indexes
  @@index([organizationId, status], name: "idx_purchase_org_status")
  @@index([userId, status], name: "idx_purchase_user_status")
  @@index([email], name: "idx_purchase_email")
  @@index([qrCode], name: "idx_purchase_qrcode")
  @@index([ticketId], name: "idx_purchase_ticket")
  @@index([purchasedAt], name: "idx_purchase_date")
  @@index([stripeSessionId], name: "idx_purchase_stripe_session")
}

enum PurchaseStatus {
  PENDING    // Checkout initiated but not completed
  COMPLETED  // Payment successful, ticket delivered
  REFUNDED   // Purchase refunded, ticket invalidated
  CANCELLED  // Payment failed or abandoned
}
```

**Validation Rules**:
- `email`: Required, valid email format, max 255 chars
- `customerName`: Optional, max 255 chars
- `customerPhone`: Optional, max 50 chars (E.164 format recommended)
- `userId`: Optional (null for anonymous), must exist in User table
- `totalAmount`: Required, ≥ 0, matches ticket price at purchase time
- `currency`: Required, 3-char ISO code, matches ticket currency
- `qrCode`: Auto-generated UUID, must be globally unique
- `status`: Required, one of enum values
- `invalidatedReason`: Optional, required when `invalidated = true`

**State Transitions**:
```
PENDING → COMPLETED  (Stripe payment succeeds)
PENDING → CANCELLED  (Stripe payment fails or times out)
COMPLETED → REFUNDED (Admin processes refund)
```

**Business Rules**:
- `qrCode` generated on purchase creation (deterministic UUID)
- `organizationId` denormalized from `ticket.organizationId` for query performance
- `totalAmount` and `currency` snapshot ticket price at purchase time
- `invalidated = true` when refunded, sets `invalidatedAt` and `invalidatedReason`
- PDF generated on-demand from purchase data (not stored)

---

### Modified Model: Organization

Add relationship to new models.

```prisma
model Organization {
  // ... existing fields ...

  // New relations
  tickets         Ticket[]
  purchases       Purchase[]

  // ... existing relations ...
}
```

---

### Modified Model: User

Add relationship to purchases.

```prisma
model User {
  // ... existing fields ...

  // New relation
  purchases       Purchase[]

  // ... existing relations ...
}
```

---

## Field Specifications

### Currency Codes

**Supported Currencies** (ISO 4217):
- `EUR` - Euro (default)
- `USD` - US Dollar
- `GBP` - British Pound
- `CHF` - Swiss Franc
- `DKK` - Danish Krone
- `SEK` - Swedish Krona
- `NOK` - Norwegian Krone

**Storage**: 3-character uppercase string (`@db.VarChar(3)`)

---

### JSON Fields

#### Ticket.features

**Type**: `string[]`

**Example**:
```json
[
  "Access to main cathedral",
  "Audio guide included",
  "Skip-the-line entry",
  "Photography allowed"
]
```

**Validation**:
- Array of strings
- Max 20 items
- Each item max 255 characters
- No duplicates

---

#### Purchase.metadata

**Type**: `{ [key: string]: any }`

**Example**:
```json
{
  "source": "web",
  "referrer": "google-ads",
  "utmCampaign": "summer-2026",
  "notes": "Group booking",
  "customField1": "value"
}
```

**Purpose**: Extensible storage for analytics, marketing tracking, custom fields

**Validation**:
- Valid JSON object
- Max size: 10 KB
- No nested objects > 3 levels deep

---

### Decimal Precision

**All monetary fields**: `@db.Decimal(10, 2)`
- **Precision**: 10 digits total
- **Scale**: 2 decimal places
- **Range**: -99,999,999.99 to 99,999,999.99
- **Storage**: Fixed-point arithmetic (no floating-point errors)

**Example values**:
```typescript
price: 24.99
totalAmount: 199.00
revenue: 12345.67
```

---

## Indexes Strategy

### Ticket Indexes

1. **`idx_ticket_org_active`**: `(organizationId, isActive)`
   - **Query**: List active tickets for organization
   - **Frequency**: High (public shop, admin dashboard)

2. **`idx_ticket_stripe_product`**: `(stripeProductId)`
   - **Query**: Lookup ticket by Stripe product ID (webhooks)
   - **Frequency**: Medium (Stripe events)

3. **`idx_ticket_stripe_price`**: `(stripePriceId)`
   - **Query**: Lookup ticket by Stripe price ID (checkout)
   - **Frequency**: Medium (purchase flow)

---

### Purchase Indexes

1. **`idx_purchase_org_status`**: `(organizationId, status)`
   - **Query**: List purchases per organization (admin view)
   - **Frequency**: High (admin dashboard, analytics)

2. **`idx_purchase_user_status`**: `(userId, status)`
   - **Query**: User purchase history
   - **Frequency**: Medium (user dashboard)

3. **`idx_purchase_email`**: `(email)`
   - **Query**: Find purchases by email (claim all, support)
   - **Frequency**: Low-medium (claim flow, support queries)

4. **`idx_purchase_qrcode`**: `(qrCode)`
   - **Query**: Validate QR code (future feature)
   - **Frequency**: High (future - Domführer scanning)

5. **`idx_purchase_ticket`**: `(ticketId)`
   - **Query**: Analytics - tickets sold per type
   - **Frequency**: Medium (analytics dashboard)

6. **`idx_purchase_date`**: `(purchasedAt)`
   - **Query**: Analytics - purchases over time
   - **Frequency**: High (analytics dashboard)

7. **`idx_purchase_stripe_session`**: `(stripeSessionId)`
   - **Query**: Webhook lookup by Stripe session
   - **Frequency**: High (Stripe webhooks)

---

## Data Integrity Constraints

### Foreign Key Cascades

**Ticket**:
- `ON DELETE Cascade` from Organization → Tickets deleted when org deleted
- `ON DELETE Restrict` from Ticket → Purchases prevent ticket deletion

**Purchase**:
- `ON DELETE SetNull` from User → Purchases remain if user deleted (preserve revenue data)
- `ON DELETE Cascade` from Organization → Purchases deleted with org (GDPR compliance)
- `ON DELETE Restrict` from Ticket → Cannot delete ticket with purchases

---

### Unique Constraints

1. `Ticket.stripeProductId` - Unique (1:1 mapping)
2. `Ticket.stripePriceId` - Unique (1:1 mapping)
3. `Purchase.stripeSessionId` - Unique (prevent duplicate processing)
4. `Purchase.qrCode` - Unique (globally unique QR codes)

---

## Migration Scripts

### Initial Migration

```sql
-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for purchase status
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED');

-- Create Ticket table
CREATE TABLE "Ticket" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
  "features" JSONB NOT NULL DEFAULT '[]',
  "stock" INTEGER,
  "validFrom" TIMESTAMP(3),
  "validUntil" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "stripeProductId" VARCHAR(255) UNIQUE,
  "stripePriceId" VARCHAR(255) UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create Purchase table
CREATE TABLE "Purchase" (
  "id" TEXT PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL,
  "customerName" VARCHAR(255),
  "customerPhone" VARCHAR(50),
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "ticketId" TEXT NOT NULL REFERENCES "Ticket"("id") ON DELETE RESTRICT,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "stripeSessionId" VARCHAR(255) UNIQUE NOT NULL,
  "stripePaymentIntentId" VARCHAR(255),
  "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "qrCode" VARCHAR(36) UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  "invalidated" BOOLEAN NOT NULL DEFAULT false,
  "invalidatedAt" TIMESTAMP(3),
  "invalidatedReason" TEXT,
  "validated" BOOLEAN NOT NULL DEFAULT false,
  "validatedAt" TIMESTAMP(3),
  "validatedBy" VARCHAR(255),
  "metadata" JSONB,
  "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes
CREATE INDEX "idx_ticket_org_active" ON "Ticket"("organizationId", "isActive");
CREATE INDEX "idx_ticket_stripe_product" ON "Ticket"("stripeProductId");
CREATE INDEX "idx_ticket_stripe_price" ON "Ticket"("stripePriceId");

CREATE INDEX "idx_purchase_org_status" ON "Purchase"("organizationId", "status");
CREATE INDEX "idx_purchase_user_status" ON "Purchase"("userId", "status");
CREATE INDEX "idx_purchase_email" ON "Purchase"("email");
CREATE INDEX "idx_purchase_qrcode" ON "Purchase"("qrCode");
CREATE INDEX "idx_purchase_ticket" ON "Purchase"("ticketId");
CREATE INDEX "idx_purchase_date" ON "Purchase"("purchasedAt");
CREATE INDEX "idx_purchase_stripe_session" ON "Purchase"("stripeSessionId");
```

---

## Seed Data (Development)

```typescript
// prisma/seed.ts
import { PrismaClient, PurchaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTickets() {
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error('No organization found');

  // Create sample tickets
  const standardTour = await prisma.ticket.create({
    data: {
      organizationId: org.id,
      name: 'Standard Cathedral Tour',
      description: 'Guided tour of the cathedral with audio guide included',
      price: 24.99,
      currency: 'EUR',
      features: [
        'Access to main cathedral',
        'Audio guide included',
        'Duration: 60 minutes',
        'Available in 6 languages'
      ],
      stock: 100,
      isActive: true
    }
  });

  const vipTour = await prisma.ticket.create({
    data: {
      organizationId: org.id,
      name: 'VIP Premium Experience',
      description: 'Exclusive private tour with cathedral historian',
      price: 99.00,
      currency: 'EUR',
      features: [
        'Private guide (historian)',
        'Access to restricted areas',
        'Duration: 120 minutes',
        'Complimentary refreshments',
        'Photography allowed'
      ],
      stock: 10,
      isActive: true
    }
  });

  console.log('Seeded tickets:', { standardTour, vipTour });
}

seedTickets()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Query Examples

### Fetch Active Tickets for Organization

```typescript
const tickets = await prisma.ticket.findMany({
  where: {
    organizationId: orgId,
    isActive: true,
    OR: [
      { stock: null },          // Unlimited stock
      { stock: { gt: 0 } }      // Available stock
    ]
  },
  orderBy: { createdAt: 'desc' }
});
```

---

### Create Purchase with Atomic Stock Decrement

```typescript
await prisma.$transaction(async (tx) => {
  // Check and decrement stock atomically
  const ticket = await tx.ticket.update({
    where: {
      id: ticketId,
      OR: [
        { stock: null },
        { stock: { gt: 0 } }
      ]
    },
    data: {
      stock: { decrement: 1 }
    }
  });

  // Create purchase
  const purchase = await tx.purchase.create({
    data: {
      email,
      ticketId,
      organizationId: ticket.organizationId,
      stripeSessionId,
      totalAmount: ticket.price,
      currency: ticket.currency,
      status: 'PENDING'
    }
  });

  return purchase;
});
```

---

### Analytics: Revenue by Ticket Type

```typescript
const analytics = await prisma.purchase.groupBy({
  by: ['ticketId'],
  where: {
    organizationId: orgId,
    status: 'COMPLETED',
    purchasedAt: {
      gte: new Date('2026-01-01'),
      lte: new Date('2026-12-31')
    }
  },
  _count: { id: true },
  _sum: { totalAmount: true }
});
```

---

## Performance Considerations

### Expected Data Volumes (per Organization)

- **Tickets**: 10-50 active types
- **Purchases**: 100-10,000 per year

### Query Performance Targets

- **Ticket list**: <100ms (indexed on organizationId + isActive)
- **Purchase list**: <500ms for 1,000 records (indexed on organizationId + status)
- **Analytics aggregation**: <3s for 10,000 records (indexed on purchasedAt)
- **QR validation**: <50ms (indexed on qrCode)

### Optimization Strategies

1. **Denormalization**: `organizationId` in Purchase for direct filtering
2. **Composite Indexes**: Multi-column indexes for common query patterns
3. **Partial Indexes**: Consider `WHERE isActive = true` for Ticket queries
4. **Connection Pooling**: Prisma connection pool (already configured)

---

## Security Considerations

### PII Fields

**Purchase table contains PII**:
- `email` - Customer email address
- `customerName` - Customer full name
- `customerPhone` - Customer phone number

**Compliance Requirements**:
- GDPR: Right to erasure (delete purchase or anonymize)
- Data retention: Define policy (e.g., 7 years for tax records)
- Encryption at rest: PostgreSQL TDE or application-level encryption

### Token Security

**Purchase.qrCode**:
- UUID v4 (globally unique, non-guessable)
- Cannot be enumerated
- Validated against database (not self-contained)

---

## Future Enhancements

### Potential Schema Additions

1. **Multi-Language Support**:
   ```prisma
   model TicketTranslation {
     id       String @id
     ticketId String
     language String @db.VarChar(5)  // "en", "de", "fr"
     name     String
     description String?
     @@unique([ticketId, language])
   }
   ```

2. **Ticket Bundles**:
   ```prisma
   model TicketBundle {
     id           String @id
     name         String
     tickets      TicketBundleItem[]
     discountPercent Decimal
   }
   ```

3. **Audit Log**:
   ```prisma
   model PurchaseAuditLog {
     id           String @id
     purchaseId   String
     action       String  // "created", "refunded", "validated"
     actorUserId  String?
     timestamp    DateTime
     metadata     Json
   }
   ```

---

## Summary

**New Tables**: 2 (Ticket, Purchase)
**Modified Tables**: 2 (Organization, User - relations only)
**Total Indexes**: 10 (optimized for query patterns)
**Total Fields**: 37 across new models

**Ready for**: API contract generation and implementation.
