# Kalender-Features: Click-to-Create, Drag-Events, Location-Farben, Side-by-Side

## Übersicht

Vier Features für den Event-Kalender:
1. **Click-to-Create**: Klick auf leere Fläche → "+" Button erscheint (1h vorgewählt) → Navigation zur Create-Seite
2. **Drag-to-Move**: Bestehende Events per Drag & Drop verschieben
3. **Location-Farben**: Events zeigen Farbe basierend auf Location (Color Picker)
4. **Side-by-Side Events**: Überlappende Events nebeneinander anzeigen

---

## Feature 1: Click-to-Create Events

### Verhalten
1. User klickt auf leere Kalenderfläche
2. Ein großer "+" Button erscheint an der geklickten Position (1 Stunde vorgewählt)
3. Klick auf "+" Button → Navigation zur Create-Seite mit vorausgefüllten Zeiten
4. Klick woanders oder Escape → Button verschwindet

### Implementierung

#### 1.1 Click-State im Calendar
**Datei**: `apps/dashboard/components/events/event-calendar.tsx`

```typescript
// State für geklickte Position
const [pendingCreate, setPendingCreate] = useState<{
  day: Date;
  startTime: Date;
  endTime: Date;
  position: { top: number; height: number };
} | null>(null);

// Click Handler auf Day-Column
const handleDayClick = (e: React.MouseEvent, day: Date) => {
  // Ignoriere Klicks auf Events
  if ((e.target as HTMLElement).closest('[data-event]')) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const minutes = Math.round((clickY / HOUR_HEIGHT) * 60 / 15) * 15; // 15-min Schritte
  const startTime = addMinutes(startOfDay(day), START_HOUR * 60 + minutes);
  const endTime = addHours(startTime, 1); // 1 Stunde default

  setPendingCreate({
    day,
    startTime,
    endTime,
    position: { top: clickY, height: HOUR_HEIGHT },
  });
};

// Escape-Handler
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setPendingCreate(null);
  };
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, []);
```

#### 1.2 Create-Button Overlay
**Datei**: inline in `event-calendar.tsx`

```typescript
{pendingCreate && (
  <div
    className="absolute left-1 right-1 bg-primary/20 border-2 border-dashed border-primary rounded-md flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors"
    style={{
      top: pendingCreate.position.top,
      height: pendingCreate.position.height,
    }}
    onClick={() => {
      router.push(
        `/organizations/${organizationSlug}/events/create?startTime=${pendingCreate.startTime.toISOString()}&endTime=${pendingCreate.endTime.toISOString()}`
      );
    }}
  >
    <div className="bg-primary text-primary-foreground rounded-full p-2">
      <Plus className="h-6 w-6" />
    </div>
  </div>
)}
```

#### 1.3 Create-Page Query-Params unterstützen
**Datei**: `apps/dashboard/app/[locale]/organizations/[slug]/(organization)/events/create/page.tsx`

- Parse `startTime` und `endTime` aus searchParams
- Übergebe an EventForm als defaultValues

#### 1.4 EventForm Defaults akzeptieren
**Datei**: `apps/dashboard/components/events/event-form.tsx`

- Neue Props: `defaultStartTime?: string`, `defaultEndTime?: string`
- Setze datetime-local Inputs auf diese Werte

---

## Feature 2: Drag-to-Move Events (mit @dnd-kit)

### Verhalten
1. User zieht ein bestehendes Event
2. Event kann auf andere Zeit/Tag verschoben werden
3. Bei Loslassen: Server-Action zum Updaten der Event-Zeit

### Implementierung

#### 2.1 DndContext Setup
**Datei**: `apps/dashboard/components/events/event-calendar.tsx`

```typescript
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
);

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const eventId = active.id as string;
  const [dayIso, hour, minute] = (over.id as string).split('-');
  const newStartTime = /* calculate from drop position */;

  // Update Event via Server Action
  await updateEventTime({ eventId, startTime: newStartTime, endTime: newEndTime });
};
```

#### 2.2 Draggable Events
**Datei**: `apps/dashboard/components/events/draggable-event.tsx`

```typescript
import { useDraggable } from '@dnd-kit/core';

export function DraggableEvent({ event, children }: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
```

#### 2.3 Droppable Time Slots
**Datei**: inline in `event-calendar.tsx`

```typescript
// Jede Stunde wird ein Droppable
{hours.map((hour) => (
  <DroppableTimeSlot key={hour} day={day} hour={hour} />
))}
```

