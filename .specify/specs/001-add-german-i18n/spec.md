# Feature Specification: Ticket Purchase System

**Feature Branch**: `001-add-german-i18n`
**Created**: 2026-01-02
**Status**: Draft
**Input**: User description: "Organizations sell tickets to customers through a public-facing shop. Customers can purchase tickets with or without creating an account. After purchase, customers receive a PDF ticket with a QR code via email."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anonymous Ticket Purchase (Priority: P1)

A customer discovers an organization's ticket shop, browses available ticket types, selects a ticket, and completes checkout by providing only their email address. They receive a PDF ticket with a QR code via email immediately after payment.

**Why this priority**: This is the core value proposition - enabling frictionless ticket sales without forcing account creation. Removes the primary barrier to purchase (registration) and generates immediate revenue.

**Independent Test**: Can be fully tested by visiting the shop page, selecting a ticket, completing Stripe checkout with email only, and receiving a PDF ticket via email. Delivers immediate business value (revenue) without any other features.

**Acceptance Scenarios**:

1. **Given** a customer visits the organization's ticket shop, **When** they browse available tickets, **Then** they see all active ticket types with names, descriptions, prices, and features
2. **Given** a customer selects a ticket type, **When** they click "Purchase", **Then** they are prompted to enter their email address (required) and optionally name and phone number
3. **Given** a customer provides their email and proceeds to checkout, **When** they complete payment via Stripe, **Then** payment is processed successfully
4. **Given** payment is successful, **When** the transaction completes, **Then** a unique PDF ticket with QR code is generated and sent to the customer's email within 1 minute
5. **Given** a customer receives their ticket email, **When** they open the PDF attachment, **Then** they see organization branding, QR code, ticket details, purchase date, unique ticket number, and terms & conditions

---

### User Story 2 - Admin Ticket Type Management (Priority: P1)

An organization admin creates and manages ticket types for their organization. They can define ticket names, descriptions, pricing, features, stock limits, and validity periods. They can activate or deactivate tickets to control what's available for purchase.

**Why this priority**: Without the ability to create and manage ticket types, there's nothing for customers to purchase. This is a prerequisite for P1 customer purchases and enables the business to operate.

**Independent Test**: Can be fully tested by logging in as an organization admin, creating a new ticket type with all attributes, editing it, deactivating it, and verifying it no longer appears in the public shop. Delivers the foundation for revenue generation.

**Acceptance Scenarios**:

1. **Given** an admin is logged into the organization dashboard, **When** they navigate to ticket management, **Then** they see a list of all ticket types (active and inactive) with a "Create Ticket" button
2. **Given** an admin clicks "Create Ticket", **When** they fill in the form (name, description, price, currency, features list, optional stock limit, optional valid date range) and submit, **Then** a new ticket type is created and a corresponding Stripe product and price are generated
3. **Given** a ticket type exists, **When** an admin edits its name, description, or features and saves, **Then** the changes are reflected immediately in both admin view and public shop (for active tickets)
4. **Given** a ticket type exists, **When** an admin toggles its active status to inactive, **Then** the ticket disappears from the public shop but remains visible in admin view as inactive
5. **Given** a ticket type has no associated purchases, **When** an admin deletes it, **Then** the ticket is permanently removed and the Stripe product is archived

---

### User Story 3 - Authenticated Ticket Purchase (Priority: P2)

A registered user logs into their account, browses the ticket shop, and purchases a ticket. The ticket is automatically linked to their account, appears in their purchase history dashboard, and they receive the same PDF ticket via email.

**Why this priority**: Enhances user experience for repeat customers by providing purchase history and account management. Builds customer loyalty but is not essential for initial revenue generation.

**Independent Test**: Can be fully tested by creating a user account, logging in, purchasing a ticket, and verifying it appears in the account's purchase history dashboard. Delivers value to returning customers without requiring other features.

**Acceptance Scenarios**:

