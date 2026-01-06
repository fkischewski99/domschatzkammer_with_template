-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'completed', 'refunded', 'cancelled');

-- CreateTable
CREATE TABLE "two_factor_bypass_codes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_bypass_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "features" JSONB NOT NULL DEFAULT '[]',
    "stock" INTEGER,
    "validFrom" TIMESTAMPTZ(6),
    "validUntil" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeProductId" VARCHAR(255),
    "stripePriceId" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PK_Ticket" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "customerName" VARCHAR(255),
    "customerPhone" VARCHAR(50),
    "userId" UUID,
    "ticketId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "stripeSessionId" VARCHAR(255) NOT NULL,
    "stripePaymentIntentId" VARCHAR(255),
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "qrCode" UUID NOT NULL,
    "invalidated" BOOLEAN NOT NULL DEFAULT false,
    "invalidatedAt" TIMESTAMPTZ(6),
    "invalidatedReason" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" TIMESTAMPTZ(6),
    "validatedBy" VARCHAR(255),
    "metadata" JSONB,
    "purchasedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PK_Purchase" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IX_TwoFactorBypassCode_code" ON "two_factor_bypass_codes"("code");

-- CreateIndex
CREATE INDEX "IX_TwoFactorBypassCode_userId" ON "two_factor_bypass_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_stripeProductId_key" ON "Ticket"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_stripePriceId_key" ON "Ticket"("stripePriceId");

-- CreateIndex
CREATE INDEX "IX_Ticket_org_active" ON "Ticket"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "IX_Ticket_stripe_product" ON "Ticket"("stripeProductId");

-- CreateIndex
CREATE INDEX "IX_Ticket_stripe_price" ON "Ticket"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeSessionId_key" ON "Purchase"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_qrCode_key" ON "Purchase"("qrCode");

-- CreateIndex
CREATE INDEX "IX_Purchase_org_status" ON "Purchase"("organizationId", "status");

-- CreateIndex
CREATE INDEX "IX_Purchase_user_status" ON "Purchase"("userId", "status");

-- CreateIndex
CREATE INDEX "IX_Purchase_email" ON "Purchase"("email");

-- CreateIndex
CREATE INDEX "IX_Purchase_qrcode" ON "Purchase"("qrCode");

-- CreateIndex
CREATE INDEX "IX_Purchase_ticket" ON "Purchase"("ticketId");

-- CreateIndex
CREATE INDEX "IX_Purchase_date" ON "Purchase"("purchasedAt");

-- CreateIndex
CREATE INDEX "IX_Purchase_stripe_session" ON "Purchase"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