#### 2.4 Server Action für Event-Update
**Datei**: `apps/dashboard/actions/events/admin/update-event-time.ts`

```typescript
export const updateEventTime = authOrganizationActionClient
  .schema(z.object({
    eventId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    // Update nur die Zeiten, Rest bleibt gleich
    await prisma.event.update({
      where: { id: parsedInput.eventId },
      data: {
        startTime: parsedInput.startTime,
        endTime: parsedInput.endTime,
      },
    });
  });
```

---

## Feature 2: Location-basierte Farben

### Implementierung

#### 2.1 Database Migration
**Datei**: `packages/database/prisma/schema.prisma`

```prisma
model Location {
  // ... existing fields
  color       String?  @db.VarChar(7)  // Hex: "#3B82F6"
}
```

```bash
pnpm --filter @workspace/database exec prisma migrate dev --name add_location_color
```

#### 2.2 Location Schema updaten
**Datei**: `apps/dashboard/schemas/locations/location-schema.ts`

```typescript
color: z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Ungültiger Hex-Farbwert')
  .optional()
  .nullable(),
```

#### 2.3 Location Actions updaten
**Dateien**:
- `apps/dashboard/actions/locations/admin/create-location.ts`
- `apps/dashboard/actions/locations/admin/update-location.ts`

Füge `color` Feld zu data object hinzu.

#### 2.4 Location Form mit Color Picker
**Datei**: `apps/dashboard/components/locations/location-form.tsx`

- Füge Color-Input Feld hinzu (natives `<input type="color">`)
- Label: "Kalender-Farbe"
- Hint: "Events an dieser Location werden in dieser Farbe im Kalender angezeigt"

#### 2.5 Farb-Utilities erstellen
**Datei**: `apps/dashboard/lib/location-colors.ts`

```typescript
// Default-Palette für Locations ohne Farbe
export const DEFAULT_LOCATION_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export function getLocationColor(color: string | null, index: number): string
export function getContrastColor(hex: string): 'white' | 'black'
```

#### 2.6 EventCalendar Farben anwenden
**Datei**: `apps/dashboard/components/events/event-calendar.tsx`

- Ersetze feste `bg-primary` durch dynamische Location-Farbe
- Behalte spezielle Styles für cancelled/unpublished

---

## Feature 3: Side-by-Side Events

### Algorithmus
1. Events für jeden Tag in "Collision Groups" gruppieren
2. Innerhalb jeder Gruppe: Spalten-Index zuweisen
3. Breite und Left-Position aus Spalten-Anzahl berechnen

### Implementierung

#### 3.1 Layout-Algorithmus erstellen
**Datei**: `apps/dashboard/lib/calendar-layout.ts`

```typescript
interface LayoutPosition {
  top: number;
  height: number;
  left: string;   // z.B. "2%", "34%"
  width: string;  // z.B. "96%", "31%"
  column: number;
  totalColumns: number;
}

export function calculateEventLayout(
  events: Array<{ id: string; startTime: Date | string; endTime: Date | string }>,
  day: Date,
  config: { hourHeight: number; startHour: number; endHour: number; padding: number }
): Map<string, LayoutPosition>
```

**Unter-Funktionen**:
- `eventsOverlap(a, b)`: Prüft Zeitüberschneidung
- `findCollisionGroups(events)`: Gruppiert überlappende Events
- `assignColumns(group)`: Vergibt Spalten-Indizes

#### 3.2 EventCalendar Layout anwenden
**Datei**: `apps/dashboard/components/events/event-calendar.tsx`

- Importiere `calculateEventLayout`
- Berechne Positionen pro Tag mit `useMemo`
- Ersetze aktuelles `left: 1, right: 1` durch berechnete Werte

---

## Kritische Dateien

| Datei | Änderungen |
|-------|------------|
| `packages/database/prisma/schema.prisma` | `color` Feld zu Location |
| `apps/dashboard/components/events/event-calendar.tsx` | Click-to-create, Drag-to-move, Farben, Layout |
| `apps/dashboard/components/events/draggable-event.tsx` | NEU: Draggable Event Wrapper |
| `apps/dashboard/components/locations/location-form.tsx` | Color Picker |
| `apps/dashboard/schemas/locations/location-schema.ts` | Color Validierung |
| `apps/dashboard/actions/locations/admin/create-location.ts` | Color speichern |
| `apps/dashboard/actions/locations/admin/update-location.ts` | Color speichern |
| `apps/dashboard/actions/events/admin/update-event-time.ts` | NEU: Event-Zeit updaten |
| `apps/dashboard/lib/calendar-layout.ts` | NEU: Layout-Algorithmus |
| `apps/dashboard/lib/location-colors.ts` | NEU: Farb-Utilities |
| `apps/dashboard/app/.../events/create/page.tsx` | Query-Params für Zeit |
| `apps/dashboard/components/events/event-form.tsx` | Default-Zeiten Props |

