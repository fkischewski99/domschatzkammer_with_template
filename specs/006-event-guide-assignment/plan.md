# Feature: Event-Zuweisung

## Zusammenfassung

Admins können einen Domführer zu einem Event zuweisen. Domführer sehen ihre zugewiesenen Events. Auf Event-Karten und im Kalender wird der zugewiesene Guide angezeigt.

---

## Anforderungen

### Für Admins
- Domführer einem Event zuweisen (auf Event-Detail-Seite)
- Nur ein Domführer pro Event möglich
- Zuweisung entfernen
- Bei Zuweisung: Nur Domführer anzeigen die in diesem Zeitraum verfügbar sind

### Für Domführer
- Liste der zugewiesenen Events sehen
- Kalender-Integration: Zugewiesene Events filtern

### Für alle
- Auf Event-Karten wird der zugewiesene Guide angezeigt
- Im Kalender ist der Guide-Name sichtbar

---

## Datenmodell

### Event Model Update (vereinfacht)

Da nur ein Guide pro Event möglich ist, wird `guideId` direkt auf dem Event gespeichert (kein separates Model nötig).

```prisma
model Event {
  // ... bestehende Felder ...

  // Guide-Zuweisung
  guideId  String?  @db.Uuid
  guide    User?    @relation("GuideEvents", fields: [guideId], references: [id], onDelete: SetNull)
}
```

### User Model Update
```prisma
model User {
  // ... bestehende Felder ...
  guidedEvents  Event[] @relation("GuideEvents")
}
```

---

## Dateistruktur

### Server Actions
```
apps/dashboard/actions/events/
├── assign-guide-to-event.ts      # guideId setzen
└── unassign-guide-from-event.ts  # guideId auf null setzen
```

### Data Fetching
```
apps/dashboard/data/events/
└── get-available-guides-for-event.ts  # Verfügbare Guides (mit Availability-Check)
```

### Components
```
apps/dashboard/components/events/
├── assign-guide-modal.tsx      # Modal zum Zuweisen
└── event-guide-badge.tsx       # Badge auf Event-Karte
```

---

## Integration in bestehende Seiten

### Event-Detail-Seite
**Datei:** `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/[eventId]/page.tsx`

- Neuer Abschnitt "Zugewiesener Domführer"
- Button "Domführer zuweisen" (nur für Admin)
- Zugewiesener Guide mit Entfernen-Option

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
// Setzt event.guideId = guideId
```

### unassign-guide-from-event.ts
```typescript
// Input
{
  eventId: string
}

// Berechtigung: ADMIN/OWNER
// Setzt event.guideId = null
```

---

## UI-Komponenten

### AssignGuideModal
- Dropdown mit allen Guides der Organisation welche zum Zeitpunkt des events verfügbar sind

### EventGuideBadge
- Kleiner Badge auf Event-Karte
- Zeigt Avatar oder Initialen des Guides
- Tooltip mit vollem Namen

---

## i18n

```json
{
  "events": {
    "guide": {
      "title": "Zugewiesener Domführer",
      "assign": "Domführer zuweisen",
      "unassign": "Zuweisung entfernen",
      "noGuide": "Noch kein Domführer zugewiesen",
      "selectGuide": "Domführer auswählen",
      "available": "Verfügbar",
      "unavailable": "Nicht verfügbar"
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

1. [ ] Prisma Schema: guideId zu Event hinzufügen
2. [ ] User Model: guidedEvents Relation hinzufügen
3. [ ] Migration ausführen
4. [ ] Server Actions implementieren
5. [ ] Data Fetching Function erstellen
6. [ ] AssignGuideModal Komponente
7. [ ] EventGuideBadge Komponente
8. [ ] Event-Detail-Seite: Guide-Sektion hinzufügen
9. [ ] Event-Karte: Badge hinzufügen
10. [ ] Event-Kalender: Guide-Name anzeigen
11. [ ] i18n Strings (en + de)
12. [ ] Typecheck & Test

---

## Abhängigkeiten

- **Benötigt:** Feature 004 (GUIDE Rolle)
- **Optional:** Feature 005 (Guide Availability) - für Verfügbarkeits-Anzeige im Modal

## Notizen

- Ein Guide pro Event (vereinfachtes Design mit guideId auf Event)
- Ein Guide kann mehreren Events zugewiesen sein
- Bei Event-Löschung wird Guide automatisch entfernt (cascade)
- Bei Guide-Löschung wird guideId auf null gesetzt (SetNull)
