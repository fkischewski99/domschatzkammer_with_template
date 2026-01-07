# Tasks: Ticket Purchase System

**Input**: Design documents from `/specs/001-add-german-i18n/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and package structure

- [X] T001 Generate new package using turbo: pnpm turbo gen init (name: "tickets")
- [X] T002 Install dependencies for tickets package: @react-pdf/renderer@^4.2.0, qrcode@^1.5.4, @types/qrcode@^1.5.5
- [X] T003 [P] Install pg-boss@^11.1.0 in packages/billing/ for background job processing
- [X] T004 [P] Add src/ directory structure in packages/tickets/: pdf/, qr/, validation/
- [X] T005 [P] Configure package exports in packages/tickets/package.json for public API

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [X] T006 Add Ticket model to packages/database/prisma/schema.prisma with fields: id, organizationId, name, description, price, currency, features, stock, validFrom, validUntil, isActive, stripeProductId, stripePriceId, timestamps
- [X] T007 Add Purchase model to packages/database/prisma/schema.prisma with fields: id, email, customerName, customerPhone, userId, ticketId, organizationId, stripeSessionId, stripePaymentIntentId, status enum, totalAmount, currency, qrCode, invalidated, invalidatedAt, invalidatedReason, validated, validatedAt, validatedBy, metadata, purchasedAt, timestamps
- [X] T008 Add PurchaseStatus enum to packages/database/prisma/schema.prisma with values: PENDING, COMPLETED, REFUNDED, CANCELLED
- [X] T009 Add relations to Organization model: tickets Ticket[], purchases Purchase[]
- [X] T010 Add relation to User model: purchases Purchase[]
- [X] T011 Add indexes per data-model.md: idx_ticket_org_active, idx_ticket_stripe_product, idx_ticket_stripe_price, idx_purchase_org_status, idx_purchase_user_status, idx_purchase_email, idx_purchase_qrcode, idx_purchase_ticket, idx_purchase_date, idx_purchase_session
- [X] T012 Run Prisma migration: npx prisma migrate dev --name add-ticket-purchase-system (Note: Migrations already applied - schema validated and client generated)
- [X] T013 Generate Prisma client: npx prisma generate

### Core Package Infrastructure

- [X] T014 [P] Create packages/tickets/src/pdf/generate-ticket-pdf.ts with generateTicketPDF function using @react-pdf/renderer
- [X] T015 [P] Create packages/tickets/src/pdf/templates/ticket-template.tsx React PDF component
- [X] T016 [P] Create packages/tickets/src/qr/generate-qr-code.ts with generateQRCode function using qrcode library
- [X] T017 [P] Create packages/tickets/src/qr/encode-purchase-data.ts with QRCodePayload interface and deterministic encoding
- [X] T018 [P] Create packages/tickets/src/validation/validate-purchase.ts with business rule validation functions
- [X] T019 Create packages/tickets/src/index.ts exporting all public functions

### Email Templates

- [X] T020 [P] Add purchase-confirmation-email.tsx template to packages/email/src/templates/ following existing email template patterns
- [X] T021 [P] Add refund-confirmation-email.tsx template to packages/email/src/templates/ following existing email template patterns
- [X] T022 [P] Add send-purchase-confirmation-email.ts to packages/email/src/ extending existing email sending logic with PDF attachment support
- [X] T023 [P] Add send-refund-confirmation-email.ts to packages/email/src/ extending existing email sending logic
- [X] T024 Export new email functions in packages/email/package.json exports

### Background Job Queue Setup

- [X] T025 Create packages/billing/src/jobs/setup-pg-boss.ts with pg-boss initialization and configuration
- [X] T026 Create packages/billing/src/jobs/process-purchase.ts with enqueuePurchaseProcessing and processPurchase handlers
- [X] T027 Add job worker initialization in apps/dashboard/instrumentation.ts
- [X] T028 Add job queue cleanup on application shutdown

### Stripe Connect Setup

- [X] T029 Add stripeConnectedAccountId and connectAccountStatus fields to Organization model in packages/database/prisma/schema.prisma
- [X] T030 Add packages/billing/src/connect/create-connected-account.ts extending existing Stripe provider patterns for Express account creation
- [X] T031 Add packages/billing/src/connect/create-account-link.ts for onboarding flow redirect URLs
- [X] T032 Add apps/dashboard/app/api/billing/connect/onboard/route.ts endpoint following existing API route patterns
- [X] T033 Add apps/dashboard/app/api/billing/connect/refresh/route.ts for onboarding retry
- [X] T034 Add apps/dashboard/app/api/billing/connect/return/route.ts to handle successful onboarding completion

### Stripe Integration Extensions

- [X] T035 Add packages/billing/src/tickets/create-stripe-product.ts with createStripeProductForTicket function following existing data/ operation patterns
- [X] T036 Add packages/billing/src/tickets/create-checkout-session.ts extending existing Stripe checkout patterns with Connect payment_intent_data
- [X] T037 Extend packages/billing/src/webhook.ts to handle checkout.session.completed for ticket purchases with Connect transfers
- [ ] T038 Extend packages/billing/src/webhook.ts to handle account.updated events (track Connect account status) - DEFERRED (not critical for MVP)
- [X] T039 Export new billing functions in packages/billing/package.json exports

### Stripe Connect UI

- [X] T040 [P] Add apps/dashboard/actions/billing/setup-stripe-connect.ts server action following existing action patterns
- [X] T041 [P] Add apps/dashboard/components/billing/connect-account-status.tsx following existing component patterns
- [X] T042 [P] Extend apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/billing/page.tsx with Connect onboarding section
- [X] T043 Add connectAccountStatus enum to Organization model (pending, active, disabled, incomplete)

### i18n Translation Keys

- [X] T044 [P] Add ticket management translation keys to apps/dashboard/messages/en.json: tickets.create, tickets.edit, tickets.delete, tickets.active, tickets.inactive, tickets.soldOut, etc.
- [X] T045 [P] Add purchase management translation keys to apps/dashboard/messages/en.json: purchases.list, purchases.refund, etc.
- [X] T046 [P] Add analytics translation keys to apps/dashboard/messages/en.json: analytics.totalRevenue, analytics.ticketsSold, etc.
- [X] T047 [P] Add Stripe Connect translation keys to apps/dashboard/messages/en.json: billing.connectAccount, billing.onboardingPending, etc.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Anonymous Ticket Purchase (Priority: P1) 🎯 MVP

**Goal**: Enable frictionless ticket sales - customers purchase tickets with email only, receive PDF with QR code via email

**Independent Test**: Visit shop page → select ticket → complete Stripe checkout → receive PDF email

### Implementation for User Story 1

- [X] T048 [P] [US1] Create apps/dashboard/data/tickets/get-organization-tickets.ts to fetch active tickets for organization
- [X] T049 [P] [US1] Create apps/dashboard/data/tickets/get-ticket-by-id.ts for single ticket lookup
- [X] T050 [US1] Create apps/dashboard/actions/purchases/create-checkout-session.ts server action (already exists at actions/tickets/create-checkout-session.ts)
- [X] T051 [US1] Implement stock checking and atomic decrement logic in create-checkout-session.ts using Prisma transaction (already implemented)
- [X] T052 [US1] Implement Stripe Connect checkout with application_fee_amount in create-checkout-session.ts (already implemented)
- [X] T053 [US1] Create apps/dashboard/app/[locale]/organizations/[slug]/(organization)/tickets/page.tsx public ticket shop view
- [X] T054 [US1] Create apps/dashboard/components/tickets/ticket-card.tsx component showing name, description, price, features
- [X] T055 [US1] Create apps/dashboard/components/tickets/ticket-list.tsx component with grid layout
- [X] T056 [US1] Create apps/dashboard/components/purchases/purchase-checkout-form.tsx with email/name/phone fields
- [X] T057 [US1] Implement Stripe checkout redirect on form submission in purchase-checkout-form.tsx
- [X] T058 [US1] Add webhook handler in packages/billing/src/webhook.ts to process checkout.session.completed event (already implemented)
- [X] T059 [US1] Integrate PDF generation and email sending in webhook using background job queue (already implemented)
- [ ] T060 [US1] Add error logging for PDF generation failures using packages/tickets/src/validation/
- [ ] T061 [US1] Add error logging for email delivery failures in packages/email/

**Checkpoint**: Anonymous customers can purchase tickets and receive PDF via email

---

## Phase 4: User Story 2 - Admin Ticket Type Management (Priority: P1) 🎯 MVP

**Goal**: Enable admins to create, edit, activate/deactivate, and delete ticket types

**Independent Test**: Login as admin → create ticket type → edit → deactivate → verify removed from shop

### Implementation for User Story 2

- [X] T062 [P] [US2] Add apps/dashboard/actions/tickets/create-ticket.ts server action (already exists at actions/tickets/admin/create-ticket.ts)
- [X] T063 [P] [US2] Add apps/dashboard/actions/tickets/update-ticket.ts server action (already exists at actions/tickets/admin/update-ticket.ts)
- [X] T064 [P] [US2] Add apps/dashboard/actions/tickets/delete-ticket.ts (already exists at actions/tickets/admin/delete-ticket.ts)
- [X] T065 [P] [US2] Add apps/dashboard/actions/tickets/toggle-ticket-status.ts (functionality exists in update action)
- [X] T066 [US2] Integrate createStripeProductForTicket (already implemented in billing package)
- [X] T067 [US2] Add validation check for stripeConnectedAccountId (already implemented)
- [X] T068 [US2] Add apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/tickets/page.tsx
- [ ] T069 [US2] Add apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/tickets/create/page.tsx ticket creation form
- [ ] T070 [US2] Add apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/tickets/[ticketId]/page.tsx ticket edit view
- [ ] T071 [US2] Add apps/dashboard/components/tickets/ticket-form.tsx with fields: name, description, price, currency, features array, stock (optional), validFrom/Until (optional)
- [ ] T072 [US2] Add form validation using Zod schema (schemas already exist in admin actions)
- [ ] T073 [US2] Add delete prevention logic when purchases exist (already implemented)
- [ ] T074 [US2] Add revalidatePath calls after ticket mutations (already implemented in admin actions)
- [ ] T075 [US2] Add admin action logging for ticket operations (logging exists)

**Checkpoint**: Admins can fully manage ticket types, creating foundation for sales

---

## Phase 5: User Story 3 - Authenticated Ticket Purchase (Priority: P2)

**Goal**: Logged-in users purchase tickets with pre-filled email, tickets linked to account and appear in purchase history

**Independent Test**: Create account → login → purchase ticket → verify in purchase history dashboard

### Implementation for User Story 3

- [ ] T076 [P] [US3] Create apps/dashboard/data/purchases/get-user-purchases.ts to fetch purchases where userId matches
- [ ] T077 [US3] Modify apps/dashboard/actions/purchases/create-checkout-session.ts to include userId from session when authenticated
- [ ] T078 [US3] Create apps/dashboard/app/[locale]/organizations/[slug]/(organization)/purchases/page.tsx user purchase history view
- [ ] T079 [US3] Create apps/dashboard/components/purchases/purchase-list.tsx component with columns: date, ticket type, amount, status, download PDF
- [ ] T080 [US3] Add PDF regeneration endpoint in apps/dashboard/app/api/purchases/[purchaseId]/pdf/route.ts
- [ ] T081 [US3] Implement PDF download button in purchase-list.tsx calling regeneration endpoint
- [ ] T082 [US3] Pre-fill email field in purchase-checkout-form.tsx when user is authenticated using session data

**Checkpoint**: Authenticated users have seamless purchase experience with history tracking

---

## Phase 6: User Story 4 - Admin Purchase Management (Priority: P2)

**Goal**: Admins view all purchases, filter, view details, and process refunds

**Independent Test**: Login as admin → filter purchases → view details → process refund

### Implementation for User Story 4

- [X] T083 [P] [US4] Create apps/dashboard/data/purchases/get-organization-purchases.ts with filter parameters (dateRange, ticketId, status, email)
- [X] T084 [P] [US4] Create apps/dashboard/data/purchases/get-purchase-by-id.ts for detailed purchase view
- [X] T085 [P] [US4] Create apps/dashboard/actions/purchases/process-refund.ts (already exists at actions/tickets/admin/refund-purchase.ts)
- [ ] T086 [P] [US4] Create apps/dashboard/actions/purchases/resend-email.ts for manual email retry
- [X] T087 [US4] Create apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/purchases/page.tsx admin purchase list
- [ ] T088 [US4] Create apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/purchases/[purchaseId]/page.tsx purchase detail view
- [ ] T089 [US4] Create apps/dashboard/components/purchases/purchase-filters.tsx with date range, ticket type, status, email filters
- [ ] T090 [US4] Implement filter application in purchase list page updating query params
- [ ] T091 [US4] Create apps/dashboard/components/purchases/purchase-detail.tsx showing full customer info, ticket details, payment info, QR code display
- [ ] T092 [US4] Add refund button in purchase-detail.tsx with confirmation dialog
- [ ] T093 [US4] Implement refund flow: call process-refund.ts → update status to REFUNDED → set invalidated flag → send refund email
- [ ] T094 [US4] Add manual email resend button in purchase detail view
- [ ] T095 [US4] Add admin action logging for refunds and email resends

**Checkpoint**: Admins have full operational control over purchases

---

## Phase 7: User Story 5 - Manual Ticket Issuance (Priority: P3)

**Goal**: Admins manually issue complimentary tickets without payment

**Independent Test**: Login as admin → issue complimentary ticket → customer receives free PDF

### Implementation for User Story 5

- [ ] T096 [P] [US5] Create apps/dashboard/actions/purchases/issue-complimentary-ticket.ts server action with email and ticketId inputs
- [ ] T097 [US5] Implement purchase record creation with status COMPLETED, totalAmount 0, no Stripe session in issue-complimentary-ticket.ts
- [ ] T098 [US5] Generate QR code and enqueue email delivery for complimentary tickets
- [ ] T099 [US5] Modify purchase-confirmation-email.tsx template to show "Complimentary ticket issued by [Org Name]" when amount is 0
- [ ] T100 [US5] Create apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/purchases/issue/page.tsx issue ticket form
- [ ] T101 [US5] Create form component with email field and ticket type selector
- [ ] T102 [US5] Add "Issue Ticket" button in admin purchase list navigation
- [ ] T103 [US5] Add admin action logging for complimentary ticket issuance

**Checkpoint**: Admins can issue promotional and customer service tickets

---

## Phase 8: User Story 6 - Admin Analytics Dashboard (Priority: P3)

**Goal**: Admins view revenue, sales volume, ticket type breakdown, and timeline charts

**Independent Test**: Login as admin → view analytics → filter by date range → verify accurate metrics

### Implementation for User Story 6

- [ ] T104 [P] [US6] Create apps/dashboard/data/purchases/get-purchase-analytics.ts with aggregations: totalRevenue, ticketsSold, byTicketType, timeline
- [ ] T105 [US6] Implement Prisma groupBy queries for ticket type breakdown
- [ ] T106 [US6] Implement date range filtering in analytics queries (last 7/30/90 days, all time, custom)
- [ ] T107 [US6] Create apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/purchases/analytics/page.tsx analytics dashboard
- [ ] T108 [US6] Create apps/dashboard/components/purchases/analytics-dashboard.tsx with metric cards
- [ ] T109 [US6] Add chart library (e.g., recharts or tremor) to apps/dashboard/package.json
- [ ] T110 [US6] Create apps/dashboard/components/purchases/analytics-timeline-chart.tsx for purchase volume over time
- [ ] T111 [US6] Create apps/dashboard/components/purchases/analytics-ticket-breakdown.tsx for sales by ticket type
- [ ] T112 [US6] Add date range selector component
- [ ] T113 [US6] Implement client-side filter application updating analytics data
- [ ] T114 [US6] Add performance optimization: cache analytics for 5 minutes using React Cache or SWR

**Checkpoint**: Admins have business intelligence for strategic planning

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T115 [P] Add loading states and skeleton components for all async data fetching following existing UI patterns
- [ ] T116 [P] Add error boundaries in all new route pages following existing error handling patterns
- [ ] T117 [P] Add form validation error messages with i18n following existing validation patterns
- [ ] T118 [P] Add success toast notifications for all mutations following existing notification patterns
- [ ] T119 [P] Add optimistic UI updates for ticket status toggles
- [ ] T120 Add retry logic for background job failures (pg-boss exponential backoff)
- [ ] T121 Add purchase event logging following existing audit trail patterns
- [ ] T122 Extend existing monitoring package for email delivery failure alerts
- [ ] T123 Extend existing monitoring package for PDF generation performance tracking
- [ ] T124 Extend existing monitoring package for database query performance (analytics)
- [ ] T125 Add E2E test in e2e/ticket-purchase.spec.ts following existing Playwright test patterns
- [ ] T126 Add accessibility improvements following existing ARIA/a11y patterns
- [ ] T127 Ensure mobile responsive layouts using existing responsive design patterns
- [ ] T128 Add security headers for PDF download endpoints following existing security patterns
- [ ] T129 Run Lighthouse audit on ticket shop and purchase pages
- [ ] T130 Extend existing rate-limit package for ticket purchase endpoints
- [ ] T131 Verify CSRF protection on all server actions (should already exist via next-safe-action)
- [ ] T132 Update project documentation in README with ticket system setup instructions and Stripe Connect onboarding

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-9)**: All depend on Foundational phase completion
  - US1 + US2 (P1): Can start in parallel after Foundational - MVP core
  - US3 + US4 (P2): Can start in parallel after Foundational - Depend on US1/US2 conceptually but independently testable
  - US5 + US6 + US7 (P3): Can start in parallel after Foundational - Enhancement features
- **Polish (Phase 10)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Anonymous Purchase**: Depends on Foundational (T007-T038) - No dependencies on other stories
- **User Story 2 (P1) - Admin Ticket Management**: Depends on Foundational (T007-T038) - No dependencies on other stories
- **User Story 3 (P2) - Authenticated Purchase**: Depends on Foundational + conceptually extends US1, but independently testable
- **User Story 4 (P2) - Admin Purchase Management**: Depends on Foundational + conceptually manages purchases from US1/US3, but independently testable
- **User Story 5 (P3) - Manual Issuance**: Depends on Foundational + reuses purchase creation from US1
- **User Story 6 (P3) - Claim Purchases**: Depends on Foundational + extends US1 (anonymous purchases), but independently testable
- **User Story 7 (P3) - Analytics**: Depends on Foundational + analyzes purchases from US1/US3, but independently testable

### Within Each User Story

- Models before services (e.g., T007-T015 before T016-T021)
- Services before endpoints (e.g., T039-T040 before T041-T042)
- Core implementation before integration (e.g., T052-T055 before T056)
- Email templates before email sending logic (e.g., T022-T023 before T024-T025)

### Parallel Opportunities

**Setup Phase (Phase 1):**
- T002, T003, T004 (dependency installations) can run in parallel
- T005, T006 (configuration) can run in parallel after T001

**Foundational Phase (Phase 2):**
- Database schema tasks (T007-T013) must run sequentially, but T014-T015 run together
- Package tasks can run in parallel: T016-T021 (tickets package), T022-T026 (email), T027-T030 (jobs), T031-T035 (billing)
- i18n tasks (T036-T038) can run in parallel with each other and other foundational work

**User Story 1:**
- T039, T040 (data fetchers) can run in parallel
- T044, T045 (components) can run in parallel after T043

**User Story 2:**
- T052-T055 (server actions) can run in parallel with each other
- T057-T059 (pages) can run in parallel after actions are ready

**User Story 4:**
- T073-T077 (data operations and actions) can run in parallel
- T078-T079 (pages) can run in parallel after data layer ready

**User Story 7:**
- T108 (analytics query) can run independently
- T113-T115 (chart components) can run in parallel

**Polish Phase:**
- T119-T123 (UI improvements) can run in parallel
- T129 (E2E tests) can run independently
- T130-T133 (accessibility/performance) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all package infrastructure tasks in parallel after schema migration:

# Tickets package:
Task: "Create packages/tickets/src/pdf/generate-ticket-pdf.ts"
Task: "Create packages/tickets/src/pdf/templates/ticket-template.tsx"
Task: "Create packages/tickets/src/qr/generate-qr-code.ts"
Task: "Create packages/tickets/src/qr/encode-purchase-data.ts"
Task: "Create packages/tickets/src/validation/validate-purchase.ts"

# Email templates:
Task: "Create packages/email/src/templates/purchase-confirmation-email.tsx"
Task: "Create packages/email/src/templates/refund-confirmation-email.tsx"
Task: "Create packages/email/src/send-purchase-confirmation-email.ts"
Task: "Create packages/email/src/send-refund-confirmation-email.ts"

# i18n keys:
Task: "Add ticket management translation keys to apps/dashboard/messages/en.json"
Task: "Add purchase management translation keys to apps/dashboard/messages/en.json"
Task: "Add analytics translation keys to apps/dashboard/messages/en.json"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Anonymous Purchase)
4. Complete Phase 4: User Story 2 (Admin Ticket Management)
5. **STOP and VALIDATE**: Test both stories independently and together
6. Deploy/demo if ready

**MVP Delivers**: Complete ticket sales system - customers can buy, admins can manage tickets

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 + US2 → Test independently → Deploy/Demo (MVP! - ticket sales operational)
3. Add US3 → Test independently → Deploy/Demo (authenticated users get purchase history)
4. Add US4 → Test independently → Deploy/Demo (admins get full purchase management)
5. Add US5 → Test independently → Deploy/Demo (admins can issue complimentary tickets)
6. Add US6 → Test independently → Deploy/Demo (anonymous users can claim purchases)
7. Add US7 → Test independently → Deploy/Demo (admins get business analytics)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Anonymous Purchase)
   - Developer B: User Story 2 (Admin Ticket Management)
   - Wait for MVP validation
3. After MVP:
   - Developer A: User Story 3 + 6
   - Developer B: User Story 4 + 7
   - Developer C: User Story 5 + Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Background jobs (pg-boss) are critical for webhook reliability - don't skip T027-T030
- PDF generation MUST be deterministic - same QR code every time from stored purchase data
- All admin actions require role validation - use authOrganizationActionClient pattern
- Stripe integration extends existing patterns from packages/billing

## Checkpoint Validation (Self-Validation Strategy)

**Instead of stopping for manual review**, validate each checkpoint automatically:

### After Phase 2 (Foundational) - Database & Core Infrastructure
```bash
# Build check
pnpm --filter @achromatic/database build
pnpm --filter @achromatic/tickets build

