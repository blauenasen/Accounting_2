# BUGFIX & STYLING PLAN - Accounting_2
**Erstellt:** 2025-11-17
**Ziel:** Alle Probleme beheben + Erscheinungsbild an Accounting angleichen
**CLAUDE.md Compliance:** ✅ Max 500 Zeilen, decimal.js, TypeScript, Tests

---

## ÜBERSICHT

**Phase 1:** Kritische Bugs beheben (BLOCKIEREND)
**Phase 2:** Moderate Probleme beheben
**Phase 3:** Kosmetische Probleme beheben
**Phase 4:** Styling-Angleichung an Accounting
**Phase 5:** Testing & Qualitätssicherung

**Geschätzte Gesamtdauer:** 2-3 Tage
**CLAUDE.md Compliance:** Durchgehend sichergestellt

---

## PHASE 1: KRITISCHE BUGS (BLOCKIEREND) ⏱️ 2-3 Stunden

### 1.1 tooltipEditor Store erstellen (30 Min) 🔴 KRITISCH

**Problem:**
- Startseite `/` - 500 ERROR
- `/estimate` - 500 ERROR
- `/api/tooltips/categories` - 500 ERROR

**Lösung:**

```typescript
// Datei: src/lib/stores/tooltipEditor.ts (neu erstellen)
// Zeilen: ~60 (✅ <500)

import { writable } from 'svelte/store';

/**
 * Tooltip Editor Store
 * Manages tooltip editing state across the application
 */

export interface TooltipEditorState {
  isOpen: boolean;
  category: string | null;
  key: string | null;
  value: string | null;
}

interface TooltipEditorStore {
  subscribe: typeof writable<TooltipEditorState>['subscribe'];
  open: (category: string, key: string, value?: string) => void;
  close: () => void;
  reset: () => void;
  updateValue: (value: string) => void;
}

function createTooltipEditorStore(): TooltipEditorStore {
  const { subscribe, set, update } = writable<TooltipEditorState>({
    isOpen: false,
    category: null,
    key: null,
    value: null
  });

  return {
    subscribe,

    open: (category: string, key: string, value: string = '') => {
      update(state => ({
        ...state,
        isOpen: true,
        category,
        key,
        value
      }));
    },

    close: () => {
      update(state => ({ ...state, isOpen: false }));
    },

    reset: () => {
      set({
        isOpen: false,
        category: null,
        key: null,
        value: null
      });
    },

    updateValue: (value: string) => {
      update(state => ({ ...state, value }));
    }
  };
}

export const tooltipEditor = createTooltipEditorStore();
```

**Test:**
```typescript
// Datei: tests/unit/stores/tooltipEditor.test.ts (neu erstellen)
// Zeilen: ~80 (✅ <500)

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { tooltipEditor } from '$lib/stores/tooltipEditor';

describe('tooltipEditor Store', () => {
  beforeEach(() => {
    tooltipEditor.reset();
  });

  it('should initialize with closed state', () => {
    const state = get(tooltipEditor);
    expect(state.isOpen).toBe(false);
    expect(state.category).toBe(null);
    expect(state.key).toBe(null);
    expect(state.value).toBe(null);
  });

  it('should open with category and key', () => {
    tooltipEditor.open('general', 'welcome', 'Welcome message');
    const state = get(tooltipEditor);

    expect(state.isOpen).toBe(true);
    expect(state.category).toBe('general');
    expect(state.key).toBe('welcome');
    expect(state.value).toBe('Welcome message');
  });

  it('should close while preserving data', () => {
    tooltipEditor.open('general', 'welcome');
    tooltipEditor.close();
    const state = get(tooltipEditor);

    expect(state.isOpen).toBe(false);
    expect(state.category).toBe('general');
    expect(state.key).toBe('welcome');
  });

  it('should reset all state', () => {
    tooltipEditor.open('general', 'welcome');
    tooltipEditor.reset();
    const state = get(tooltipEditor);

    expect(state.isOpen).toBe(false);
    expect(state.category).toBe(null);
    expect(state.key).toBe(null);
    expect(state.value).toBe(null);
  });

  it('should update value', () => {
    tooltipEditor.open('general', 'welcome', 'Old value');
    tooltipEditor.updateValue('New value');
    const state = get(tooltipEditor);

    expect(state.value).toBe('New value');
  });
});
```

