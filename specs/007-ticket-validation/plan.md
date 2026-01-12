# Feature: Ticket-Validierung

## Zusammenfassung

Domführer und Admins können Tickets per QR-Code scannen und als "verwendet" markieren. Dies ermöglicht die Einlasskontrolle bei Events.

---

## Anforderungen

### Funktional
- QR-Code Scanner (Kamera)
- Manuelle Eingabe als Fallback
- Sofortiges Feedback (gültig/ungültig/bereits verwendet)
- Validierungs-Historie anzeigen
- Ticket-Details nach Scan anzeigen (Name, Event, etc.)

### Berechtigungen
- GUIDE, ADMIN und OWNER können Tickets validieren
- MEMBER kann nicht validieren

### Validierungs-Logik
- Ticket muss Status `COMPLETED` haben
- Ticket darf nicht bereits `validated = true` sein
- Ticket darf nicht `invalidated = true` sein (z.B. storniert)

---

## Bestehendes Datenmodell

Das Purchase-Model hat bereits alle nötigen Felder:

```prisma
model Purchase {
  // ... bestehende Felder ...
  validated       Boolean    @default(false)
  validatedAt     DateTime?  @db.Timestamptz(6)
  validatedBy     String?    @db.VarChar(255)
  invalidated     Boolean    @default(false)
  qrCode          String     @unique @default(uuid()) @db.Uuid
}
```

**Keine Schema-Änderungen nötig!**

---

## Dateistruktur

### Server Actions
```
apps/dashboard/actions/ticket-validation/
├── validate-ticket.ts           # Ticket validieren
├── get-validation-history.ts    # Letzte Validierungen
└── lookup-ticket.ts             # Ticket-Details ohne Validierung
```

### Data Fetching
```
apps/dashboard/data/ticket-validation/
└── get-recent-validations.ts    # Historie für Validierungs-Seite
```

### Schemas
```
apps/dashboard/schemas/ticket-validation/
└── validate-ticket-schema.ts
```

### Components
```
apps/dashboard/components/ticket-validation/
├── qr-scanner.tsx               # Kamera-Scanner
├── manual-code-input.tsx        # Manuelle Eingabe
├── validation-result.tsx        # Ergebnis-Anzeige
├── ticket-details-card.tsx      # Ticket-Infos nach Scan
└── validation-history.tsx       # Letzte Validierungen
```

### Pages
```
apps/dashboard/app/[locale]/organizations/[slug]/(organization)/
└── validate/
    └── page.tsx                 # Validierungs-Seite
```

---

## Server Actions

### validate-ticket.ts
```typescript
// Input
{
  qrCode: string  // UUID aus QR-Code
}

// Berechtigung: GUIDE, ADMIN oder OWNER

// Validierung:
// 1. Purchase mit qrCode finden
// 2. Prüfen: status === 'COMPLETED'
// 3. Prüfen: validated === false
// 4. Prüfen: invalidated === false

// Bei Erfolg:
// - validated = true
// - validatedAt = now()
// - validatedBy = userName

// Return
{
  success: boolean,
  status: 'valid' | 'already_used' | 'invalid' | 'not_found' | 'cancelled',
  purchase?: {
    id: string,
    customerName: string,
    email: string,
    ticketName: string,
    eventName: string,
    eventDate: Date,
    validatedAt?: Date,
    validatedBy?: string
  }
}
```

### lookup-ticket.ts
```typescript
// Input
{
  qrCode: string
}

// Berechtigung: GUIDE, ADMIN oder OWNER
// Zeigt Ticket-Details OHNE zu validieren
// Nützlich für "Preview" vor Validierung
```

---

## UI-Komponenten

### QRScanner
- Kamera-Zugriff anfordern
- Kontinuierliches Scannen
- Automatische Erkennung von QR-Codes
- Visuelles Feedback (Rahmen um erkannten Code)
- Fehlerbehandlung (keine Kamera, Permission denied)

**Bibliothek:** `@yudiel/react-qr-scanner` oder `html5-qrcode`

### ManualCodeInput
- Input-Feld für UUID
- Paste-Support
- Enter zum Absenden
- Validierung des UUID-Formats

