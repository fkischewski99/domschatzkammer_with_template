# Feature: GUIDE Rolle (Basis)

## Zusammenfassung

Fügt die GUIDE-Rolle (Domführer) zum bestehenden Berechtigungssystem hinzu. Dies ist die Basis für alle weiteren Domführer-Features.

---

## Anforderungen

### Funktional
- Neue Rolle `GUIDE` zwischen `MEMBER` und `ADMIN`
- Guides können von Admins ernannt werden
- Guides können per Einladung direkt als Guide eingeladen werden
- Rolle wird in der Mitgliederliste angezeigt

### Berechtigungs-Hierarchie
```
OWNER > ADMIN > GUIDE > MEMBER
```

---

## Technische Änderungen

### 1. Prisma Schema

**Datei:** `packages/database/prisma/schema.prisma`

```prisma
enum Role {
  MEMBER @map("member")
  GUIDE  @map("guide")    // NEU
  ADMIN  @map("admin")
}
```

**Migration:** `add-guide-role`

---

### 2. Permission Functions

**Datei:** `packages/auth/src/permissions.ts`

```typescript
// Neue Funktionen
export async function isOrganizationGuide(
  userId: string,
  organizationId: string
): Promise<boolean>

export async function isOrganizationGuideOrAbove(
  userId: string,
  organizationId: string
): Promise<boolean>
```

---

### 3. Change Role Action

**Datei:** `apps/dashboard/actions/members/change-role.ts`

- GUIDE als gültige Rolle hinzufügen
- Validierung: Nur ADMIN/OWNER können GUIDE-Rolle vergeben

---

### 4. Invitation System

**Datei:** `apps/dashboard/components/members/invite-member-modal.tsx`

- GUIDE als auswählbare Rolle in Einladungs-Modal hinzufügen

---

### 5. UI Updates

**Dateien:**
- `apps/dashboard/components/members/member-role-badge.tsx` - Badge für GUIDE
- `apps/dashboard/components/members/member-list.tsx` - GUIDE-Rolle anzeigen
- `apps/dashboard/components/members/change-role-modal.tsx` - GUIDE als Option

---

### 6. i18n

**Dateien:** `apps/dashboard/messages/en.json`, `de.json`

```json
{
  "labels": {
    "role": {
      "member": "Member",
      "guide": "Guide / Domführer",
      "admin": "Admin"
    }
  }
}
```

---

## Implementierungs-Schritte

1. [ ] Prisma Schema: Role enum erweitern
2. [ ] Migration ausführen
3. [ ] Permission Functions hinzufügen
4. [ ] Change Role Schema/Action aktualisieren
5. [ ] Invitation Modal aktualisieren
6. [ ] Role Badge Komponente aktualisieren
7. [ ] i18n Strings hinzufügen (en + de)
8. [ ] Typecheck & Test

---

## Dateien (Übersicht)

| Datei | Aktion |
|-------|--------|
| `packages/database/prisma/schema.prisma` | Ändern |
| `packages/auth/src/permissions.ts` | Ändern |
| `apps/dashboard/actions/members/change-role.ts` | Ändern |
| `apps/dashboard/schemas/members/change-role-schema.ts` | Ändern |
| `apps/dashboard/components/members/invite-member-modal.tsx` | Ändern |
| `apps/dashboard/components/members/member-role-badge.tsx` | Ändern |
| `apps/dashboard/messages/en.json` | Ändern |
| `apps/dashboard/messages/de.json` | Ändern |

---

## Abhängigkeiten

- Keine (Basis-Feature)

## Wird benötigt von

- Feature 005: Guide Availability
- Feature 006: Event Guide Assignment
- Feature 007: Ticket Validation
