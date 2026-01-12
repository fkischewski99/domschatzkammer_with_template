# Events & Locations System Implementation Plan

## Overview
Add event-based ticket sales with calendar view and location management to the existing ticket system.

**Key Decisions:**
- 1:1 Event-Ticket relationship (Event owns Ticket)
- Physical locations only
- Weekly calendar + list view
- One location per event

---

## Phase 1: Database Schema

### New Models in `packages/database/prisma/schema.prisma`

```prisma
model Location {
  id             String       @id(map: "PK_Location") @default(uuid()) @db.Uuid
  organizationId String       @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name           String       @db.VarChar(255)
  description    String?      @db.Text
  address        String       @db.VarChar(500)
  city           String       @db.VarChar(255)
  postalCode     String?      @db.VarChar(20)
  isActive       Boolean      @default(true)

  events         Event[]      // Required by Prisma, not loaded by default

  createdAt      DateTime     @default(now()) @db.Timestamptz(6)
  updatedAt      DateTime     @updatedAt @db.Timestamptz(6)

  @@index([organizationId], map: "IX_Location_organizationId")
  @@index([organizationId, isActive], map: "IX_Location_org_active")
}

model Event {
  id             String       @id(map: "PK_Event") @default(uuid()) @db.Uuid
  organizationId String       @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name           String       @db.VarChar(255)
  description    String?      @db.Text
  startTime      DateTime     @db.Timestamptz(6)
  endTime        DateTime     @db.Timestamptz(6)

  locationId     String       @db.Uuid
  location       Location     @relation(fields: [locationId], references: [id], onDelete: Restrict)

  ticketId       String       @unique @db.Uuid
  ticket         Ticket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  coverImage     String?      @db.VarChar(2048)
  isPublished    Boolean      @default(false)
  isCancelled    Boolean      @default(false)
  cancelledAt    DateTime?    @db.Timestamptz(6)
  cancelReason   String?      @db.Text

  createdAt      DateTime     @default(now()) @db.Timestamptz(6)
  updatedAt      DateTime     @updatedAt @db.Timestamptz(6)

  @@index([organizationId], map: "IX_Event_organizationId")
  @@index([organizationId, isPublished], map: "IX_Event_org_published")
  @@index([organizationId, startTime], map: "IX_Event_org_startTime")
  @@index([locationId], map: "IX_Event_locationId")
}
```

**Also update:**
- `Organization` model: add `locations Location[]` and `events Event[]`
- `Ticket` model: add `event Event?` back-reference

**Note on Location-Event relationship:**
Prisma requires defining both sides of a relation, so Location will have `events Event[]` in the schema. However:
- This is just a type definition, not data storage (the FK lives on Event)
- When querying locations, events are NOT loaded unless explicitly included
- To get events for a location, query: `prisma.event.findMany({ where: { locationId } })`

**Run migration:**
```bash
pnpm --filter @workspace/database migrate dev --name add_events_locations
```

---

## Phase 2: Location Management

### Files to Create

**Schemas:**
- `apps/dashboard/schemas/locations/location-schema.ts`

**Data:**
- `apps/dashboard/data/locations/get-organization-locations.ts`
- `apps/dashboard/data/locations/get-location-by-id.ts`

**Actions:**
- `apps/dashboard/actions/locations/admin/create-location.ts`
- `apps/dashboard/actions/locations/admin/update-location.ts`
- `apps/dashboard/actions/locations/admin/delete-location.ts`

**Components:**
- `apps/dashboard/components/locations/location-form.tsx`
- `apps/dashboard/components/locations/location-select.tsx`
- `apps/dashboard/components/organizations/slug/settings/organization/locations/location-management.tsx`

**Routes:**
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/locations/page.tsx`
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/locations/layout.tsx`
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/locations/create/page.tsx`
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/settings/organization/locations/[locationId]/page.tsx`

---

## Phase 3: Event Management

### Files to Create

**Schemas:**
- `apps/dashboard/schemas/events/event-schema.ts`
- `apps/dashboard/schemas/events/cancel-event-schema.ts`

**Data:**
- `apps/dashboard/data/events/get-organization-events.ts`
- `apps/dashboard/data/events/get-event-by-id.ts`
- `apps/dashboard/data/events/get-events-for-week.ts`

