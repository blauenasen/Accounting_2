# ARBEITSANWEISUNGEN FÜR CLAUDE

**WICHTIG:** Arbeite nach bestem Gewissen und Industriestandards. VERMEIDE TECHNICAL-DEBT und denke dabei immer an Martin Fowler!

---

## GRUNDREGELN

### Sprache
- **Chatsprache:** Deutsch
- **Code, Labels, Messages, Hilfen:** Nur Englisch (EN)

### Code-Qualität
- **Maximale Zeilen pro Modul:** 500 Zeilen
- Nur mit User-Bestätigung darf diese Regel überschritten werden
- Bei mehr als 500 Zeilen → Refactoring erforderlich
- Ampelsystem: >500 = rot, >300 = gelb, <=300 = grün

### Projektverzeichnis
- C:\Users\ejuli\Desktop\Projekt\Accounting

### Framework & Versionen
- **Svelte:** Version 4.x (NICHT Svelte 5!)
- **SvelteKit:** Kompatibel mit Svelte 4
- **Begründung:** Stabilität, ausgereifte Stores, bewährte Patterns

### Arbeitsweise
- Konzentriere dich auf die aktuelle Planumsetzung. Wenn dabei neue Aufgaben entstehen, notiere diese.
- Resets zu einem vorherigen Commit benötigen eine Eindeutige Zustimmung vom Nutzer

### Token-Management (KRITISCH!)
- **Stoppe bei ca. 150.000 Token Contextgröße** (von 200.000 max.)
- Erstelle Git-Commit des aktuellen Stands
- Melde: "Session beendet bei 150k Token."
- **User wechselt dann den Account** und nächster Claude übernimmt

---

## TECHNISCHE IMPLEMENTIERUNGSHINWEISE

### 1. State Management
**Problem:** Mehrere Features teilen gemeinsame Zustände (Markierung, Auszifferung, Split-Gruppierung)

**Lösung:**
- Svelte 4 Stores für globale Zustände verwenden
- Separate Stores pro Feature-Bereich:
  - `selectionStore.ts` - Mehrfachmarkierung in Tabellen
  - `splitStore.ts` - Split-Buchungen (Aufteilung von Rechnungen)
  - `matchingStore.ts` - Auszifferung (Open Items)
- Store-Actions für komplexe Logik (Validierung, Berechnung)

### 2. Validierung - Zentral

**Ansatz:**
```typescript
// lib/validation/splitValidation.ts
import Decimal from 'decimal.js';

interface Position {
  amount: number;
  description: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateSplitInvoice(
  positions: Position[],
  total: number,
  mode: 'gross' | 'net'
): ValidationResult {
  const errors: ValidationError[] = [];
  const sum = positions.reduce((acc, p) => new Decimal(acc).plus(p.amount), new Decimal(0));
  const diff = new Decimal(sum).minus(total).abs();

  if (diff.greaterThan(0.01)) {
    errors.push({ field: 'total', message: 'Sum mismatch' });
  }

  return { valid: errors.length === 0, errors };
}
```

**Vorteile:**
- Wiederverwendbar in UI und API
- Testbar isoliert
- Klare Fehler-Rückgaben
- 500-Zeilen-Regel wird eingehalten

### 3. Dialog-Komponenten - Shared Architecture

**Basis-Komponenten:**
```
lib/components/shared/
├── SplitDialogLayout.svelte       // 3-Bereiche-Layout
├── DynamicRowsTable.svelte        // Max. 10 Zeilen, auto-neue-Zeile
├── ValidationFooter.svelte        // Buttons + Info-Anzeige
└── ToggleSwitch.svelte            // Brutto/Netto, Account/Contra, etc.
```

### 4. Brutto/Netto-Berechnung - Präzision

**KRITISCH - Verwende decimal.js:**
```typescript
// FALSCH
const brutto = netto * 1.07;

// RICHTIG
import Decimal from 'decimal.js';

function calculateGross(net: number, taxRate: number = 1.07): number {
  return new Decimal(net).times(taxRate).toDecimalPlaces(2).toNumber();
}

const brutto = calculateGross(netto);
```

### 5. API-Design - Konsistenz

**Standard-Response:**
```json
{
  "ok": true | false,
  "data": { ... },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Sum mismatch",
    "details": { ... }
  }
}
```

**Error-Codes:**
- `VALIDATION_ERROR` - Allgemeine Eingabefehler
- `SPLIT_SUM_MISMATCH` - Split-Summe ≠ Gesamt-Rechnung
- `ACCOUNT_NOT_FOUND` - Konto existiert nicht
- `NOT_FOUND` - Ressource nicht gefunden
- `ALREADY_MATCHED` - Bereits ausgeziffert
- `UNAUTHORIZED` - Keine Berechtigung
- `INTERNAL_ERROR` - Server-Fehler

### 6. Datenbank-Transaktionen

**Atomic Operations:**
```typescript
import { nanoid } from 'nanoid';

interface Position {
  account: number;
  amount: number;
  description: string;
}

interface SplitData {
  positions: Position[];
  total: number;
}

interface SuccessResult {
  ok: true;
  splitId: string;
}

interface ErrorResult {
  ok: false;
  error: Error;
}

type Result = SuccessResult | ErrorResult;

async function createSplitInvoice(splitData: SplitData): Promise<Result> {
  const transaction = await db.transaction();
  try {
    const splitId = nanoid();
    for (const position of splitData.positions) {
      await transaction.execute(`INSERT INTO journal (...) VALUES (...)`, [..., splitId]);
    }
    await transaction.commit();
    return { ok: true, splitId };
  } catch (error) {
    await transaction.rollback();
    return { ok: false, error: error as Error };
  }
}
```

### 7. Performance