---

## Reihenfolge der Implementierung

1. **Database Migration** (Location.color) ✅ bereits gemacht
2. **Location-Farben** (Schema, Actions, Form, Utilities)
   - → `browser-feature-tester` Agent: Location Color Picker + Kalender-Anzeige testen
3. **Calendar Layout** (Side-by-Side Algorithmus)
   - → `browser-feature-tester` Agent: Überlappende Events testen
4. **Click-to-Create** (Click-Handler, Create-Button, Create-Page)
   - → `browser-feature-tester` Agent: Click + Navigation testen
5. **Drag-to-Move** (@dnd-kit, Draggable Events, Server Action)
   - → `browser-feature-tester` Agent: Drag + Event-Update testen
6. **i18n** (Übersetzungen für neue Labels)
7. **Final Test** (Alle Features im Zusammenspiel)

---

## i18n Keys (de.json)

```json
"locations": {
  "form": {
    "color": {
      "label": "Kalender-Farbe",
      "hint": "Events an dieser Location werden in dieser Farbe angezeigt."
    }
  }
},
"calendar": {
  "clickToCreate": "Klicken um Event zu erstellen",
  "dragToMove": "Ziehen um Event zu verschieben"
}
```

---

## Browser-Feature-Testing (nach jeder Feature-Implementierung)

Nach Implementierung jedes Features **MUSS** der `browser-feature-tester` Agent aufgerufen werden.

### Test-Szenarien

#### Location-Farben Tests
1. **Farbe zuweisen**: Location bearbeiten → Color Picker → Speichern → Verifizieren
2. **Farbe im Kalender**: Event an dieser Location erstellen → Kalender öffnen → Farbe prüfen
3. **Default-Farben**: Location ohne Farbe → Event erstellen → Default-Farbe wird angezeigt
4. **Kontrast-Text**: Dunkle Farbe → weißer Text / Helle Farbe → schwarzer Text

#### Side-by-Side Tests
1. **Keine Überlappung**: 2 Events ohne Überlappung → beide volle Breite
2. **2 Events überlappen**: Events 9-11 und 10-12 → nebeneinander (je 50% Breite)
3. **3+ Events überlappen**: 3 gleichzeitige Events → alle 3 nebeneinander sichtbar
4. **Teilweise Überlappung**: Event A 9-10, Event B 9:30-10:30 → korrekte Positionierung

#### Click-to-Create Tests
1. **Basic Click**: Auf 9 Uhr klicken → "+" Button erscheint bei 9:00-10:00
2. **Button Click**: Auf "+" Button klicken → Create-Seite mit 9:00-10:00 vorausgefüllt
3. **Escape**: "+" Button erscheint → Escape drücken → Button verschwindet
4. **Click woanders**: "+" Button erscheint → woanders klicken → Button verschwindet/verschiebt sich
5. **Event-Bereiche**: Klick auf bestehendes Event → Navigation zum Event (kein "+" Button)

#### Drag-to-Move Tests
1. **Basic Drag**: Event von 9:00 auf 14:00 ziehen → Event-Zeit wird aktualisiert
2. **Anderer Tag**: Event auf anderen Tag ziehen → Datum + Zeit werden aktualisiert
3. **Visuelles Feedback**: Während Drag → Event wird halbtransparent, Ziel wird hervorgehoben
4. **Cancel Drag**: Event ziehen + Escape → Event bleibt an ursprünglicher Position
5. **Überlappung**: Event auf bereits belegten Slot ziehen → Layout passt sich an

### Test-Protokoll Format

```markdown
## Test Results Summary

**Feature Tested:** [Feature name]
**Test Status:** ✅ PASSED | ❌ FAILED | ⚠️ PARTIAL
**URL Tested:** http://localhost:3000/organizations/{slug}/events

### Tests Performed
1. [Test description] - ✅/❌
2. [Test description] - ✅/❌

### Issues Found (if any)
- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **Description:** [Issue description]
- **Steps to Reproduce:** [Steps]
- **Console Errors:** [Any errors]
```