1. **Given** a user is logged into their account, **When** they visit the ticket shop, **Then** their email is pre-filled in the checkout form
2. **Given** a logged-in user completes a purchase, **When** payment succeeds, **Then** the purchase record is linked to their userId in the database
3. **Given** a user has purchased tickets while logged in, **When** they navigate to their account dashboard, **Then** they see a complete purchase history with ticket details, purchase dates, and download links for PDFs
4. **Given** a user views their purchase history, **When** they click a download link, **Then** the PDF ticket is regenerated or retrieved and downloaded to their device

---

### User Story 4 - Admin Purchase Management (Priority: P2)

An organization admin views all ticket purchases for their organization, filters by date range, ticket type, status, or customer email, and exports purchase data to CSV. They can view detailed purchase information and process refunds when necessary.

**Why this priority**: Essential for business operations, customer service, and financial reconciliation. Enables admins to handle customer issues and track revenue, but customers can still purchase tickets without this feature.

**Independent Test**: Can be fully tested by logging in as an admin after several purchases have been made, filtering the purchase list, exporting to CSV, viewing purchase details, and processing a test refund. Delivers operational value independently.

**Acceptance Scenarios**:

1. **Given** an admin is logged into the organization dashboard, **When** they navigate to purchase management, **Then** they see a table of all purchases with columns for date, customer email, ticket type, status, and amount
2. **Given** the admin is viewing the purchase list, **When** they apply filters (date range, ticket type, status, customer email), **Then** the table updates to show only matching purchases
3. **Given** the admin is viewing filtered or unfiltered purchases, **When** they click "Export to CSV", **Then** a CSV file downloads containing all visible purchase records with complete details
4. **Given** the admin clicks on a purchase row, **When** the purchase detail view opens, **Then** they see full customer information, ticket details, payment information, QR code, and PDF download link
5. **Given** the admin is viewing a purchase with status "completed", **When** they click "Refund" and confirm, **Then** a Stripe refund is processed, the purchase status changes to "refunded", and the QR code is invalidated

---

### User Story 5 - Manual Ticket Issuance (Priority: P3)

An organization admin manually issues complimentary tickets to customers without charging payment. They enter the customer's email, select a ticket type, mark it as complimentary, and the system generates and sends a PDF ticket.

**Why this priority**: Useful for promotions, partnerships, and customer service recovery, but not essential for core ticket sales. Adds flexibility for business operations.

**Independent Test**: Can be fully tested by logging in as an admin, using the "Issue Ticket" function, providing an email and ticket type, and verifying the customer receives a free ticket PDF. Delivers value for marketing and customer service scenarios.

**Acceptance Scenarios**:

1. **Given** an admin is in the purchase management section, **When** they click "Issue Ticket", **Then** a form appears prompting for customer email and ticket type selection
2. **Given** the admin fills in customer email and selects a ticket type, **When** they mark it as "complimentary" and submit, **Then** a purchase record is created with status "completed", amount 0, and a unique QR code is generated
3. **Given** a complimentary ticket is issued, **When** the system processes the issuance, **Then** a PDF ticket is generated and emailed to the customer within 1 minute with a note indicating it was issued by the organization

---

### User Story 6 - Anonymous Purchase Account Claiming (Priority: P3)

A customer who previously purchased a ticket anonymously (without an account) receives an email with a link to claim their ticket. They can create an account or log into an existing account, and the anonymous purchase is linked to their userId, appearing in their purchase history.

**Why this priority**: Enables post-purchase account creation for customers who want to manage their tickets later. Nice-to-have for user convenience but not critical for sales.

**Independent Test**: Can be fully tested by making an anonymous purchase, clicking the "claim ticket" link in the email, creating an account, and verifying the purchase appears in the new account's history. Delivers value for user retention and engagement.

**Acceptance Scenarios**:

1. **Given** a customer completes an anonymous purchase, **When** they receive the confirmation email, **Then** the email includes a "Claim this ticket to your account" link with a secure token
2. **Given** the customer clicks the claim link, **When** the claim page loads, **Then** they are prompted to either log in to an existing account or create a new account
3. **Given** the customer creates a new account or logs in, **When** they complete authentication, **Then** the purchase's userId is updated from null to their userId
4. **Given** the purchase is now claimed, **When** the customer views their account dashboard, **Then** the previously anonymous purchase appears in their purchase history
5. **Given** a purchase has been claimed, **When** the customer tries to use the claim link again, **Then** they see a message indicating the ticket has already been claimed