# Type check
pnpm --filter @achromatic/database typecheck
pnpm --filter @achromatic/tickets typecheck

# Verify Prisma client generated
pnpm --filter @achromatic/database exec prisma validate

# Run any existing tests
pnpm --filter @achromatic/database test || echo "No tests yet"
pnpm --filter @achromatic/tickets test || echo "No tests yet"
```

### After Each User Story (Phases 3-8)
```bash
# Clean build of affected packages
pnpm --filter @achromatic/dashboard build
pnpm --filter @achromatic/tickets build
pnpm --filter @achromatic/billing build

# Type check
pnpm --filter @achromatic/dashboard typecheck
pnpm --filter @achromatic/tickets typecheck
pnpm --filter @achromatic/billing typecheck

# Playwright validation (using MCP)
# Launch sub-agent with playwright MCP to:
# - Navigate to the feature
# - Take screenshots
# - Verify key elements exist
# - Test basic user flows (e.g., ticket purchase, ticket creation)
# Example: "Test US1 anonymous purchase flow end-to-end"

# Run the development server (if not running)
pnpm dev

# Sub-agent validates with playwright:
# - mcp__playwright__browser_navigate to ticket shop
# - mcp__playwright__browser_snapshot to verify UI
# - mcp__playwright__browser_click to test interactions
# - mcp__playwright__browser_console_messages to check for errors
```

### After Phase 9 (Polish)
```bash
# Full build
pnpm build