**Große Datensätze:**
- Pagination: Max. 100 Zeilen pro Seite
- Server-Side Filtering bevorzugen
- DB-Indizes auf kritische Felder
- Lazy Loading

### 8. Testing

**Coverage-Ziele (ACCOUNTING_2_PLAN.md):**
- Booking-Logik: **100%**
- Server/DB-Layer: **≥80%**
- Komponenten: **≥80%**

**Test-Stack:**
- **Vitest:** Unit & Integration Tests
- **Playwright:** E2E Tests (4 kritische Flows)
- **In-Memory DB:** Für API-Tests

**Pflicht pro Feature:**
1. Unit Tests für Validierungen & Berechnungen
2. Integration Tests für API-Endpoints
3. E2E Test für kritischen User-Flow

### 9. Error Handling

**User-Friendly:**
```typescript
catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Split validation failed:', error.message);
  }
  showMessage({
    type: 'error',
    text: 'Please check all positions have valid amounts'
  });
}
```

### 10. Incremental Development

**4 Phasen pro Feature:**
1. Static UI (Dummy-Daten)
2. Client-Side Logic (fiktive Daten)
3. API Integration
4. Testing & Refinement

### 11. TypeScript Best Practices

**Type Safety:**
```typescript
// Interfaces für Datenstrukturen
interface JournalEntry {
  id: string;
  date: string;
  account: number;
  amount: number;
  splitGroupId?: string;
}

// Typisierte Funktionen
function validateSplitInvoice(
  positions: Position[],
  total: number,
  mode: 'gross' | 'net'
): ValidationResult {
  // ...
}
```

**Regeln:**
- **Keine `any`** - außer begründet mit Kommentar
- **Interfaces** für alle Datenstrukturen
- **Union Types** für enums (`'gross' | 'net'`)

---

## BEST PRACTICES

### 1. Events für Kommunikation
```javascript
window.dispatchEvent(new CustomEvent('booking:...', { detail: {...} }));
```

### 2. Svelte 4 Reactivity & Lifecycle

**Reactive Statements:**
```javascript
$: displayRows = sortRows(filteredRows, sortState);
$: totalAmount = rows.reduce((sum, r) => sum + r.amount, 0);
```

**Lifecycle Hooks:**
```javascript
import { onMount, beforeUpdate, afterUpdate } from 'svelte';

onMount(() => {
  // Nach initialem Rendering - z.B. Event Listeners
});

beforeUpdate(() => {
  // Vor jedem DOM Update
});
```

### 3. Conditional Rendering
```svelte
{#if viewMode === 'primanota'}
  <PrimanotaView />
{:else if viewMode === 'account'}
  <AccountView />
{:else if viewMode === 'op'}
  <OpView />
{/if}
```

### 4. PropTypes Documentation (Svelte 4)

**JavaScript mit JSDoc:**
```svelte
<script>
  /** @type {JournalEntry[]} */
  export let rows = [];

  /** @type {'primanota'|'account'|'op'} */
  export let viewMode = 'primanota';
</script>
```

**TypeScript (bevorzugt):**
```svelte
<script lang="ts">
  import type { JournalEntry } from '$lib/types';

  export let rows: JournalEntry[] = [];
  export let viewMode: 'primanota' | 'account' | 'op' = 'primanota';
</script>
```

### 5. Svelte 4 Store Patterns

**Custom Stores mit Actions:**
```typescript
// lib/stores/selectionStore.ts
import { writable, type Writable } from 'svelte/store';

interface SelectionStore {
  subscribe: Writable<string[]>['subscribe'];
  select: (id: string) => void;
  deselect: (id: string) => void;
  clear: () => void;
}

function createSelectionStore(): SelectionStore {
  const { subscribe, set, update } = writable<string[]>([]);

  return {
    subscribe,
    select: (id: string) => update(ids => [...ids, id]),
    deselect: (id: string) => update(ids => ids.filter(i => i !== id)),
    clear: () => set([]),
  };
}

export const selection = createSelectionStore();
```

**In Komponenten nutzen:**
```svelte
<script lang="ts">
  import { selection } from '$lib/stores/selectionStore';
</script>

<button on:click={() => selection.select(row.id)}>Select</button>
{#if $selection.includes(row.id)}Selected{/if}
```

---

## RISIKEN & MITIGATION

### Scope Creep
- MVP zuerst, dann Erweiterungen

### Performance
- Pagination ab Tag 1
- Performance-Budget: Max. 200ms

### Rundungsdifferenzen
- decimal.js überall
- Toleranz: immer auf den Cent genau!

### Transaktionen
- ACID überall
- Rollback bei Fehler

### User versteht Features nicht
- Tooltips
- Klare Messages
- Undo-Funktion

### Svelte 5 Migration (Zukunft)
- **Aktuell:** Svelte 4 (stabil)
- **Risiko:** Svelte 5 Breaking Changes (Runes statt Stores)
- **Mitigation:**
  - Saubere Store-Architektur (einfacher migrierbar)
  - Komponenten < 500 Zeilen (kleine Refactorings)
  - TypeScript (Type-Safety bei Migration)

---

## ERFOLGSMETRIKEN

**Technisch:**
- ✅ Alle Module < 500 Zeilen
- ✅ Unit-Test Coverage ≥80%
- ✅ API < 500ms
- ✅ UI < 200ms

**Funktional:**
- ✅ Summen auf 2 Dezimalstellen genau
- ✅ Brutto = Summe Positionen (±0.01€)
- ✅ Auszifferung persistent

**UX:**
- ✅ Nutzbar ohne Anleitung
- ✅ Verständliche Fehler (EN)
- ✅ Keine Datenverluste

---

**Stand:** 2025-11-15
**Erstellt von:** Claude (Sonnet 4.5) + User