**Actions:**
- `apps/dashboard/actions/events/admin/create-event.ts` (creates Event + Ticket + Stripe product)
- `apps/dashboard/actions/events/admin/update-event.ts`
- `apps/dashboard/actions/events/admin/delete-event.ts`
- `apps/dashboard/actions/events/admin/publish-event.ts`
- `apps/dashboard/actions/events/admin/cancel-event.ts`

**Components:**
- `apps/dashboard/components/events/event-form.tsx`
- `apps/dashboard/components/events/event-card.tsx`
- `apps/dashboard/components/events/event-list.tsx`
- `apps/dashboard/components/events/cancel-event-modal.tsx`
- `apps/dashboard/components/organizations/slug/settings/organization/events/event-management.tsx`

**Routes:**
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/page.tsx` (calendar + list)
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/layout.tsx`
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/create/page.tsx`
- `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/[eventId]/page.tsx`

---

## Phase 4: Calendar View

### Files to Create

**UI Components (packages/ui):**
- `packages/ui/src/components/week-calendar.tsx` (generic weekly calendar)
- `packages/ui/src/components/datetime-picker.tsx` (date + time picker)

**Dashboard Components:**
- `apps/dashboard/components/events/event-calendar.tsx`
- `apps/dashboard/components/events/event-calendar-week-nav.tsx`
- `apps/dashboard/components/events/event-calendar-day-column.tsx`
- `apps/dashboard/components/events/event-calendar-event-slot.tsx`

**Features:**
- Week navigation (prev/next/today)
- Hour grid (configurable range)
- Events positioned by time
- Click event to edit
- View toggle (calendar/list) via URL param

---

## Phase 5: Integration & Polish

### Update Existing Files

**Navigation:**
- `apps/dashboard/components/organizations/slug/nav-items.tsx` - Add Events entry
- `apps/dashboard/components/organizations/slug/settings/nav-organization.tsx` - Add Locations entry

**Routes package:**
- `packages/routes/src/index.ts` - Add event and location routes

**i18n:**
- `apps/dashboard/messages/en.json` - Add events/locations translations
- `apps/dashboard/messages/de.json` - Add events/locations translations

**Public shop (optional):**
- Update `/tickets` page to show event info for event-linked tickets

---

## Key Implementation Patterns

### Create Event Action (with Ticket + Stripe)

```typescript
// apps/dashboard/actions/events/admin/create-event.ts
export const createEvent = authOrganizationActionClient
  .metadata({ actionName: "createEvent" })
  .inputSchema(createEventSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 1. Create ticket first
    const ticket = await prisma.ticket.create({
      data: {
        organizationId: ctx.organization.id,
        name: parsedInput.name,
        price: parsedInput.ticketPrice,
        currency: parsedInput.currency,
        stock: parsedInput.capacity,
        validFrom: parsedInput.startTime,
        validUntil: parsedInput.endTime,
        isActive: parsedInput.isPublished,
      },
    });

    // 2. Create Stripe product
    await createStripeProductForTicket(ticket.id);

    // 3. Create event linked to ticket
    const event = await prisma.event.create({
      data: {
        organizationId: ctx.organization.id,
        ticketId: ticket.id,
        locationId: parsedInput.locationId,
        name: parsedInput.name,
        description: parsedInput.description,
        startTime: parsedInput.startTime,
        endTime: parsedInput.endTime,
        isPublished: parsedInput.isPublished,
      },
    });

    revalidatePath(`/organizations/${ctx.organization.slug}/events`);
    return event;
  });
```

---

## Critical Files Reference

| Purpose | File Path |
|---------|-----------|
| Schema | `packages/database/prisma/schema.prisma` |
| Ticket create pattern | `apps/dashboard/actions/tickets/admin/create-ticket.ts` |
| Form pattern | `apps/dashboard/components/tickets/ticket-form.tsx` |
| Calendar base | `packages/ui/src/components/calendar.tsx` |
| Navigation | `apps/dashboard/components/organizations/slug/nav-items.tsx` |
| Settings nav | `apps/dashboard/components/organizations/slug/settings/nav-organization.tsx` |