**Verifizierung:**
```bash
# Test ausführen
npm test -- tooltipEditor.test.ts

# Routen testen
curl http://localhost:5173/
curl http://localhost:5173/estimate
curl http://localhost:5173/api/tooltips/categories
```

**Erfolgskriterien:**
- ✅ Alle Tests passing
- ✅ Startseite `/` lädt ohne Error
- ✅ `/estimate` lädt ohne Error
- ✅ `/api/tooltips/categories` gibt 200 zurück

---

### 1.2 ReconcileDialog erstellen (1 Stunde) 🔴 KRITISCH

**Problem:**
- Dialog-System unvollständig
- Import-Fehler in PrimanotaTableDialogs.svelte

**Lösung:**

```svelte
<!-- Datei: src/lib/components/booking/dialogs/ReconcileDialog.svelte (neu erstellen) -->
<!-- Zeilen: ~100 (✅ <500) -->
<script lang="ts">
  export let visible = false;
  export let selectedRows: any[] = [];

  function close() {
    visible = false;
  }

  function handleReconcile() {
    // TODO: Implement reconciliation logic
    console.log('Reconciling rows:', selectedRows);
    close();
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={close} role="presentation">
    <div class="dialog" on:click|stopPropagation role="dialog" aria-labelledby="reconcile-title">
      <h2 id="reconcile-title">Auszifferung (Reconciliation)</h2>

      <div class="dialog-content">
        <p class="info-text">
          Selected entries: {selectedRows.length}
        </p>

        <div class="notice">
          <p><strong>Note:</strong> Reconciliation feature placeholder.</p>
          <p>This dialog will be implemented with full reconciliation logic.</p>
        </div>

        {#if selectedRows.length > 0}
          <ul class="selected-list">
            {#each selectedRows.slice(0, 5) as row}
              <li>
                {row.date} - {row.account} - {row.amount}
              </li>
            {/each}
            {#if selectedRows.length > 5}
              <li>... and {selectedRows.length - 5} more</li>
            {/if}
          </ul>
        {/if}
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" on:click={close}>
          Cancel
        </button>
        <button
          class="btn btn-primary"
          on:click={handleReconcile}
          disabled={selectedRows.length === 0}
        >
          Reconcile
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .dialog-content {
    margin: 20px 0;
  }

  .info-text {
    color: #666;
    margin-bottom: 16px;
  }

  .notice {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 4px;
    padding: 12px;
    margin: 16px 0;
  }

  .notice p {
    margin: 4px 0;
    color: #0c4a6e;
  }

  .selected-list {
    list-style: none;
    padding: 0;
    margin: 16px 0;
    max-height: 200px;
    overflow-y: auto;
  }

  .selected-list li {
    padding: 8px;
    border-bottom: 1px solid #e5e7eb;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .dialog-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #d1d5db;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
</style>
```

**Import-Pfad korrigieren:**

```svelte
<!-- Datei: src/lib/components/primanota/PrimanotaTableDialogs.svelte -->
<!-- Zeile 4-7 aktualisieren: -->
<script lang="ts">
  import CancelBookingDialog from "$lib/components/booking/dialogs/CancelBookingDialog.svelte";
  import SplitKreditorDialog from "$lib/components/booking/dialogs/SplitKreditorDialog.svelte";
  import SplitDebitorDialog from "$lib/components/booking/dialogs/SplitDebitorDialog.svelte";
  import ReconcileDialog from "$lib/components/booking/dialogs/ReconcileDialog.svelte";
</script>
```