---

### User Story 7 - Admin Analytics Dashboard (Priority: P3)

An organization admin views analytics for their ticket sales including total revenue, tickets sold by type, purchase timeline chart, and conversion metrics. They can track business performance over time.

**Why this priority**: Valuable for business intelligence and strategic planning, but customers can purchase tickets and admins can manage sales without this feature. Enhances decision-making capabilities.

**Independent Test**: Can be fully tested by logging in as an admin after multiple purchases have been made, viewing the analytics dashboard, and verifying accurate revenue totals, ticket type breakdowns, and timeline charts. Delivers business insights independently.

**Acceptance Scenarios**:

1. **Given** an admin is logged into the organization dashboard, **When** they navigate to analytics, **Then** they see key metrics: total revenue, total tickets sold, and tickets sold per ticket type
2. **Given** the admin is viewing analytics, **When** the purchase timeline chart loads, **Then** it displays purchase volume over time with configurable date ranges (last 7 days, 30 days, 90 days, all time)
3. **Given** multiple ticket types exist with different sales volumes, **When** the admin views the "Tickets Sold by Type" breakdown, **Then** they see a chart or table showing quantity and revenue per ticket type
4. **Given** the admin is viewing analytics, **When** they select a custom date range, **Then** all metrics update to reflect only purchases within that date range

---

### Edge Cases

- **What happens when a customer tries to purchase a ticket that just sold out?** System checks stock availability at checkout initiation. If stock is depleted between selection and payment, the Stripe checkout session creation fails with an appropriate error message ("This ticket is sold out"). Customer is redirected back to the shop.

- **How does the system handle payment failures?** If Stripe payment fails during checkout, the customer is shown an error message and can retry. No purchase record is created or the purchase status remains "pending". If async payment fails after checkout (e.g., bank rejects), a webhook updates the purchase status to "cancelled" and no PDF is sent.

- **What happens if PDF generation or email delivery fails?** The purchase record is still created with status "completed" (payment succeeded), but the system logs the failure. A background job retries PDF generation and email delivery up to 3 times. Admins can manually trigger email resend from the purchase detail view.

- **What happens when a ticket has a valid date range and a customer tries to use it outside that range?** The PDF ticket displays the valid date range prominently. Future validation feature (out of current scope) will check the valid date range when scanning the QR code. For now, it's informational only.

- **How does the system handle duplicate email addresses across anonymous purchases?** Each purchase is independent. Multiple anonymous purchases can use the same email address, and each generates a unique QR code and PDF. The claim link allows the user to claim all purchases associated with their email.

- **What happens if an admin tries to delete a ticket type that has associated purchases?** The system prevents deletion and shows an error message: "Cannot delete ticket type with existing purchases. You can deactivate it instead." Only ticket types with zero purchases can be deleted.

- **What happens if a customer's email bounces?** The email service provider logs the bounce. The system doesn't automatically retry bounced emails, but the admin can view the purchase and manually resend the email to a corrected address.

- **What happens when an organization has no active tickets?** The public ticket shop displays a message: "No tickets available at this time. Please check back later."

- **How does the system handle refunds for complimentary tickets?** Complimentary tickets have amount 0, so there's no Stripe refund to process. The admin can still mark the purchase as "refunded" to invalidate the QR code.

- **What happens if a customer tries to claim a ticket that's already been claimed by another account?** Claim links are single-use. Once claimed, the link becomes invalid and attempting to use it again shows: "This ticket has already been claimed."

## Requirements *(mandatory)*

### Functional Requirements

