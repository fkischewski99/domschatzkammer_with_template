# Feature: Verfügbarkeits-Management

## Zusammenfassung

Domführer können ihre Verfügbarkeiten im Kalender festlegen. Admins können die Verfügbarkeiten aller Domführer einsehen, um bei der Event-Planung zu helfen.

---

## Anforderungen

### Für Domführer
- Kalender-Ansicht zum Setzen der Verfügbarkeit
- Listen-Ansicht zum schnellen Eintragen mehrerer Tage
- Toggle zwischen Kalender- und Listen-Ansicht
- Status pro Tag: Verfügbar / Nicht verfügbar
- Optionale Notizen pro Tag
- Mehrere Tage auf einmal setzen können

### Für Admins
- Übersicht aller Domführer-Verfügbarkeiten
- Filterung nach Datum
- Sehen welche Guides an welchem Tag verfügbar sind

---

## Datenmodell

### GuideAvailability (Prisma)

```prisma
enum AvailabilityStatus {
  AVAILABLE    @map("available")
  UNAVAILABLE  @map("unavailable")
}

model GuideAvailability {
  id             String             @id @default(uuid()) @db.Uuid
  userId         String             @db.Uuid
  user           User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId String             @db.Uuid
  organization   Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  date           DateTime           @db.Date
  status         AvailabilityStatus @default(AVAILABLE)
  notes          String?            @db.VarChar(500)
  createdAt      DateTime           @default(now()) @db.Timestamptz(6)
  updatedAt      DateTime           @updatedAt @db.Timestamptz(6)

  @@unique([userId, organizationId, date])
  @@index([organizationId, date])
  @@index([userId, organizationId])
}
```

---

## Dateistruktur

### Server Actions
```
apps/dashboard/actions/guide-availability/
├── set-availability.ts          # Verfügbarkeit setzen/aktualisieren
├── set-availability-range.ts    # Mehrere Tage auf einmal
├── delete-availability.ts       # Verfügbarkeit entfernen
└── get-my-availability.ts       # Eigene Verfügbarkeit laden
```

### Data Fetching
```
apps/dashboard/data/guide-availability/
├── get-guide-availability.ts              # Einzelner Guide
└── get-organization-guide-availabilities.ts  # Alle Guides (Admin)
```

### Schemas
```
apps/dashboard/schemas/guide-availability/
├── set-availability-schema.ts
└── availability-range-schema.ts
```

### Components
```
apps/dashboard/components/guides/
├── availability-calendar.tsx        # Monatskalender für Guide
├── availability-list.tsx            # Listen-Ansicht für Guide
├── availability-view-toggle.tsx     # Toggle zwischen Kalender/Liste
├── availability-day-cell.tsx        # Einzelner Tag im Kalender
├── availability-list-row.tsx        # Einzelne Zeile in Liste
├── set-availability-modal.tsx       # Modal zum Setzen
├── availability-legend.tsx          # Legende (Farben)
└── guide-availability-overview.tsx  # Admin-Übersicht
```

### Pages
```
apps/dashboard/app/[locale]/organizations/[slug]/(organization)/
├── my-availability/
│   └── page.tsx                     # Guide: Eigene Verfügbarkeit
└── settings/organization/guides/
    └── availability/
        └── page.tsx                 # Admin: Alle Verfügbarkeiten
```

---

## Server Actions

### set-availability.ts
```typescript
// Input
{
  date: Date,
  status: 'AVAILABLE' | 'UNAVAILABLE',
  notes?: string
}

// Berechtigung: Nur GUIDE-Rolle
// Erstellt oder aktualisiert Verfügbarkeit für das Datum
```

### set-availability-range.ts
```typescript
// Input
{
  startDate: Date,
  endDate: Date,
  status: 'AVAILABLE' | 'UNAVAILABLE',
  notes?: string
}

// Berechtigung: Nur GUIDE-Rolle
// Setzt Verfügbarkeit für alle Tage im Bereich
```

---

## UI-Komponenten

### AvailabilityCalendar
- Monatsansicht mit Navigation
- Farbcodierung: Grün (verfügbar), Rot (nicht verfügbar)
- Klick auf Tag öffnet Modal
- Drag-Selection für mehrere Tage

### AvailabilityList
- Tabellarische Ansicht mit Datumsbereich (z.B. nächste 30 Tage)
- Schnelle Status-Auswahl per Dropdown oder Toggle pro Zeile
- Datum, Wochentag, Status, Notizen als Spalten
- Bulk-Aktionen: Alle auswählen, Status für Auswahl setzen
- Pagination oder virtuelles Scrolling für längere Zeiträume

### AvailabilityViewToggle
- Toggle-Button zwischen Kalender- und Listen-Ansicht
- Speichert Präferenz im Local Storage

### GuideAvailabilityOverview (Admin)
- Liste aller Guides mit Filterung
- Kalender-Ansicht pro Guide oder aggregiert
- Export-Funktion (optional)

---

## i18n

```json
{
  "guides": {
    "availability": {
      "title": "Meine Verfügbarkeit",
      "description": "Legen Sie fest, wann Sie für Führungen verfügbar sind",
      "status": {
        "available": "Verfügbar",
        "unavailable": "Nicht verfügbar"
      },
      "setAvailability": "Verfügbarkeit setzen",
      "notes": "Notizen (optional)",
      "save": "Speichern",
      "delete": "Entfernen",
      "views": {
        "calendar": "Kalender",
        "list": "Liste"
      },
      "list": {
        "date": "Datum",
        "day": "Tag",
        "status": "Status",
        "notes": "Notizen",
        "selectAll": "Alle auswählen",
        "setSelected": "Auswahl setzen"
      }
    },
    "overview": {
      "title": "Domführer-Verfügbarkeiten",
      "description": "Übersicht aller Domführer-Verfügbarkeiten",
      "filterByDate": "Nach Datum filtern",
      "noGuides": "Keine Domführer in dieser Organisation"
    }
  }
}
```

---

## Implementierungs-Schritte

1. [ ] Prisma Schema: GuideAvailability Model + AvailabilityStatus Enum
2. [ ] Migration ausführen
3. [ ] Schemas erstellen
4. [ ] Server Actions implementieren
5. [ ] Data Fetching Functions erstellen
6. [ ] AvailabilityCalendar Komponente
7. [ ] AvailabilityList Komponente
8. [ ] AvailabilityViewToggle Komponente
9. [ ] SetAvailabilityModal Komponente
10. [ ] My-Availability Page (Guide) mit Kalender/Listen-Toggle
11. [ ] GuideAvailabilityOverview Komponente
12. [ ] Admin Availability Page
13. [ ] Navigation-Links hinzufügen
14. [ ] i18n Strings (en + de)
15. [ ] Typecheck & Test

---

## Abhängigkeiten

- **Benötigt:** Feature 004 (GUIDE Rolle)

## Navigation

- Guides sehen "Meine Verfügbarkeit" im Hauptmenü
- Admins sehen "Verfügbarkeiten" unter Einstellungen → Domführer
