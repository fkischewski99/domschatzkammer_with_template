# Feature: Event-Zuweisung

## Zusammenfassung

Admins können Domführer zu Events zuweisen. Domführer sehen ihre zugewiesenen Events. Auf Event-Karten und im Kalender wird der zugewiesene Guide angezeigt.

---

## Anforderungen

### Für Admins
- Domführer einem Event zuweisen (auf Event-Detail-Seite)
- Mehrere Domführer pro Event möglich
- Zuweisung entfernen
- Bei Zuweisung: Verfügbarkeit des Guides anzeigen (wenn Feature 005 implementiert)
- Übersicht aller Zuweisungen

### Für Domführer
- Liste der zugewiesenen Events sehen
- Kalender-Integration: Zugewiesene Events hervorgehoben

### Für alle
- Auf Event-Karten wird der zugewiesene Guide angezeigt
- Im Kalender ist der Guide-Name sichtbar

---

## Datenmodell

### EventGuideAssignment (Prisma)

```prisma
model EventGuideAssignment {
  id             String       @id @default(uuid()) @db.Uuid
  eventId        String       @db.Uuid
  event          Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guideId        String       @db.Uuid
  guide          User         @relation("GuideAssignments", fields: [guideId], references: [id], onDelete: Cascade)
  organizationId String       @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  assignedAt     DateTime     @default(now()) @db.Timestamptz(6)
  assignedById   String       @db.Uuid
  assignedBy     User         @relation("AssignedBy", fields: [assignedById], references: [id])

  @@unique([eventId, guideId])
  @@index([organizationId])
  @@index([eventId])
  @@index([guideId])
}
```

### Event Model Update
```prisma
model Event {
  // ... bestehende Felder ...
  guideAssignments  EventGuideAssignment[]
}
```

---

## Dateistruktur

### Server Actions
```
apps/dashboard/actions/event-assignments/
├── assign-guide-to-event.ts      # Guide zuweisen
├── unassign-guide-from-event.ts  # Zuweisung entfernen
└── get-event-assignments.ts      # Zuweisungen für Event
```

### Data Fetching
```
apps/dashboard/data/event-assignments/
├── get-event-guide-assignments.ts     # Guides für ein Event
├── get-guide-assigned-events.ts       # Events für einen Guide
└── get-available-guides-for-event.ts  # Verfügbare Guides (mit Availability-Check)
```

### Schemas
```
apps/dashboard/schemas/event-assignments/
└── event-assignment-schema.ts
```

### Components
```
apps/dashboard/components/event-assignments/
├── assign-guide-modal.tsx         # Modal zum Zuweisen
├── event-guide-list.tsx           # Liste der zugewiesenen Guides
├── guide-assignment-badge.tsx     # Badge auf Event-Karte
└── unassign-guide-button.tsx      # Entfernen-Button
```

---

## Integration in bestehende Seiten

### Event-Detail-Seite
**Datei:** `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/[eventId]/page.tsx`

- Neuer Abschnitt "Zugewiesene Domführer"
- Button "Domführer zuweisen" (nur für Admin)
- Liste der zugewiesenen Guides mit Entfernen-Option

### Event-Karten
**Datei:** `apps/dashboard/components/events/event-card.tsx`

- Badge/Avatar des zugewiesenen Guides anzeigen
- Tooltip mit Guide-Name

### Event-Kalender
**Datei:** `apps/dashboard/components/events/event-calendar.tsx`

- Guide-Name im Event-Block anzeigen
- Für Guides: Eigene zugewiesene Events hervorheben

---

## Server Actions

### assign-guide-to-event.ts
```typescript
// Input
{
  eventId: string,
  guideId: string
}

// Berechtigung: ADMIN/OWNER
// Validierung: Guide muss GUIDE-Rolle haben
// Erstellt EventGuideAssignment
```

### unassign-guide-from-event.ts
```typescript
// Input
{
  eventId: string,
  guideId: string
}

// Berechtigung: ADMIN/OWNER
// Löscht EventGuideAssignment
```

---

## UI-Komponenten

### AssignGuideModal
- Dropdown mit allen Guides der Organisation
- Wenn Feature 005 implementiert: Verfügbarkeit anzeigen
  - Grün markiert = verfügbar am Event-Tag
  - Rot markiert = nicht verfügbar
  - Grau = keine Angabe
- Bereits zugewiesene Guides ausgrauen

### EventGuideList
- Avatar + Name der zugewiesenen Guides
- Entfernen-Button (nur für Admin)
- "Noch kein Guide zugewiesen" wenn leer

### GuideAssignmentBadge
- Kleiner Badge auf Event-Karte
- Zeigt Avatar oder Initialen des Guides
- Tooltip mit vollem Namen

---

## i18n

```json
{
  "events": {
    "guides": {
      "title": "Zugewiesene Domführer",
      "assign": "Domführer zuweisen",
      "unassign": "Zuweisung entfernen",
      "noGuide": "Noch kein Domführer zugewiesen",
      "selectGuide": "Domführer auswählen",
      "available": "Verfügbar",
      "unavailable": "Nicht verfügbar",
      "assignedBy": "Zugewiesen von {name}",
      "assignedAt": "am {date}"
    }
  },
  "guides": {
    "myEvents": {
      "title": "Meine zugewiesenen Events",
      "noEvents": "Keine Events zugewiesen"
    }
  }
}
```

---

## Implementierungs-Schritte

1. [ ] Prisma Schema: EventGuideAssignment Model
2. [ ] Event Model: Relation hinzufügen
3. [ ] User Model: Relations hinzufügen
4. [ ] Migration ausführen
5. [ ] Schemas erstellen
6. [ ] Server Actions implementieren
7. [ ] Data Fetching Functions erstellen
8. [ ] AssignGuideModal Komponente
9. [ ] EventGuideList Komponente
10. [ ] Event-Detail-Seite: Guide-Sektion hinzufügen
11. [ ] Event-Karte: Badge hinzufügen
12. [ ] Event-Kalender: Guide-Name anzeigen
13. [ ] i18n Strings (en + de)
14. [ ] Typecheck & Test

---

## Abhängigkeiten

- **Benötigt:** Feature 004 (GUIDE Rolle)
- **Optional:** Feature 005 (Guide Availability) - für Verfügbarkeits-Anzeige im Modal

## Notizen

- Mehrere Guides pro Event sind möglich (z.B. für große Events)
- Ein Guide kann mehreren Events zugewiesen sein
- Bei Event-Absage bleiben Zuweisungen bestehen (cascade delete regelt das)