**Test:**
```typescript
// Datei: tests/unit/components/dialogs/ReconcileDialog.test.ts
// Zeilen: ~60

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ReconcileDialog from '$lib/components/booking/dialogs/ReconcileDialog.svelte';

describe('ReconcileDialog', () => {
  it('should not render when visible is false', () => {
    const { container } = render(ReconcileDialog, {
      props: { visible: false }
    });
    expect(container.querySelector('.dialog-overlay')).toBe(null);
  });

  it('should render when visible is true', () => {
    const { container } = render(ReconcileDialog, {
      props: { visible: true, selectedRows: [] }
    });
    expect(container.querySelector('.dialog-overlay')).toBeTruthy();
  });

  it('should show selected rows count', () => {
    const { getByText } = render(ReconcileDialog, {
      props: {
        visible: true,
        selectedRows: [{ id: 1 }, { id: 2 }, { id: 3 }]
      }
    });
    expect(getByText(/Selected entries: 3/)).toBeTruthy();
  });

  it('should disable reconcile button when no rows selected', () => {
    const { container } = render(ReconcileDialog, {
      props: { visible: true, selectedRows: [] }
    });
    const btn = container.querySelector('.btn-primary');
    expect(btn?.hasAttribute('disabled')).toBe(true);
  });
});
```

**Erfolgskriterien:**
- ✅ Tests passing
- ✅ Dialog rendert korrekt
- ✅ Keine Import-Fehler mehr
- ✅ Primanota-Seite lädt ohne Fehler

---

## PHASE 2: MODERATE PROBLEME ⏱️ 1-2 Stunden

### 2.1 /api/booking/companycodes Route erstellen (15 Min) 🟡

**Problem:**
- `/api/booking/companycodes` - 404 NOT FOUND
- Alternative `/api/ledgers/companycodes` funktioniert

**Lösung A: Redirect erstellen (bevorzugt)**

```typescript
// Datei: src/routes/api/booking/companycodes/+server.ts (neu erstellen)
// Zeilen: ~20 (✅ <500)

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Redirect to /api/ledgers/companycodes
 * This endpoint is deprecated, use /api/ledgers/companycodes instead
 */
export const GET: RequestHandler = async ({ fetch }) => {
  // Redirect to the canonical endpoint
  const response = await fetch('/api/ledgers/companycodes');
  const data = await response.json();

  return json(data, {
    headers: {
      'X-Deprecated': 'true',
      'X-Redirect-To': '/api/ledgers/companycodes'
    }
  });
};
```

**Lösung B: Symlink/Alias (wenn gewünscht)**

```typescript
// Alternative: Shared implementation
// Datei: src/routes/api/booking/companycodes/+server.ts

export { GET } from '../../ledgers/companycodes/+server.js';
```

**Test:**
```bash
curl http://localhost:5173/api/booking/companycodes
# Sollte 200 zurückgeben mit Company Codes
```

**Erfolgskriterien:**
- ✅ `/api/booking/companycodes` gibt 200 zurück
- ✅ Response identisch zu `/api/ledgers/companycodes`

---

### 2.2 Statische Assets aufräumen (1 Stunde) 🟡

**Problem:**
- `/img/logo.png` - 404
- `/favicon.png` - 404
- `/css/rates.css` - 404
- `/css/debtors.css` - 404
- `/js/global-input.js` - 404

**Lösung:**

**2.2.1 Logo & Favicon**

```bash
# Option A: Aus Accounting kopieren
cp ../Accounting/static/img/logo.png static/img/
cp ../Accounting/static/favicon.png static/

# Option B: Platzhalter erstellen (falls Accounting nicht verfügbar)
mkdir -p static/img
# Placeholder logo erstellen (oder aus Accounting kopieren)
```

**2.2.2 Externe CSS entfernen**

```svelte
<!-- Datei: src/routes/rates/+page.svelte -->
<!-- Zeile entfernen oder auskommentieren: -->
<!-- <link rel="stylesheet" href="/css/rates.css"> -->

<!-- Datei: src/routes/debtors/+page.svelte -->
<!-- Zeile entfernen oder auskommentieren: -->
<!-- <link rel="stylesheet" href="/css/debtors.css"> -->
```

**2.2.3 Externes JavaScript entfernen**