# Full type check
pnpm typecheck

# End-to-end validation
# Sub-agent runs comprehensive Playwright tests:
# - All user stories (US1-US6)
# - Admin flows (ticket management, purchase management, analytics)
# - Edge cases (sold out tickets, refunds, etc.)
```

### Validation Criteria (Pass/Fail)

**Must Pass:**
- ✅ No TypeScript errors
- ✅ Clean build (no build errors)
- ✅ No console errors in browser
- ✅ Prisma schema validates
- ✅ Key UI elements render (verified via Playwright snapshot)

**Optional (best effort):**
- ⚠️ No console warnings (review but don't block)
- ⚠️ Lighthouse performance scores (informational)

### Using Task Tool for Validation

After completing a checkpoint phase, use the Task tool with subagent_type=Explore or general-purpose to:
1. Run build/typecheck commands
2. Launch Playwright MCP browser to verify UI
3. Take screenshots and verify no errors
4. Report validation results

Example prompt for Task tool:
```
Validate Phase 2 completion:
1. Run: pnpm --filter @achromatic/database typecheck
2. Run: pnpm --filter @achromatic/tickets typecheck
3. Verify Prisma client generated successfully
4. Report any errors or warnings
```

Example prompt for Playwright validation after US1:
```
Validate User Story 1 (Anonymous Purchase):
1. Start dev server if needed
2. Navigate to ticket shop page
3. Take snapshot to verify ticket listings render
4. Click on a ticket and verify checkout flow
5. Check console for errors
6. Report validation status
```
