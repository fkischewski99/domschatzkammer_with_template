-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "stripeConnectAccountId" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeConnectAccountId_key" ON "Organization"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "IX_Organization_stripeConnectAccountId" ON "Organization"("stripeConnectAccountId");