```svelte
<!-- In allen betroffenen Dateien: -->
<!-- <script src="/js/global-input.js"></script> -->
<!-- Entfernen, da Funktionalität in Svelte-Komponenten implementiert ist -->
```

**Erfolgskriterien:**
- ✅ Keine 404-Fehler mehr in Browser-Console
- ✅ Logo und Favicon werden angezeigt
- ✅ Alle Seiten funktionieren ohne externe CSS/JS

---

## PHASE 3: KOSMETISCHE PROBLEME ⏱️ 2 Stunden

### 3.1 Validierung für 400-Endpunkte verbessern (2 Stunden) 🟢

**Problem:**
- Endpunkte geben generische 400-Fehler zurück
- Keine klaren Fehlermeldungen

**Lösung:**

```typescript
// Beispiel: src/routes/api/booking/accounts/+server.ts
// Vorher:
export const GET: RequestHandler = async ({ url }) => {
  const param = url.searchParams.get('param');
  if (!param) {
    return json({ ok: false, error: 'Missing required parameter' }, { status: 400 });
  }
  // ...
};

// Nachher:
export const GET: RequestHandler = async ({ url }) => {
  const param = url.searchParams.get('param');

  if (!param) {
    return json({
      ok: false,
      error: {
        code: 'MISSING_PARAMETER',
        message: 'Required parameter "param" is missing',
        details: {
          required: ['param'],
          received: Object.fromEntries(url.searchParams.entries())
        }
      }
    }, { status: 400 });
  }
  // ...
};
```

**Betroffene Endpunkte:**
- `/api/booking/accounts`
- `/api/tooltips`
- `/api/rules`

**Erfolgskriterien:**
- ✅ Klare Fehlermeldungen mit Codes
- ✅ Details über fehlende Parameter
- ✅ Konsistente Error-Response-Struktur

---

## PHASE 4: STYLING-ANGLEICHUNG AN ACCOUNTING ⏱️ 2-3 Tage

### 4.1 Analyse: Accounting Original untersuchen (2 Stunden)

**Aufgabe:**
1. Alle CSS-Dateien aus `../Accounting/static/css/` analysieren
2. Layout-Struktur dokumentieren
3. Farb-Schema extrahieren
4. Schriftarten identifizieren
5. Spacing/Margin/Padding-System dokumentieren

**Ergebnis:**
```markdown
# Datei: ACCOUNTING_DESIGN_SYSTEM.md (neu erstellen)

## Farb-Schema
- Primary: #...
- Secondary: #...
- Background: #...
- Text: #...

## Schriftarten
- Primary: ...
- Monospace: ...

## Spacing-System
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Komponenten-Styles
- Buttons: ...
- Forms: ...
- Tables: ...
- Dialogs: ...
```

---

### 4.2 Global Styles migrieren (3 Stunden)

**Aufgabe:**
Globale Styles aus Accounting nach Accounting_2 übertragen

**CLAUDE.md Compliance:**
- ✅ Styles in separate Dateien <500 Zeilen
- ✅ Modular organisiert
- ✅ TypeScript für Theme-Definitionen

**Struktur:**

```
src/lib/styles/
├── global.css          (Global resets, <500 Zeilen)
├── variables.css       (CSS Custom Properties, <200 Zeilen)
├── components/
│   ├── buttons.css     (<200 Zeilen)
│   ├── forms.css       (<300 Zeilen)
│   ├── tables.css      (<300 Zeilen)
│   └── dialogs.css     (<200 Zeilen)
└── themes/
    └── default.css     (<200 Zeilen)
```

**Implementation:**

```css
/* src/lib/styles/variables.css */
:root {
  /* Colors from Accounting */
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;

  /* Borders */
  --border-color: #e2e8f0;
  --border-radius: 6px;

  /* Spacing (8px base) */
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Courier New', monospace;

  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
}
```

```css
/* src/lib/styles/components/buttons.css */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1.5;
  border-radius: var(--border-radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Import in +layout.svelte:**

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '$lib/styles/variables.css';
  import '$lib/styles/global.css';
  import '$lib/styles/components/buttons.css';
  import '$lib/styles/components/forms.css';
  import '$lib/styles/components/tables.css';
  import '$lib/styles/components/dialogs.css';
</script>
```