### ValidationResult
- Große visuelle Anzeige des Ergebnisses
- Grün + Checkmark = Gültig
- Rot + X = Ungültig/Bereits verwendet
- Gelb + Warning = Storniert
- Sound-Feedback (optional)
- Vibration auf Mobile (optional)

### TicketDetailsCard
- Kundenname
- E-Mail
- Ticket-Typ
- Event-Name und Datum
- Validierungs-Status
- Bei "bereits verwendet": Wann und von wem

### ValidationHistory
- Liste der letzten 10-20 Validierungen
- Zeitstempel
- Ticket-/Kundeninfo
- Status (erfolgreich/fehlgeschlagen)

---

## Seiten-Layout

### /validate/page.tsx

```
┌─────────────────────────────────────┐
│  Ticket-Validierung                 │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     [QR-Scanner Kamera]     │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─── oder ───                       │
│                                     │
│  [________________] [Prüfen]        │
│   Code manuell eingeben             │
│                                     │
├─────────────────────────────────────┤
│  Letztes Ergebnis:                  │
│  ┌─────────────────────────────┐    │
│  │  ✓ GÜLTIG                   │    │
│  │  Max Mustermann             │    │
│  │  Domführung 14:00           │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│  Letzte Validierungen:              │
│  • 14:32 - Max M. ✓                 │
│  • 14:30 - Anna S. ✓                │
│  • 14:28 - [Ungültig] ✗             │
└─────────────────────────────────────┘
```

---

## i18n

```json
{
  "validation": {
    "title": "Ticket-Validierung",
    "description": "Scannen Sie QR-Codes um Tickets zu validieren",
    "scanQR": "QR-Code scannen",
    "enterManually": "Code manuell eingeben",
    "codePlaceholder": "Ticket-Code eingeben...",
    "validate": "Prüfen",
    "cameraPermission": "Kamera-Zugriff erforderlich",
    "noCameraAccess": "Kein Zugriff auf Kamera. Bitte Berechtigung erteilen.",
    "result": {
      "valid": "Gültiges Ticket",
      "alreadyUsed": "Bereits verwendet",
      "invalid": "Ungültiges Ticket",
      "notFound": "Ticket nicht gefunden",
      "cancelled": "Ticket storniert"
    },
    "details": {
      "customer": "Kunde",
      "email": "E-Mail",
      "ticket": "Ticket",
      "event": "Veranstaltung",
      "validatedAt": "Validiert am",
      "validatedBy": "Validiert von"
    },
    "history": {
      "title": "Letzte Validierungen",
      "empty": "Noch keine Validierungen"
    }
  }
}
```

---

## Navigation

- Neuer Menüpunkt "Tickets validieren" für GUIDE/ADMIN/OWNER
- Icon: QR-Code oder Ticket-Check
- Prominent platziert (nicht in Settings versteckt)

---

## Implementierungs-Schritte

1. [ ] QR-Scanner Bibliothek installieren
2. [ ] Schemas erstellen
3. [ ] validate-ticket Action implementieren
4. [ ] lookup-ticket Action implementieren
5. [ ] get-recent-validations Data Fetcher
6. [ ] QRScanner Komponente
7. [ ] ManualCodeInput Komponente
8. [ ] ValidationResult Komponente
9. [ ] TicketDetailsCard Komponente
10. [ ] ValidationHistory Komponente
11. [ ] Validierungs-Seite erstellen
12. [ ] Navigation-Link hinzufügen (nur für GUIDE+)
13. [ ] Permission-Check in Navigation
14. [ ] i18n Strings (en + de)
15. [ ] Mobile-Optimierung testen
16. [ ] Typecheck & Test

---

## Abhängigkeiten

- **Benötigt:** Feature 004 (GUIDE Rolle)
- **Unabhängig von:** Feature 005, 006

## Technische Notizen

### QR-Scanner Bibliotheken

**Option 1: `@yudiel/react-qr-scanner`**
- React-native Wrapper
- Einfache API
- Gut gewartet

**Option 2: `html5-qrcode`**
- Vanilla JS, flexibler
- Mehr Konfiguration
- Bessere Browser-Kompatibilität

### Mobile Considerations
- Touch-optimierte Buttons
- Vollbild-Scanner Option
- Haptic Feedback bei Erfolg/Fehler
- Landscape-Modus unterstützen