#### Customer Purchase Flow
- **FR-001**: System MUST display all active ticket types for an organization on the public ticket shop page with name, description, price, currency, and features list
- **FR-002**: System MUST allow customers to select a ticket type and proceed to checkout without creating an account
- **FR-003**: System MUST collect customer email address (required) and optionally name and phone number during checkout
- **FR-004**: System MUST integrate with Stripe to process one-time payments securely
- **FR-005**: System MUST create a purchase record with status "pending" when checkout is initiated
- **FR-006**: System MUST update purchase status to "completed" when Stripe payment succeeds
- **FR-007**: System MUST update purchase status to "cancelled" when Stripe payment fails
- **FR-008**: System MUST generate a unique QR code for each completed purchase
- **FR-009**: System MUST generate a PDF ticket containing organization branding, QR code, ticket type name, purchase date, unique ticket number, customer information, valid dates (if applicable), and terms & conditions
- **FR-010**: System MUST send the PDF ticket as an email attachment to the customer's email address within 1 minute of successful payment
- **FR-011**: System MUST include a "claim ticket" link in the confirmation email for anonymous purchases
- **FR-012**: System MUST allow authenticated users to purchase tickets with their email pre-filled
- **FR-013**: System MUST link purchases to userId when the customer is logged in at purchase time
- **FR-014**: System MUST display purchase history in the user's account dashboard showing all tickets purchased while logged in

#### Ticket Type Management
- **FR-015**: System MUST allow organization admins to create new ticket types with: name, description, price, currency (default EUR), features list, optional stock limit, optional valid date range
- **FR-016**: System MUST create corresponding Stripe product and price when a ticket type is created
- **FR-017**: System MUST allow admins to edit ticket name, description, features, and active status
- **FR-018**: System MUST prevent editing of ticket price after creation (admin must create new ticket type for price changes)
- **FR-019**: System MUST allow admins to toggle ticket active/inactive status
- **FR-020**: System MUST hide inactive tickets from the public shop while keeping them visible in admin view
- **FR-021**: System MUST allow admins to delete ticket types only if they have zero associated purchases
- **FR-022**: System MUST prevent deletion and show error message if ticket type has existing purchases
- **FR-023**: System MUST enforce stock limits - prevent purchase when stock is 0 (if stock limit is set)
- **FR-024**: System MUST decrement stock count when a purchase is completed
- **FR-025**: System MUST support unlimited stock when stock limit is not set (null)

#### Purchase Management
- **FR-026**: System MUST display all purchases for an organization in admin purchase management view with columns: date, customer email, ticket type, status, amount
- **FR-027**: System MUST allow admins to filter purchases by: date range, ticket type, status, customer email
- **FR-028**: System MUST allow admins to export filtered or all purchase data to CSV format
- **FR-029**: System MUST allow admins to view detailed purchase information including full customer details, ticket details, payment information, QR code, and PDF download link
- **FR-030**: System MUST allow admins to process refunds for purchases with status "completed"
- **FR-031**: System MUST initiate Stripe refund when admin requests a refund
- **FR-032**: System MUST update purchase status to "refunded" when refund is successful
- **FR-033**: System MUST invalidate QR code when purchase is refunded
- **FR-034**: System MUST send refund confirmation email to customer when refund is processed
- **FR-035**: System MUST allow admins to manually issue complimentary tickets by entering customer email and selecting ticket type
- **FR-036**: System MUST create purchase record with status "completed", amount 0, and generate QR code for complimentary tickets
- **FR-037**: System MUST send PDF ticket via email for complimentary tickets with notation indicating it was issued by the organization

#### Anonymous Purchase Claiming
- **FR-038**: System MUST generate secure single-use claim token for each anonymous purchase
- **FR-039**: System MUST include claim link with token in anonymous purchase confirmation emails
- **FR-040**: System MUST allow customers to claim anonymous purchases by authenticating via the claim link
- **FR-041**: System MUST support both "create new account" and "log in to existing account" flows from claim page
- **FR-042**: System MUST update purchase userId from null to authenticated userId when claim is successful
- **FR-043**: System MUST invalidate claim token after successful claim
- **FR-044**: System MUST show "already claimed" message if claim token is reused
- **FR-045**: System MUST display claimed purchases in user's purchase history dashboard

#### Analytics
- **FR-046**: System MUST calculate and display total revenue for organization across all completed purchases
- **FR-047**: System MUST calculate and display total tickets sold (count)
- **FR-048**: System MUST calculate and display tickets sold by ticket type (count and revenue per type)
- **FR-049**: System MUST display purchase timeline chart showing volume over time
- **FR-050**: System MUST allow admins to select date ranges for analytics: last 7 days, 30 days, 90 days, all time, or custom range
- **FR-051**: System MUST update all analytics metrics when date range filter is applied