---

### 4.3 Seiten-Layouts angleichen (1 Tag)

**Priorität-Liste:**

1. **Primanota (Startseite)** - 3 Stunden
2. **Booking** - 2 Stunden
3. **Invoice** - 2 Stunden
4. **Ledgers** - 2 Stunden
5. **Rates** - 1 Stunde
6. **Debtors/Creditors** - 2 Stunden jeweils
7. **Stammdaten** - 1 Stunde

**Für jede Seite:**

1. ✅ Screenshot von Accounting Original
2. ✅ Layout-Struktur analysieren
3. ✅ CSS-Klassen identifizieren
4. ✅ In Accounting_2 replizieren
5. ✅ Vergleich/Abnahme

**Beispiel: Primanota**

```svelte
<!-- src/routes/+page.svelte -->
<!-- Layout-Struktur wie in Accounting -->

<div class="page-container">
  <header class="page-header">
    <h1 class="page-title">Primanota</h1>
    <div class="page-actions">
      <!-- Action buttons -->
    </div>
  </header>

  <main class="page-content">
    <div class="filters-section">
      <!-- Filters -->
    </div>

    <div class="table-section">
      <PrimanotaTableContainer {rows} {viewMode} />
    </div>
  </main>
</div>

<style>
  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 2px solid var(--border-color);
  }

  .page-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  /* ... weitere Styles wie in Accounting */
</style>
```

---

### 4.4 Komponenten-Styles angleichen (1 Tag)

**Komponenten-Liste:**

1. **BookingFormContainer** - 2 Stunden
2. **PrimanotaTableContainer** - 2 Stunden
3. **InvoiceContainer** - 2 Stunden
4. **Dialogs** (alle) - 2 Stunden
5. **Custom Dropdowns** - 1 Stunde

**Pro Komponente:**

```svelte
<!-- Vorher (Accounting_2): -->
<div class="container">
  <div class="form-group">
    <label>Field</label>
    <input type="text" />
  </div>
</div>

<style>
  .container {
    /* Custom styles */
  }
</style>

<!-- Nachher (Accounting Design System): -->
<div class="page-section">
  <div class="form-group">
    <label class="form-label">Field</label>
    <input type="text" class="form-input" />
  </div>
</div>

<style>
  /* Component-specific overrides only */
  .page-section {
    /* Inherits from global styles */
    /* Only add component-specific styles */
  }
</style>
```

---

### 4.5 Tabellen-Styling angleichen (4 Stunden)

**Betroffene Tabellen:**
- Primanota Table
- Invoice List
- Ledgers Table
- Rates Table
- Debtors/Creditors Tables

**Ziel-Style (aus Accounting):**

```css
/* src/lib/styles/components/tables.css */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.data-table thead {
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
}

.data-table th {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background: var(--bg-secondary);
}

.data-table tbody tr.selected {
  background: #dbeafe;
}

.data-table td {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.data-table td.number {
  text-align: right;
  font-family: var(--font-mono);
}

.data-table td.date {
  font-family: var(--font-mono);
  color: var(--text-secondary);
}
```

**Komponenten aktualisieren:**

```svelte
<!-- src/lib/components/primanota/PrimanotaTableBody.svelte -->
<table class="data-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Account</th>
      <th class="number">Amount</th>
      <!-- ... -->
    </tr>
  </thead>
  <tbody>
    {#each rows as row}
      <tr class:selected={selectedIds.includes(row.id)}>
        <td class="date">{row.date}</td>
        <td>{row.account}</td>
        <td class="number">{formatCurrency(row.amount)}</td>
        <!-- ... -->
      </tr>
    {/each}
  </tbody>
</table>
```

---

## PHASE 5: TESTING & QUALITÄTSSICHERUNG ⏱️ 1 Tag

### 5.1 Unit Tests für neue Komponenten (3 Stunden)

