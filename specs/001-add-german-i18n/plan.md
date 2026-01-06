# Implementation Plan: Ticket Purchase System

**Branch**: `001-add-german-i18n` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-german-i18n/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Transform the existing subscription-based billing system into a ticket purchase system where organizations can sell individual tickets to customers (with or without login). Customers receive PDF tickets with QR codes via email. Admins can manage ticket types, view purchases, process refunds, and issue complimentary tickets. The system will leverage existing Stripe integration, email infrastructure, and authentication system while adding new data models (Ticket, Purchase, ClaimToken) and admin interfaces.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with Next.js 16.0.10 (App Router), React 19.2.3
**Primary Dependencies**:
- Database: Prisma 6.19.0 with PostgreSQL + @prisma/adapter-pg
- Payments: Stripe 20.0.0 (existing billing package)
- Email: React Email 1.0.1 with Nodemailer 7.0.11 (existing email package)
- Auth: NextAuth.js 5.0.0-beta.30 with @auth/prisma-adapter
- Forms: react-hook-form 7.67.0 + Zod 4.1.13
- Server Actions: next-safe-action 8.0.11
- i18n: next-intl 4.6.1

**Storage**: PostgreSQL (managed via Prisma ORM)
**Testing**: Playwright 1.57.0 for E2E (no unit testing framework currently)
**Target Platform**: Web (Next.js SSR + React Server Components)
**Project Type**: Monorepo (Turborepo 2.6.1 + pnpm workspaces) with 3 apps: dashboard, marketing, public-api
**Performance Goals**:
- PDF generation + email delivery: <1 minute (95% of purchases)
- Purchase list loading: <2 seconds (100 purchases)
- Analytics dashboard: <3 seconds (10,000 purchases)
- Checkout flow: <2 minutes end-to-end

**Constraints**:
- Reuse existing email infrastructure (@workspace/email)
- Extend existing Stripe integration (@workspace/billing)
- Maintain organization multi-tenancy architecture
- PDF generated on-demand (no permanent storage)
- QR codes must be deterministic for consistent regeneration

**Scale/Scope**:
- Multi-organization SaaS platform
- Existing models: User, Organization, Membership, Subscription, Order
- New models: Ticket, Purchase, ClaimToken
- Dashboard app: Admin ticket management + purchase analytics
- Marketing app: Public ticket shop (future phase)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (with notes)

Since the project constitution is not yet defined (template placeholders), this check validates against general software engineering principles and existing project patterns:

### Architectural Consistency
- ✅ **Monorepo Structure**: Extends existing workspace packages (@workspace/billing, @workspace/email)
- ✅ **Separation of Concerns**: Data models (Prisma), business logic (packages), UI (apps)
- ✅ **Reuse over Reinvention**: Leverages existing Stripe integration, email system, auth

### Data Integrity
- ✅ **Schema Evolution**: New models (Ticket, Purchase, ClaimToken) don't conflict with existing (Organization, User)
- ✅ **Multi-tenancy Isolation**: Ticket/Purchase scoped to organizationId (matches existing pattern)
- ✅ **State Management**: Clear purchase states (pending→completed/cancelled, completed→refunded)

### Testing Strategy
- ⚠️ **E2E Only**: Project currently uses Playwright for E2E, no unit testing framework
  - **Impact**: Complex business logic (PDF generation, QR codes, refunds) should have unit tests
  - **Recommendation**: Consider adding Vitest for critical package logic (@workspace/tickets)
- ✅ **Contract Testing**: Stripe webhooks, email delivery can be E2E tested

### Security & Privacy
- ✅ **Authentication**: Reuses existing NextAuth.js for admin actions
- ✅ **Authorization**: Organization membership checks for admin features
- ✅ **PII Handling**: Email addresses handled per existing patterns
- ✅ **Token Security**: Claim tokens with 30-day expiration, single-use

### Performance
- ✅ **On-Demand Generation**: PDFs not stored, reduces storage costs
- ✅ **Database Indexing**: Will need indexes on organizationId, userId, qrCode, email
- ⚠️ **PDF Generation**: Synchronous generation in webhook might timeout
  - **Mitigation**: Use background job queue for PDF + email (to be researched in Phase 0)

### Complexity Management
- ✅ **No New External Services**: Uses existing Stripe, email provider
- ✅ **Standard Patterns**: Server Actions for mutations, data fetchers for queries
- ✅ **Incremental Migration**: Can coexist with existing subscription billing