#### Multi-Organization Support
- **FR-052**: System MUST isolate ticket inventory per organization - each organization has independent ticket types
- **FR-053**: System MUST isolate purchase data per organization - admins can only view purchases for their organization
- **FR-054**: System MUST maintain organization memberships and roles (existing functionality)
- **FR-055**: System MUST support future role-based access control for roles like Domführer, Ticket Shop Manager, Analytics Viewer (infrastructure only, features out of scope)

#### Purchase States
- **FR-056**: System MUST support purchase status "pending" for payment initiated but not completed
- **FR-057**: System MUST support purchase status "completed" for successful payment and ticket delivered
- **FR-058**: System MUST support purchase status "refunded" for refunded purchases with invalidated tickets
- **FR-059**: System MUST support purchase status "cancelled" for payments that failed or were abandoned

#### Email Delivery
- **FR-060**: System MUST send purchase confirmation email immediately after successful payment
- **FR-061**: Email MUST include PDF ticket as attachment
- **FR-062**: Email MUST include purchase details: order ID, date, total amount, ticket type
- **FR-063**: Email MUST include organization contact information
- **FR-064**: Email for anonymous purchases MUST include claim link
- **FR-065**: System MUST send refund confirmation email when refund is processed
- **FR-066**: System MUST retry email delivery up to 3 times if initial send fails
- **FR-067**: System MUST log email delivery failures for admin review
- **FR-068**: System MUST allow admins to manually resend emails from purchase detail view

### Key Entities

- **Organization**: Represents the ticket seller. Has independent ticket inventory, pricing, and purchase data. Maintains memberships and roles for future features. Contains billing information (email, address) for invoicing.

- **Ticket**: Represents a ticket type/product created by an organization. Contains name, description, price, currency, features list, stock limit (optional), valid date range (optional), active status, and references to Stripe product/price IDs.

- **Purchase**: Represents a single ticket purchase transaction. Contains customer information (email, optional name/phone), userId (null for anonymous), ticket reference, organization reference, payment details (Stripe session ID, amount, currency), status (pending/completed/refunded/cancelled), unique QR code, PDF URL, validation status (for future feature), and timestamps.

- **User**: Represents a registered user account. Can be linked to multiple purchases. Contains authentication credentials, profile information, and purchase history.

- **Membership**: Links users to organizations with roles (Admin, Member, future roles like Domführer). Controls access to admin features within an organization.

- **Claim Token**: Represents a secure single-use token for claiming anonymous purchases. Contains purchase reference, token string, expiration timestamp, and used status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can complete an anonymous ticket purchase from shop browsing to payment confirmation in under 2 minutes
- **SC-002**: PDF tickets with QR codes are generated and delivered via email within 1 minute of successful payment for 95% of purchases
- **SC-003**: System achieves 95% successful payment completion rate (successful checkouts / initiated checkouts)
- **SC-004**: Zero duplicate ticket numbers or QR codes across all purchases
- **SC-005**: Organization admins can create a new ticket type from start to finish in under 1 minute
- **SC-006**: 100% of purchase status transitions (pending → completed/cancelled, completed → refunded) are accurately reflected in the database and admin views
- **SC-007**: Purchase history dashboard loads and displays all user tickets in under 2 seconds for users with up to 100 purchases
- **SC-008**: Analytics dashboard loads and displays metrics in under 3 seconds for organizations with up to 10,000 purchases
- **SC-009**: Email delivery success rate of at least 98% (successful deliveries / total attempts) excluding bounces due to invalid email addresses
- **SC-010**: Stock enforcement prevents overselling - 0 purchases allowed when ticket stock reaches 0
- **SC-011**: Refund processing completes (Stripe refund + status update + QR invalidation + email sent) within 30 seconds of admin confirmation
- **SC-012**: Anonymous purchase claiming flow completes in under 3 minutes from clicking claim link to seeing ticket in account dashboard