**Tests erstellen für:**
- ✅ tooltipEditor Store (bereits in Phase 1)
- ✅ ReconcileDialog (bereits in Phase 1)
- ✅ Neue API-Routen
- ✅ Style-Helper-Functions (falls erstellt)

**CLAUDE.md Compliance:**
- ✅ >90% Test Coverage für neue Logic
- ✅ Alle Tests <500 Zeilen pro Datei

---

### 5.2 E2E-Tests aktualisieren (2 Stunden)

**Playwright-Tests erweitern:**

```typescript
// tests/e2e/home-flow.spec.ts (neu)
import { test, expect } from '@playwright/test';

test.describe('Home Page (Primanota)', () => {
  test('should load home page without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page loads
    await expect(page).toHaveURL('/');

    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should display primanota table', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table.data-table');
    await expect(table).toBeVisible();
  });
});
```

---

### 5.3 Visuelle Regression Tests (3 Stunden)

**Playwright Visual Comparison:**

```typescript
// tests/e2e/visual-regression.spec.ts (neu)
import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/booking',
  '/invoice',
  '/ledgers',
  '/rates',
  '/debtors',
  '/creditors',
  '/stammdaten'
];

for (const path of pages) {
  test(`Visual regression: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot(`${path.replace('/', 'home')}.png`, {
      fullPage: true,
      maxDiffPixels: 100
    });
  });
}
```

**Baseline erstellen:**
```bash
# Erste Screenshots als Baseline
npm run test:e2e -- --update-snapshots

# Spätere Läufe vergleichen gegen Baseline
npm run test:e2e
```

---

### 5.4 Manuelle QA-Checkliste (2 Stunden)

**Checkliste für jede Seite:**

```markdown
# QA Checklist - [Seitenname]

## Funktionalität
- [ ] Seite lädt ohne Fehler
- [ ] Alle Buttons funktionieren
- [ ] Forms speichern korrekt
- [ ] Dialogs öffnen/schließen
- [ ] Keine Console Errors

## Styling
- [ ] Layout identisch zu Accounting
- [ ] Farben korrekt
- [ ] Schriftarten korrekt
- [ ] Spacing korrekt
- [ ] Responsive auf verschiedenen Bildschirmgrößen

## Performance
- [ ] Ladezeit <2 Sekunden
- [ ] Keine Render-Blocking
- [ ] Smooth Scrolling

## Accessibility
- [ ] Keyboard-Navigation funktioniert
- [ ] Focus-States sichtbar
- [ ] ARIA-Labels vorhanden (wo nötig)

