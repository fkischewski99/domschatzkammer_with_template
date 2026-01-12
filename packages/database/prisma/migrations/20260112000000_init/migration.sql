-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('system', 'member', 'api');

-- CreateEnum
CREATE TYPE "ContactRecord" AS ENUM ('person', 'company');

-- CreateEnum
CREATE TYPE "ContactStage" AS ENUM ('lead', 'qualified', 'opportunity', 'proposal', 'inNegotiation', 'lost', 'won');

-- CreateEnum
CREATE TYPE "ContactTaskStatus" AS ENUM ('open', 'completed');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('suggestion', 'problem', 'question');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('member', 'guide', 'admin');

-- CreateEnum
CREATE TYPE "WebhookTrigger" AS ENUM ('contactCreated', 'contactUpdated', 'contactDeleted');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'completed', 'refunded', 'cancelled');

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Account" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "description" VARCHAR(70) NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ApiKey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticatorApp" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accountName" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255) NOT NULL,
    "secret" VARCHAR(255) NOT NULL,
    "recoveryCodes" VARCHAR(1024) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_AuthenticatorApp" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeEmailRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ChangeEmailRequest" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "record" "ContactRecord" NOT NULL DEFAULT 'person',
    "image" VARCHAR(2048),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "address" VARCHAR(255),
    "phone" VARCHAR(32),
    "stage" "ContactStage" NOT NULL DEFAULT 'lead',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Contact" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactActivity" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "actorId" VARCHAR(255) NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_ContactActivity" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactComment" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "text" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ContactComment" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactImage" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "data" BYTEA,
    "contentType" VARCHAR(255),
    "hash" VARCHAR(64),

    CONSTRAINT "PK_ContactImage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactNote" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "text" VARCHAR(8000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ContactNote" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPageVisit" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_ContactPageVisit" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "id" UUID NOT NULL,
    "text" VARCHAR(128) NOT NULL,

    CONSTRAINT "PK_ContactTag" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTask" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(8000),
    "status" "ContactTaskStatus" NOT NULL DEFAULT 'open',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ContactTask" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PK_Favorite" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "category" "FeedbackCategory" NOT NULL DEFAULT 'suggestion',
    "message" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Feedback" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "token" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Invitation" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_Membership" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subject" VARCHAR(128),
    "content" VARCHAR(8000) NOT NULL,
    "link" VARCHAR(2000),
    "seenAt" TIMESTAMP(3),
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Notification" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Order" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION,
    "type" TEXT,
    "model" TEXT,

    CONSTRAINT "PK_OrderItem" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "logo" VARCHAR(2048),
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(32),
    "email" VARCHAR(255),
    "website" VARCHAR(2000),
    "linkedInProfile" VARCHAR(2000),
    "instagramProfile" VARCHAR(2000),
    "youTubeChannel" VARCHAR(2000),
    "xProfile" VARCHAR(2000),
    "tikTokProfile" VARCHAR(2000),
    "facebookPage" VARCHAR(2000),
    "billingCustomerId" TEXT,
    "stripeConnectAccountId" VARCHAR(255),
    "billingEmail" VARCHAR(255),
    "billingLine1" VARCHAR(255),
    "billingLine2" VARCHAR(255),
    "billingCountry" VARCHAR(3),
    "billingPostalCode" VARCHAR(16),
    "billingCity" VARCHAR(255),
    "billingState" VARCHAR(255),

    CONSTRAINT "PK_Organization" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationLogo" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "data" BYTEA,
    "contentType" VARCHAR(255),
    "hash" VARCHAR(64),

    CONSTRAINT "PK_OrganizationLogo" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetPasswordRequest" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ResetPasswordRequest" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Session" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" VARCHAR(64) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "provider" VARCHAR(32) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "currency" VARCHAR(3) NOT NULL,
    "periodStartsAt" TIMESTAMPTZ(6) NOT NULL,
    "periodEndsAt" TIMESTAMPTZ(6) NOT NULL,
    "trialStartsAt" TIMESTAMPTZ(6),
    "trialEndsAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Subscription" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION,
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL,
    "type" TEXT,
    "model" TEXT,

    CONSTRAINT "PK_SubscriptionItem" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "image" VARCHAR(2048),
    "name" VARCHAR(64) NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" VARCHAR(60),
    "lastLogin" TIMESTAMP(3),
    "phone" VARCHAR(32),
    "locale" VARCHAR(8) NOT NULL DEFAULT 'en-US',
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "enabledContactsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enabledInboxNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enabledWeeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "enabledNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "enabledProductUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_User" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "data" BYTEA,
    "contentType" VARCHAR(255),
    "hash" VARCHAR(64),

    CONSTRAINT "PK_UserImage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "url" VARCHAR(2000) NOT NULL,
    "triggers" "WebhookTrigger"[],
    "secret" VARCHAR(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Webhook" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkHours" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL DEFAULT 'sunday',

    CONSTRAINT "PK_WorkHours" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkTimeSlot" (
    "id" UUID NOT NULL,
    "workHoursId" UUID NOT NULL,
    "start" TIME(0) NOT NULL,
    "end" TIME(0) NOT NULL,

    CONSTRAINT "PK_WorkTimeSlot" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "postalCode" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PK_Location" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMPTZ(6) NOT NULL,
    "endTime" TIMESTAMPTZ(6) NOT NULL,
    "locationId" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "coverImage" VARCHAR(2048),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMPTZ(6),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PK_Event" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_ContactToContactTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ContactToContactTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "IX_Account_userId" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");

-- CreateIndex
CREATE INDEX "IX_ApiKey_organizationId" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthenticatorApp_userId_key" ON "AuthenticatorApp"("userId");

-- CreateIndex
CREATE INDEX "IX_AuthenticatorApp_userId" ON "AuthenticatorApp"("userId");

-- CreateIndex
CREATE INDEX "IX_ChangeEmailRequest_userId" ON "ChangeEmailRequest"("userId");

-- CreateIndex
CREATE INDEX "IX_Contact_organizationId" ON "Contact"("organizationId");

-- CreateIndex
CREATE INDEX "IX_ContactActivity_contactId" ON "ContactActivity"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactActivity_occurredAt" ON "ContactActivity"("occurredAt");

-- CreateIndex
CREATE INDEX "IX_ContactComment_contactId" ON "ContactComment"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactComment_userId" ON "ContactComment"("userId");

-- CreateIndex
CREATE INDEX "IX_ContactImage_contactId" ON "ContactImage"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactNote_contactId" ON "ContactNote"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactNote_userId" ON "ContactNote"("userId");

-- CreateIndex
CREATE INDEX "IX_ContactPageVisit_contactId" ON "ContactPageVisit"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactPageVisit_userId" ON "ContactPageVisit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTag_text_key" ON "ContactTag"("text");

-- CreateIndex
CREATE INDEX "IX_ContactTask_contactId" ON "ContactTask"("contactId");

-- CreateIndex
CREATE INDEX "IX_Favorite_userId" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "IX_Favorite_contactId" ON "Favorite"("contactId");

-- CreateIndex
CREATE INDEX "IX_Feedback_organizationId" ON "Feedback"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Feedback_userId" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "IX_Invitation_organizationId" ON "Invitation"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Invitation_token" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_organizationId_userId_key" ON "Membership"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "IX_Notification_userId" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "IX_Order_organizationId" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "IX_OrderItem_orderId" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeConnectAccountId_key" ON "Organization"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "IX_Organization_billingCustomerId" ON "Organization"("billingCustomerId");

-- CreateIndex
CREATE INDEX "IX_Organization_stripeConnectAccountId" ON "Organization"("stripeConnectAccountId");

-- CreateIndex
CREATE INDEX "IX_OrganizationLogo_organizationId" ON "OrganizationLogo"("organizationId");

-- CreateIndex
CREATE INDEX "IX_ResetPasswordRequest_email" ON "ResetPasswordRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "IX_Session_userId" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "IX_Subscription_organizationId" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "IX_SubscriptionItem_subscriptionId" ON "SubscriptionItem"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "IX_UserImage_userId" ON "UserImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "IX_Webhook_organizationId" ON "Webhook"("organizationId");

-- CreateIndex
CREATE INDEX "IX_WorkHours_organizationId" ON "WorkHours"("organizationId");

-- CreateIndex
CREATE INDEX "IX_WorkTimeSlot_workHoursId" ON "WorkTimeSlot"("workHoursId");

-- CreateIndex
CREATE INDEX "IX_Location_organizationId" ON "Location"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Location_org_active" ON "Location"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Event_ticketId_key" ON "Event"("ticketId");

-- CreateIndex
CREATE INDEX "IX_Event_organizationId" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Event_org_published" ON "Event"("organizationId", "isPublished");

-- CreateIndex
CREATE INDEX "IX_Event_org_startTime" ON "Event"("organizationId", "startTime");

-- CreateIndex
CREATE INDEX "IX_Event_locationId" ON "Event"("locationId");

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
CREATE INDEX "IX_Purchase_stripe_session" ON "Purchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "IX_Purchase_ticketId" ON "Purchase"("ticketId");

-- CreateIndex
CREATE INDEX "_ContactToContactTag_B_index" ON "_ContactToContactTag"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticatorApp" ADD CONSTRAINT "AuthenticatorApp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeEmailRequest" ADD CONSTRAINT "ChangeEmailRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactActivity" ADD CONSTRAINT "ContactActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactComment" ADD CONSTRAINT "ContactComment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactComment" ADD CONSTRAINT "ContactComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPageVisit" ADD CONSTRAINT "ContactPageVisit_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPageVisit" ADD CONSTRAINT "ContactPageVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTask" ADD CONSTRAINT "ContactTask_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkHours" ADD CONSTRAINT "WorkHours_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTimeSlot" ADD CONSTRAINT "WorkTimeSlot_workHoursId_fkey" FOREIGN KEY ("workHoursId") REFERENCES "WorkHours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToContactTag" ADD CONSTRAINT "_ContactToContactTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToContactTag" ADD CONSTRAINT "_ContactToContactTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ContactTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