**Proceed to Phase 0**: ✅ No blocking issues. Note performance concern for PDF generation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── database/
│   └── prisma/
│       └── schema.prisma           # Add: Ticket, Purchase, ClaimToken models
│
├── billing/                         # Extend existing package
│   ├── src/
│   │   ├── config.ts               # Modify: Remove subscription products, add ticket config
│   │   ├── provider/stripe/
│   │   │   └── index.ts            # Modify: Add ticket checkout methods
│   │   ├── webhook.ts              # Modify: Handle ticket purchase webhooks
│   │   └── data/
│   │       └── tickets.ts          # New: Ticket data operations
│   └── package.json
│
├── email/                           # Extend existing package
│   ├── src/
│   │   ├── templates/
│   │   │   ├── purchase-confirmation-email.tsx  # New: Ticket purchase email
│   │   │   └── refund-confirmation-email.tsx    # New: Refund email
│   │   ├── send-purchase-confirmation-email.ts  # New
│   │   └── send-refund-confirmation-email.ts    # New
│   └── package.json
│
└── tickets/                         # New package
    ├── src/
    │   ├── pdf/
    │   │   ├── generate-ticket-pdf.ts          # PDF generation logic
    │   │   └── templates/
    │   │       └── ticket-template.tsx          # React PDF template
    │   ├── qr/
    │   │   ├── generate-qr-code.ts             # QR code generation
    │   │   └── encode-purchase-data.ts         # Deterministic encoding
    │   └── validation/
    │       └── validate-purchase.ts            # Business rules
    └── package.json

apps/
├── dashboard/
│   ├── app/[locale]/
│   │   └── organizations/[slug]/(organization)/
│   │       ├── tickets/                        # New: Ticket shop preview
│   │       │   └── page.tsx
│   │       └── settings/organization/
│   │           ├── tickets/                    # New: Admin ticket management
│   │           │   ├── page.tsx               # List tickets
│   │           │   ├── create/page.tsx        # Create ticket
│   │           │   └── [ticketId]/
│   │           │       ├── page.tsx           # Edit ticket
│   │           │       └── analytics/page.tsx  # Ticket analytics
│   │           └── purchases/                  # New: Purchase management
│   │               ├── page.tsx               # List purchases
│   │               ├── [purchaseId]/page.tsx  # Purchase details
│   │               └── analytics/page.tsx      # Purchase analytics
│   ├── actions/
│   │   ├── tickets/                            # New: Ticket actions
│   │   │   ├── create-ticket.ts
│   │   │   ├── update-ticket.ts
│   │   │   ├── delete-ticket.ts
│   │   │   └── toggle-ticket-status.ts
│   │   └── purchases/                          # New: Purchase actions
│   │       ├── create-checkout-session.ts
│   │       ├── process-refund.ts
│   │       ├── issue-complimentary-ticket.ts
│   │       ├── claim-purchase.ts
│   │       └── resend-email.ts
│   ├── data/
│   │   ├── tickets/                            # New: Ticket data fetchers
│   │   │   ├── get-organization-tickets.ts
│   │   │   ├── get-ticket-by-id.ts
│   │   │   └── get-ticket-analytics.ts
│   │   └── purchases/                          # New: Purchase data fetchers
│   │       ├── get-organization-purchases.ts
│   │       ├── get-purchase-by-id.ts
│   │       ├── get-user-purchases.ts
│   │       └── get-purchase-analytics.ts
│   └── components/
│       ├── tickets/                            # New: Ticket UI components
│       │   ├── ticket-form.tsx
│       │   ├── ticket-list.tsx
│       │   └── ticket-card.tsx
│       └── purchases/                          # New: Purchase UI components
│           ├── purchase-list.tsx
│           ├── purchase-detail.tsx
│           ├── purchase-filters.tsx
│           └── analytics-dashboard.tsx
│
├── marketing/                                  # Future: Public ticket shop
│   └── app/[locale]/
│       └── shop/[orgSlug]/                    # Future phase
│           └── page.tsx
│
└── public-api/                                 # Future: API endpoints
    └── app/api/v1/
        └── tickets/                            # Future phase
            └── purchase/route.ts

e2e/
└── ticket-purchase.spec.ts                     # New: E2E tests
```

**Structure Decision**: Web application (Monorepo with Turborepo)

This feature extends the existing monorepo structure by:
1. **New Package**: `@workspace/tickets` for PDF/QR generation logic (reusable across apps)
2. **Extend Packages**: Modify `@workspace/billing` for ticket checkouts, `@workspace/email` for ticket emails
3. **Dashboard Routes**: Add admin UI in `/organizations/[slug]/settings/organization/tickets` and `/purchases`
4. **Future Phases**: Marketing shop and public API endpoints (not in current scope)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations requiring justification. The implementation follows existing architectural patterns and extends the current monorepo structure without introducing unnecessary complexity.