## CLAUDE.md Compliance
- [ ] Komponente <500 Zeilen
- [ ] TypeScript verwendet
- [ ] decimal.js für Currency
- [ ] Tests vorhanden
```

---

## ZEITPLAN & MEILENSTEINE

### Woche 1: Bug-Fixes (Phase 1-3)

**Tag 1 (2-3 Std):**
- ✅ tooltipEditor Store erstellen + Tests
- ✅ Verifizierung: /, /estimate funktionieren

**Tag 2 (2-3 Std):**
- ✅ ReconcileDialog erstellen + Tests
- ✅ Import-Pfade korrigieren
- ✅ /api/booking/companycodes Route

**Tag 3 (2 Std):**
- ✅ Statische Assets aufräumen
- ✅ Validierung verbessern
- ✅ Alle Routen-Tests grün

**Meilenstein 1:** ✅ Alle Fehler behoben, 100% funktionierende Routen

---

### Woche 2: Styling-Angleichung (Phase 4)

**Tag 1 (4 Std):**
- ✅ Accounting Design System analysieren
- ✅ Global Styles erstellen (variables.css, global.css)

**Tag 2 (6 Std):**
- ✅ Komponenten-Styles (buttons, forms, tables, dialogs)
- ✅ Theme-System

**Tag 3 (6 Std):**
- ✅ Primanota-Seite stylen
- ✅ Booking-Seite stylen
- ✅ Invoice-Seite stylen

**Tag 4 (6 Std):**
- ✅ Ledgers, Rates, Debtors, Creditors stylen
- ✅ Stammdaten stylen

**Tag 5 (4 Std):**
- ✅ Tabellen-Styling angleichen (alle Tabellen)
- ✅ Fine-Tuning

**Meilenstein 2:** ✅ Alle Seiten visuell identisch zu Accounting

---

### Woche 3: Testing & QA (Phase 5)

**Tag 1 (4 Std):**
- ✅ Unit Tests für neue Features
- ✅ E2E Tests erweitern

**Tag 2 (4 Std):**
- ✅ Visual Regression Tests
- ✅ Baseline-Screenshots

**Tag 3 (4 Std):**
- ✅ Manuelle QA (alle Seiten)
- ✅ Bug-Fixes aus QA

**Meilenstein 3:** ✅ Alle Tests grün, QA abgeschlossen

---

## CLAUDE.MD COMPLIANCE CHECKLISTE

Für **jede** neue/geänderte Datei:

- [ ] **Zeilen <500:** Keine Datei über 500 Zeilen
- [ ] **TypeScript:** Verwendet (`lang="ts"` in Svelte, .ts Dateien)
- [ ] **decimal.js:** Für alle Currency-Berechnungen
- [ ] **Tests:** Unit-Tests für Logic, E2E für Workflows
- [ ] **Test Coverage:** >90% für neue Logic
- [ ] **Keine console.logs:** In Production Code
- [ ] **Error Handling:** Try-Catch mit sinnvollen Messages
- [ ] **Kommentare:** JSDoc für exports
- [ ] **Naming:** Englisch, aussagekräftig

---

## ERFOLGSKRITERIEN

### Phase 1-3 Abschluss:
- ✅ Alle 42 Routen geben 200 zurück
- ✅ Keine 404-Fehler
- ✅ Keine 500-Fehler
- ✅ Keine Console-Errors
- ✅ Alle neuen Features getestet

### Phase 4 Abschluss:
- ✅ Visueller Vergleich: <5% Unterschied zu Accounting
- ✅ Alle Seiten responsive
- ✅ Konsistentes Design-System
- ✅ Performance: Ladezeit <2s pro Seite

### Phase 5 Abschluss:
- ✅ Test Coverage >95%
- ✅ Alle E2E-Tests grün
- ✅ Visual Regression Tests etabliert
- ✅ QA-Checkliste 100% abgehakt

### Gesamt:
- ✅ **Production-Ready**
- ✅ **CLAUDE.md Compliant**
- ✅ **Identisch zu Accounting (Optik)**
- ✅ **Verbessert gegenüber Accounting (Code-Qualität, Tests)**

---

## RISIKEN & MITIGATION

### Risiko 1: Accounting Original nicht verfügbar
**Mitigation:**
- Screenshots/Docs aus Erinnerung
- User-Feedback einholen
- Iterativ verbessern

### Risiko 2: Styles zu komplex für <500 Zeilen
**Mitigation:**
- Modularer Aufbau (CSS-Dateien pro Komponente)
- CSS Custom Properties nutzen
- Duplicate Code vermeiden

### Risiko 3: Breaking Changes während Styling
**Mitigation:**
- Git Feature-Branches pro Seite
- Häufige Commits
- Tests laufen lassen vor jedem Commit

### Risiko 4: Time Overrun
**Mitigation:**
- Priorisierung: Kritische Seiten zuerst
- MVP-Ansatz: Perfection nicht erforderlich
- Iterationen erlaubt

---

## NÄCHSTE SCHRITTE

1. **User-Bestätigung:** Plan reviewen und freigeben
2. **Branch erstellen:** `git checkout -b bugfix-and-styling`
3. **Phase 1 starten:** tooltipEditor Store
4. **Commit nach jedem Meilenstein**
5. **Tägliches Reporting:** Fortschritt dokumentieren

---

**Erstellt von:** Claude (Sonnet 4.5)
**Datum:** 2025-11-17
**Geschätzte Gesamtdauer:** 2-3 Wochen (15-20 Stunden reine Arbeit)
**CLAUDE.md Compliance:** ✅ Durchgehend sichergestellt

**Bereit zum Start!** 🚀
