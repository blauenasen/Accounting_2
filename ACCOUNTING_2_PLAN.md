# MIGRATIONS-PLAN: Accounting → Accounting_2

**Stand:** 2025-11-15
**Erstellt von:** Claude (Sonnet 4.5)
**Status:** ✅ Plan genehmigt, Fragen beantwortet, bereit für Phase 1

---

## ZUSAMMENFASSUNG

**Ziel:** Projekt komplett neu aufsetzen mit sauberer Struktur, 500-Zeilen-Regel, 90% Test-Coverage, ohne Test/Debug-Code

**Strategie:** Hybrid - Neues SvelteKit-Projekt + Feature-by-Feature Migration
**DB-Migration:** Schema-Optimierung (neue Spalten für Split/Reconcile Features)
**Priorität:** Migration zuerst, Features pausieren
**Technologie:** TypeScript + Vitest + Playwright
**Dauer:** 26 Arbeitstage (21 Basis + 5 TypeScript-Migration)

---

## IST-ZUSTAND: Accounting (Aktuell)

### Projekt-Statistik

**Dependencies (Accounting_2):**
- `better-sqlite3`: ^12.2.0
- `decimal.js`: ^10.6.0 (✅ WIRD GENUTZT für alle Berechnungen!)
- `imapflow`: ^1.0.196
- `nanoid`: ^5.0.4 (✅ Ersetzt uuid - kleiner & schneller)
- `nodemailer`: ^7.0.6
- `puppeteer`: ^24.20.0
- `xlsx`: ^0.18.5

**Größenverteilung:**
- **Gesamt:** ~200 Dateien (.svelte + .js)
- **Größte Dateien:**
  - BookingForm.svelte: **2195 Zeilen** (4,4x Regel-Verletzung!)
  - PrimanotaTable.svelte: **1527 Zeilen** (3,0x Regel-Verletzung!)
  - invoice/+page.svelte: **817 Zeilen** (1,6x Regel-Verletzung!)
  - Alle anderen: <500 Zeilen ✅

**Production Features:** 18 (Booking, Invoice, Primanota, Ledgers, Email, PDF, etc.)
**Test/Debug Code:** 5 Routen (selftest, mock, dry-run) + viele console.logs
**Test Coverage (Accounting):** **0%** (keine Tests vorhanden!)

**Test Coverage (Accounting_2 Ziel):**
- Booking-Logic: **100%**
- Server/DB: **>= 80%**
- Validation: **100%**
- Utils: **>= 90%**
- E2E (Playwright): **3+ kritische Flows**

---

## SOLL-ZUSTAND: Accounting_2

### Ziele

1. ✅ **Alle Module <500 Zeilen** (ohne Ausnahmen!)
2. ✅ **90% Test Coverage** (Unit + Integration Tests)
3. ✅ **Kein Test/Debug-Code** in Production
4. ✅ **Saubere Ordnerstruktur** (logic, server, components getrennt)
5. ✅ **decimal.js nutzen** (Brutto/Netto-Berechnungen!)
6. ✅ **DB-Schema optimiert** (neue Spalten für Split/Reconcile)
7. ✅ **TypeScript** (volle Type-Safety)
8. ✅ **Vitest integriert** (Unit + Integration Tests)
9. ✅ **Playwright integriert** (E2E-Tests)
10. ✅ **nanoid** (UUID-Ersatz - kleiner & schneller)

---

## ORDNERSTRUKTUR ACCOUNTING_2

```
Accounting_2/
├── src/
│   ├── lib/
│   │   ├── components/              # UI-Komponenten (max 500 Zeilen)
│   │   │   ├── booking/
│   │   │   │   ├── form/            # BookingForm aufgeteilt (2195→650 Zeilen)
│   │   │   │   │   ├── BookingFormContainer.svelte (~200)
│   │   │   │   │   ├── BookingFormFields.svelte (~300)
│   │   │   │   │   └── BookingFormValidation.svelte (~150)
│   │   │   │   ├── primanota/       # PrimanotaTable aufgeteilt (1527→1200 Zeilen)
│   │   │   │   │   ├── PrimanotaContainer.svelte (~150)
│   │   │   │   │   ├── PrimanotaTable.svelte (~250)
│   │   │   │   │   ├── PrimanotaHeader.svelte (~200)
│   │   │   │   │   ├── PrimanotaFilters.svelte (~250)
│   │   │   │   │   ├── PrimanotaBody.svelte (~150)
│   │   │   │   │   ├── PrimanotaRow.svelte (~100)
│   │   │   │   │   └── PrimanotaContextMenu.svelte (~100)
│   │   │   │   ├── dialogs/         # 13 Dialoge
│   │   │   │   └── controls/        # 10 Controls
│   │   │   ├── invoice/             # Invoice aufgeteilt (817→950 Zeilen)
│   │   │   │   ├── InvoiceContainer.svelte (~200)
│   │   │   │   ├── InvoiceForm.svelte (~300)
│   │   │   │   ├── InvoiceList.svelte (~250)
│   │   │   │   └── InvoicePositions.svelte (~200)
│   │   │   ├── ledgers/             # 3 Komponenten
│   │   │   └── shared/              # Wiederverwendbare Komponenten
│   │   ├── logic/                   # Business Logic (KEINE UI!)
│   │   │   ├── booking/             # 9 Module (~350 Zeilen/Modul)
│   │   │   ├── primanota/           # 6 Module (~250 Zeilen/Modul)
│   │   │   ├── invoice/             # Neu zu erstellen
│   │   │   └── split/               # Neue Features
│   │   ├── server/                  # Backend Logic
│   │   │   ├── db/                  # 7 Module (DB-Zugriff)
│   │   │   ├── booking/             # 6 Module
│   │   │   ├── email/               # 7 Module (OHNE mock/selftest!)
│   │   │   ├── pdf-generator.js
│   │   │   ├── invoice-to-journal.js
│   │   │   ├── companycodes.js
│   │   │   ├── schema.js
│   │   │   └── index.js (~150)
│   │   ├── stores/                  # Svelte Stores
│   │   │   ├── viewModeStore.js
│   │   │   ├── selectionStore.js
│   │   │   ├── splitStore.js        # NEU
│   │   │   ├── matchingStore.js     # NEU
│   │   │   └── mailStatus.js
│   │   ├── utils/                   # Hilfsfunktionen
│   │   ├── validation/              # Shared Validations
│   │   └── actions/                 # Svelte Actions
│   ├── routes/                      # Pages + API
│   │   ├── api/
│   │   │   ├── booking/             # 28 Endpoints
│   │   │   ├── invoice/             # 2 Endpoints
│   │   │   ├── ledgers/             # 2 Endpoints
│   │   │   ├── tooltips/            # 3 Endpoints
│   │   │   └── rules/               # 1 Endpoint
│   │   ├── booking/+page.svelte
│   │   ├── invoice/+page.svelte
│   │   ├── estimate/+page.svelte
│   │   ├── ledgers/+page.svelte
│   │   ├── creditors/+page.svelte
│   │   ├── debtors/+page.svelte
│   │   ├── rates/+page.svelte
│   │   ├── stammdaten/+page.svelte
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── hooks.server.js
├── tests/                           # KOMPLETT NEU! (90% Coverage-Ziel)
│   ├── unit/
│   │   ├── logic/                   # ~50 Test-Dateien
│   │   ├── server/                  # ~20 Test-Dateien
│   │   └── validation/              # ~5 Test-Dateien
│   ├── integration/
│   │   ├── api/                     # ~10 Test-Dateien
│   │   └── db/                      # ~5 Test-Dateien
│   └── setup.js
├── db.sqlite                        # Migriert + Schema optimiert
├── package.json
├── svelte.config.js
├── vite.config.js
├── vitest.config.js                 # NEU!
└── README.md
```

---

## FEATURES-INVENTAR

### ✅ Production Features (MIGRIEREN)

**Booking (Kern-Feature):**
- BookingForm mit Account-Verwaltung
- Primanota-Tabelle (3 Ansichten: Primanota, Konto, OP)
- Book Circle-System
- PDF-Attachment zu Buchungen
- Split Kreditor/Debitor Dialoge
- Reconcile (Auszifferung)
- Storno/Cancel Buchungen
- Duplicate-Check
- Account-Validation mit Ranges
- Keyboard-Navigation
- Filter & Sortierung (Primanota)
- Context-Menu (Primanota)

**Invoice:**
- Rechnungen erstellen/bearbeiten
- Estimates (Angebote)
- Positionen-Verwaltung
- PDF-Generierung (Puppeteer)
- Email-Versand (Nodemailer + IMAP)
- Handover to Booking
- Invoice-Status-Tracking
- Email-Event-Tracking

**Ledgers (Stammdaten):**
- SKR04 Accounts
- Company Codes (Buchungskreise)
- Account Rules

**Master Data:**
- Debtors/Creditors
- Rates
- Email-Account Config
- Tooltips (Admin-Host)

### ❌ Test/Debug Code (ENTFERNEN)

**Email-Test-Routes:**
- `/routes/email/selftest/+page.svelte` + `+server.js`
- `/routes/email/mock/+page.svelte`
- `/routes/email/mock-deliver/+server.js`
- `/routes/email/dry-run/+server.js`

**Alte Backup-Dateien:**
- `src/lib/server/index.js.original`

**Debug-Code:**
- Alle `console.log()` Statements (>100 Stellen!)
- Nicht genutzte Imports

---

## GRÖßENVERLETZUNGEN (500-Zeilen-Regel)

### ❗ KRITISCH (>1000 Zeilen)

1. **BookingForm.svelte: 2195 Zeilen**
   - **Aufteilen in:**
     - `BookingFormContainer.svelte` (~200 Zeilen) - Orchestrator
     - `BookingFormFields.svelte` (~300 Zeilen) - Input-Felder
     - `BookingFormValidation.svelte` (~150 Zeilen) - Validation + Error-Display
     - Controls als separate Komponenten (bereits vorhanden)
     - Dialoge als separate Komponenten (bereits vorhanden)
   - **Logik extrahiert nach:** `src/lib/logic/booking/` (9 Module, bereits erledigt!)

2. **PrimanotaTable.svelte: 1527 Zeilen**
   - **Aufteilen in:**
     - `PrimanotaContainer.svelte` (~150 Zeilen) - Orchestrator
     - `PrimanotaTable.svelte` (~250 Zeilen) - Tabellen-Struktur
     - `PrimanotaHeader.svelte` (~200 Zeilen) - Sortierung (bereits vorhanden, migrieren!)
     - `PrimanotaFilters.svelte` (~250 Zeilen) - Filter-UI (bereits vorhanden, migrieren!)
     - `PrimanotaBody.svelte` (~150 Zeilen) - Tbody Rendering (bereits vorhanden, migrieren!)
     - `PrimanotaRow.svelte` (~100 Zeilen) - Einzelne Zeile (bereits vorhanden, migrieren!)
     - `PrimanotaContextMenu.svelte` (~100 Zeilen) - Context-Menu (bereits vorhanden, migrieren!)
   - **Logik extrahiert nach:** `src/lib/logic/primanota/` (6 Module, bereits erledigt!)

3. **invoice/+page.svelte: 817 Zeilen**
   - **Aufteilen in:**
     - `InvoiceContainer.svelte` (~200 Zeilen) - Orchestrator
     - `InvoiceForm.svelte` (~300 Zeilen) - Formular
     - `InvoiceList.svelte` (~250 Zeilen) - Liste (bereits vorhanden, migrieren!)
     - `InvoicePositions.svelte` (~200 Zeilen) - Positionen (bereits vorhanden, migrieren!)
     - `invoice/components/` - Unterkomponenten (invoiceActionBar, invoiceHeaderFields, etc.)
   - **Logik:** In `src/lib/logic/invoice/` extrahieren (neu zu erstellen!)

### ✅ MODERAT (Alle anderen <500 Zeilen)

Alle anderen Komponenten halten die 500-Zeilen-Regel ein! 🎉

---

## DATENBANK-MIGRATION

### Aktuelle Tabellen (aus db.sqlite)

- `journal` - Haupt-Buchungs-Tabelle
- `invoice` - Rechnungen
- `invoice_db` - Rechnungs-Positionen
- `estimate` - Angebote
- `estimate_db` - Angebots-Positionen
- `debtors` - Debitoren
- `creditors` - Kreditoren
- `rates` - Stundensätze
- `stammdaten` - Unternehmensdaten
- `skr04_accounts` - SKR04-Kontenplan
- `skr04_companycodes` - Buchungskreise
- `skr04_rules` - Account-Regeln
- `email_account` - Email-Konfiguration
- `email_events` - Email-Status-Tracking
- `tooltips` - Tooltip-Definitionen

### Neue Spalten (Journal-Tabelle)

```sql
-- Split-Buchungen (Features B & C aus claude.md)
ALTER TABLE journal ADD COLUMN split_type VARCHAR(20);        -- 'kreditor' | 'debitor' | NULL
ALTER TABLE journal ADD COLUMN split_group_id VARCHAR(50);    -- UUID für Gruppierung
ALTER TABLE journal ADD COLUMN split_total DECIMAL(15,2);     -- Gesamt-Betrag der Split-Gruppe

-- Auszifferung / Reconciliation (Features D & E aus claude.md)
ALTER TABLE journal ADD COLUMN match_id VARCHAR(50);          -- UUID für Match-Gruppierung
ALTER TABLE journal ADD COLUMN match_type CHAR(1);            -- 'A' = Automatisch, 'M' = Manuell
ALTER TABLE journal ADD COLUMN match_date DATE;               -- Datum der Auszifferung

-- Performance-Indizes
CREATE INDEX idx_split_group ON journal(split_group_id);
CREATE INDEX idx_match_id ON journal(match_id);
CREATE INDEX idx_creditor_open ON journal(creditor_id, match_id);  -- Für OP-Liste (Offene Posten)
CREATE INDEX idx_debtor_open ON journal(debtor_id, match_id);      -- Für OP-Liste (Offene Posten)
CREATE INDEX idx_year_month ON journal(jahr, monat);               -- Für Monats-Filter
CREATE INDEX idx_book_circle ON journal(bookCircle);               -- Für BC-Filter
```

### Migration-Strategie

1. **Kopieren:** `db.sqlite` nach `Accounting_2/db.sqlite`
2. **Backup:** `db.sqlite.backup` erstellen (automatisch)
3. **Schema erweitern:** Neue Spalten + Indizes via `schema.js`
4. **Validieren:** Alle Tabellen prüfen, PRAGMA integrity_check
5. **Testen:** Mit Test-Queries verifizieren

---

## UNIT-TEST-STRATEGIE (90% Coverage-Ziel)

### Test-Framework: Vitest + Testing Library

**Dependencies (devDependencies):**
```json
{
  "vitest": "^2.0.0",
  "@vitest/ui": "^2.0.0",
  "@vitest/coverage-v8": "^2.0.0",
  "@testing-library/svelte": "^5.0.0",
  "happy-dom": "^15.0.0"
}
```

**vitest.config.js:**
```javascript
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/routes/',  // Pages werden nicht getestet
        '**/*.svelte'    // Komponenten nur optional
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      }
    }
  }
});
```

### Test-Kategorien & Coverage-Ziele

**1. Logic Tests (Prio 1 - PFLICHT 100%)**
```
tests/unit/logic/
├── booking/
│   ├── accountLoader.test.js          → 100% Coverage
│   ├── accountHelpers.test.js         → 100% Coverage
│   ├── formSubmission.test.js         → 100% Coverage
│   ├── taxCalculations.test.js        → 100% Coverage
│   ├── pdfHandler.test.js             → 95% Coverage
│   ├── keyboardHelpers.test.js        → 100% Coverage
│   ├── dialogHandlers.test.js         → 95% Coverage
│   ├── formStateManager.test.js       → 100% Coverage
│   └── selectionHandler.test.js       → 95% Coverage
├── primanota/
│   ├── filtering.test.js              → 100% Coverage
│   ├── sorting.test.js                → 100% Coverage
│   ├── calculations.test.js           → 100% Coverage
│   ├── transformations.test.js        → 100% Coverage
│   ├── formatting.test.js             → 100% Coverage
│   └── validation.test.js             → 100% Coverage
└── split/
    ├── splitValidation.test.js        → 100% Coverage
    └── splitCalculations.test.js      → 100% Coverage
```

**2. Server Tests (Prio 2 - Ziel 85%)**
```
tests/unit/server/
├── db/
│   ├── journal.test.js                → 90% Coverage
│   ├── invoices.test.js               → 85% Coverage
│   ├── estimates.test.js              → 80% Coverage
│   ├── debtors.test.js                → 85% Coverage
│   ├── creditors.test.js              → 85% Coverage
│   ├── stammdaten.test.js             → 80% Coverage
│   └── rates.test.js                  → 85% Coverage
└── booking/
    ├── account-rules.test.js          → 85% Coverage
    ├── account-sources.test.js        → 85% Coverage
    ├── accounts-store.test.js         → 90% Coverage
    ├── primanota.test.js              → 85% Coverage
    ├── rules-store.test.js            → 85% Coverage
    └── validation.test.js             → 100% Coverage
```

**3. Validation Tests (Prio 1 - PFLICHT 100%)**
```
tests/unit/validation/
├── splitValidation.test.js            → 100% Coverage
└── formValidation.test.js             → 100% Coverage
```

**4. Utils Tests (Prio 2 - Ziel 90%)**
```
tests/unit/utils/
├── dateFormat.test.js                 → 100% Coverage
├── errors.test.js                     → 90% Coverage
└── formatting.test.js                 → 95% Coverage
```

**5. Integration Tests (Prio 3)**
```
tests/integration/
├── api/
│   ├── booking-flow.test.js           → End-to-End Booking
│   ├── invoice-flow.test.js           → End-to-End Invoice
│   └── split-flow.test.js             → Split-Buchungen Flow
└── db/
    └── transactions.test.js           → DB-Transaktionen (ACID)
```

**6. Component Tests (Nice-to-have)**
```
tests/unit/components/
├── dialogs/
│   ├── SplitKreditorDialog.test.js    → 80% Coverage
│   └── ReconcileDialog.test.js        → 80% Coverage
└── forms/
    └── BookingFormFields.test.js      → 70% Coverage
```

### Beispiel-Tests

**Beispiel 1: Logic Test (accountLoader.js)**
```javascript
// tests/unit/logic/booking/accountLoader.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadAccountsForSide, syncCompanyCode } from '$lib/logic/booking/accountLoader';

describe('accountLoader', () => {
  let accountState;
  let form;

  beforeEach(() => {
    accountState = {
      HK: { bookCircle: null, accounts: [], lookup: new Map(), range: {}, loading: null },
      CK: { bookCircle: null, accounts: [], lookup: new Map(), range: {}, loading: null }
    };
    form = {
      bookCircle: '',
      account: '',
      contra: '',
      // ... andere Felder
    };
  });

  describe('loadAccountsForSide', () => {
    it('should load accounts for valid book circle', async () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ok: true,
            accounts: [
              { account: 10000, designation: 'Test Account', filterNo: 1, category: 'A', source: 'SKR04' }
            ],
            meta: { range: { from: 10000, to: 19999 } }
          })
        })
      );

      const result = await loadAccountsForSide('HK', 10, accountState, form, false, false);

      expect(result.HK.accounts).toHaveLength(1);
      expect(result.HK.accounts[0].account).toBe(10000);
      expect(result.HK.bookCircle).toBe(10);
      expect(result.HK.range.from).toBe(10000);
      expect(result.HK.range.to).toBe(19999);
    });

    it('should auto-fill when only 1 account available and accountLocked=false', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ok: true,
            accounts: [{ account: 1800, designation: 'Single Account', filterNo: 1, category: 'A', source: 'SKR04' }],
            meta: { range: { from: 1800, to: 1800 } }
          })
        })
      );

      const result = await loadAccountsForSide('HK', 30, accountState, form, false, false);

      expect(form.account).toBe('1800');  // Auto-filled!
      expect(result.HK.accounts).toHaveLength(1);
    });

    it('should skip auto-fill when skipAutoFill=true (except if locked)', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ok: true,
            accounts: [
              { account: 70000, designation: 'Account 1', filterNo: 1, category: 'B', source: 'SKR04' },
              { account: 70001, designation: 'Account 2', filterNo: 1, category: 'B', source: 'SKR04' }
            ],
            meta: { range: { from: 70000, to: 99999 } }
          })
        })
      );

      const result = await loadAccountsForSide('CK', 10, accountState, form, true, false);

      expect(form.contra).toBe('');  // Nicht automatisch gefüllt wegen skipAutoFill=true
      expect(result.CK.accounts).toHaveLength(2);
    });

    it('should handle invalid book circle gracefully', async () => {
      const result = await loadAccountsForSide('HK', 0, accountState, form, false, false);

      expect(result.HK.bookCircle).toBeNull();
      expect(result.HK.accounts).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ ok: false, error: 'NOT_FOUND' })
        })
      );

      const result = await loadAccountsForSide('HK', 99, accountState, form, false, false);

      expect(result.HK.bookCircle).toBeNull();
      expect(result.HK.accounts).toHaveLength(0);
    });
  });

  describe('syncCompanyCode', () => {
    it('should reset when book circle is invalid', async () => {
      const result = await syncCompanyCode(0, null, null, accountState, form, false, vi.fn());

      expect(result.accountLocked).toBe(false);
      expect(result.companyCodeAccount).toBeNull();
    });

    it('should return null when already loaded', async () => {
      const result = await syncCompanyCode(10, 10, null, accountState, form, false, vi.fn());

      expect(result).toBeNull();
    });
  });
});
```

**Beispiel 2: Validation Test (splitValidation.js)**
```javascript
// tests/unit/validation/splitValidation.test.js
import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { validateSplitInvoice } from '$lib/validation/splitValidation';

describe('splitValidation', () => {
  describe('validateSplitInvoice', () => {
    it('should validate correct split with matching total', () => {
      const positions = [
        { amount: new Decimal('100.00'), account: 10000 },
        { amount: new Decimal('50.00'), account: 10001 },
        { amount: new Decimal('30.50'), account: 10002 }
      ];
      const total = new Decimal('180.50');

      const result = validateSplitInvoice(positions, total, 'brutto');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when sum does not match total', () => {
      const positions = [
        { amount: new Decimal('100.00'), account: 10000 },
        { amount: new Decimal('50.00'), account: 10001 }
      ];
      const total = new Decimal('180.50');  // Summe = 150.00 ≠ 180.50

      const result = validateSplitInvoice(positions, total, 'brutto');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('total');
      expect(result.errors[0].message).toContain('Sum mismatch');
    });

    it('should allow 1 cent tolerance', () => {
      const positions = [
        { amount: new Decimal('100.00'), account: 10000 },
        { amount: new Decimal('50.00'), account: 10001 },
        { amount: new Decimal('30.49'), account: 10002 }
      ];
      const total = new Decimal('180.50');  // Summe = 180.49, Diff = 0.01

      const result = validateSplitInvoice(positions, total, 'brutto');

      expect(result.valid).toBe(true);  // Toleranz 0.01€
    });

    it('should fail when positions are empty', () => {
      const result = validateSplitInvoice([], new Decimal('100.00'), 'brutto');

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('positions');
    });

    it('should fail when accounts are missing', () => {
      const positions = [
        { amount: new Decimal('100.00') }  // account fehlt!
      ];

      const result = validateSplitInvoice(positions, new Decimal('100.00'), 'brutto');

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('account');
    });
  });
});
```

**Beispiel 3: Integration Test (booking-flow.test.js)**
```javascript
// tests/integration/api/booking-flow.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '$lib/server/index.js';

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    // Reset test database
    db.exec('DELETE FROM journal WHERE jahr = 9999');  // Test-Jahr
  });

  it('should complete full booking flow', async () => {
    // 1. POST /api/booking (Create booking)
    const createResponse = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookCircle: 10,
        gu: 1,
        turnover: 100.00,
        sh: 'S',
        contra: 70000,
        reference: '12345',
        date: '2025-01-15',
        account: 10000,
        tax: 0,
        jahr: 9999,
        monat: 1,
        desc: 'Test Booking'
      })
    });

    expect(createResponse.ok).toBe(true);
    const createData = await createResponse.json();
    expect(createData.ok).toBe(true);
    expect(createData.idNr).toBeDefined();

    const idNr = createData.idNr;

    // 2. GET /api/booking/primanota (Verify in Primanota)
    const primanotaResponse = await fetch(`/api/booking/primanota?jahr=9999&monat=1`);
    const primanotaData = await primanotaResponse.json();

    expect(primanotaData.ok).toBe(true);
    expect(primanotaData.rows).toContainEqual(
      expect.objectContaining({ idNr, desc: 'Test Booking' })
    );

    // 3. POST /api/booking/cancel (Cancel booking)
    const cancelResponse = await fetch('/api/booking/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNr })
    });

    expect(cancelResponse.ok).toBe(true);

    // 4. Verify cancellation created Storno entry
    const stornoResponse = await fetch(`/api/booking/primanota?jahr=9999&monat=1`);
    const stornoData = await stornoResponse.json();

    expect(stornoData.rows).toContainEqual(
      expect.objectContaining({
        desc: expect.stringContaining('STORNO'),
        turnover: -100.00
      })
    );
  });
});
```

### Test-Ausführung

```bash
# Alle Tests
npm run test

# Mit Coverage
npm run test:coverage

# Watch Mode
npm run test:watch

# UI Mode (interaktiv)
npm run test:ui

# Nur Logic Tests
npm run test tests/unit/logic

# Coverage-Report öffnen
npm run test:coverage && open coverage/index.html
```

**package.json Scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## ABLAUFPLAN (12 Phasen, 21 Tage)

### Phase 1: Setup (Tag 1)
**Ziel:** Neues Projekt-Skeleton erstellen

- [ ] 1.1 Neues SvelteKit-Projekt initialisieren: `npm create svelte@latest Accounting_2`
- [ ] 1.2 Git-Repository initialisieren: `git init`
- [ ] 1.3 Dependencies installieren (package.json aus Plan kopieren)
- [ ] 1.4 Vitest konfigurieren (vitest.config.js erstellen)
- [ ] 1.5 Ordnerstruktur anlegen (alle Verzeichnisse aus Plan)
- [ ] 1.6 README.md erstellen
- [ ] 1.7 .gitignore anpassen (db.sqlite, node_modules, .svelte-kit, coverage)
- [ ] 1.8 Erster Commit: "chore: Initialize Accounting_2 project"

**Ergebnis:** Leeres Projekt mit Struktur + Git + Vitest ✅

---

### Phase 2: Datenbank (Tag 2)
**Ziel:** DB migrieren und Schema optimieren

- [ ] 2.1 `db.sqlite` aus Accounting kopieren
- [ ] 2.2 `db.sqlite.backup` erstellen
- [ ] 2.3 `schema.js` migrieren (neue Spalten hinzufügen)
- [ ] 2.4 Migrations-Skript ausführen (ALTER TABLE + CREATE INDEX)
- [ ] 2.5 DB-Struktur validieren (PRAGMA integrity_check)
- [ ] 2.6 `src/lib/server/index.js` migrieren (DB-Connection)
- [ ] 2.7 Test-Query ausführen (SELECT * FROM journal LIMIT 1)
- [ ] 2.8 Commit: "feat: Migrate database with optimized schema"

**Ergebnis:** DB funktioniert, neue Spalten vorhanden ✅

---

### Phase 3: Server Foundation (Tag 3-4)
**Ziel:** Backend-Layer komplett migrieren

**Tag 3:**
- [ ] 3.1 `src/lib/server/db/stammdaten.js` migrieren + Test
- [ ] 3.2 `src/lib/server/db/rates.js` migrieren + Test
- [ ] 3.3 `src/lib/server/db/debtors.js` migrieren + Test
- [ ] 3.4 `src/lib/server/db/creditors.js` migrieren + Test
- [ ] 3.5 Commit: "feat: Migrate server/db modules (stammdaten, rates, debtors, creditors)"

**Tag 4:**
- [ ] 3.6 `src/lib/server/db/journal.js` migrieren + Test
- [ ] 3.7 `src/lib/server/db/invoices.js` migrieren + Test
- [ ] 3.8 `src/lib/server/db/estimates.js` migrieren + Test
- [ ] 3.9 `src/lib/server/booking/*.js` migrieren (6 Module)
- [ ] 3.10 `src/lib/server/companycodes.js` migrieren + Test
- [ ] 3.11 Coverage-Check: Server/DB >= 85%
- [ ] 3.12 Commit: "feat: Complete server foundation migration"

**Ergebnis:** Alle Server-Module migriert, 85% Coverage ✅

---

### Phase 4: Logic Foundation (Tag 5-6)
**Ziel:** Business-Logic komplett migrieren + Tests

**Tag 5: Booking Logic**
- [ ] 4.1 `src/lib/logic/booking/accountHelpers.js` migrieren + Test (100%)
- [ ] 4.2 `src/lib/logic/booking/accountLoader.js` migrieren + Test (100%)
- [ ] 4.3 `src/lib/logic/booking/formStateManager.js` migrieren + Test (100%)
- [ ] 4.4 `src/lib/logic/booking/taxCalculations.js` migrieren + Test (100%)
- [ ] 4.5 `src/lib/logic/booking/formSubmission.js` migrieren + Test (100%)
- [ ] 4.6 Commit: "feat: Migrate booking logic (5 modules, 100% coverage)"

**Tag 6: Primanota Logic + Utils**
- [ ] 4.7 `src/lib/logic/booking/pdfHandler.js` migrieren + Test (95%)
- [ ] 4.8 `src/lib/logic/booking/keyboardHelpers.js` migrieren + Test (100%)
- [ ] 4.9 `src/lib/logic/booking/dialogHandlers.js` migrieren + Test (95%)
- [ ] 4.10 `src/lib/logic/booking/selectionHandler.js` migrieren + Test (95%)
- [ ] 4.11 `src/lib/logic/primanota/*.js` migrieren (6 Module) + Tests (100%)
- [ ] 4.12 `src/lib/utils/*.js` migrieren + Tests (90%)
- [ ] 4.13 `src/lib/validation/splitValidation.js` erstellen + Test (100%)
- [ ] 4.14 Coverage-Check: Logic >= 95%
- [ ] 4.15 Commit: "feat: Complete logic foundation (15 modules, 95% coverage)"

**Ergebnis:** Alle Logic-Module migriert, 95% Coverage ✅

---

### Phase 5: Stores (Tag 7)
**Ziel:** Svelte Stores migrieren + neue erstellen

- [ ] 5.1 `src/lib/stores/viewModeStore.js` migrieren + Test
- [ ] 5.2 `src/lib/stores/selectionStore.js` migrieren + Test
- [ ] 5.3 `src/lib/stores/mailStatus.js` migrieren + Test
- [ ] 5.4 `src/lib/stores/splitStore.js` erstellen + Test (NEU!)
- [ ] 5.5 `src/lib/stores/matchingStore.js` erstellen + Test (NEU!)
- [ ] 5.6 Store-Integration-Tests schreiben
- [ ] 5.7 Commit: "feat: Migrate stores + add splitStore & matchingStore"

**Ergebnis:** Alle Stores verfügbar, getestet ✅

---

### Phase 6: Booking-Form Refactoring (Tag 8-10)
**Ziel:** BookingForm.svelte von 2195 → 650 Zeilen aufteilen

**Tag 8: Form-Container**
- [ ] 6.1 `BookingFormContainer.svelte` erstellen (~200 Zeilen)
  - Orchestriert alle Sub-Komponenten
  - State-Management
  - Event-Handling
- [ ] 6.2 `BookingFormFields.svelte` migrieren (~300 Zeilen)
  - Alle Input-Felder
  - Keyboard-Navigation
- [ ] 6.3 Test: Formular-Rendering + Basic-Input
- [ ] 6.4 Commit: "refactor: Split BookingForm into Container + Fields"

**Tag 9: Validation + Dialoge**
- [ ] 6.5 `BookingFormValidation.svelte` erstellen (~150 Zeilen)
  - Validation-Error-Display
  - Duplicate-Warning
  - Date-Mismatch-Handling
- [ ] 6.6 Alle 13 Dialoge migrieren:
  - AccountSelectionDialog ✅
  - DuplicateWarningDialog ✅
  - DateMonthMismatchDialog ✅
  - YearMismatchDialog ✅
  - PdfOverwriteDialog ✅
  - PdfDeleteDialog ✅
  - DeleteBookingDialog1 ✅
  - DeleteBookingDialog2 ✅
  - CancelBookingDialog ✅
  - BookCircleDialog ✅
  - ValidationErrorDialog ✅
  - ReconciliationConfirmDialog ✅
  - (ReconcileDialog → später bei Primanota)
- [ ] 6.7 Commit: "refactor: Add BookingFormValidation + migrate 12 dialogs"

**Tag 10: Controls + Integration**
- [ ] 6.8 Controls migrieren (10 Komponenten):
  - YearMonthControls ✅
  - BookCircleControls ✅
  - AccountBalanceFields ✅
  - AccountSumFields ✅
  - AccountSideToggle ✅
  - OpFilterToggle ✅
  - OpAccountDropdown ✅
  - AccountNavigation ✅
  - BookingButtons ✅
  - AccountInfoDisplay ✅
- [ ] 6.9 BookingForm-Integration testen (alle Komponenten zusammen)
- [ ] 6.10 Zeilen-Check: Kein Modul >500 Zeilen?
- [ ] 6.11 Commit: "refactor: Complete BookingForm refactoring (2195→650 lines)"

**Ergebnis:** BookingForm aufgeteilt, alle Module <500 Zeilen ✅

---

### Phase 7: Primanota Refactoring (Tag 11-13)
**Ziel:** PrimanotaTable.svelte von 1527 → 1200 Zeilen aufteilen

**Tag 11: Table-Container**
- [ ] 7.1 `PrimanotaContainer.svelte` erstellen (~150 Zeilen)
  - View-Mode-Switching (Primanota/Konto/OP)
  - Event-Dispatching
  - State-Management
- [ ] 7.2 `PrimanotaTable.svelte` migrieren (~250 Zeilen)
  - Tabellen-Struktur
  - Header + Body Integration
- [ ] 7.3 Commit: "refactor: Create PrimanotaContainer + PrimanotaTable"

**Tag 12: Header + Filters**
- [ ] 7.4 `PrimanotaHeader.svelte` migrieren (~200 Zeilen) ✅ (bereits vorhanden)
- [ ] 7.5 `PrimanotaFilters.svelte` migrieren (~250 Zeilen) ✅ (bereits vorhanden)
- [ ] 7.6 Filter-Logic-Tests erweitern (Edge-Cases)
- [ ] 7.7 Commit: "refactor: Migrate PrimanotaHeader + PrimanotaFilters"

**Tag 13: Body + Row + Context-Menu**
- [ ] 7.8 `PrimanotaBody.svelte` migrieren (~150 Zeilen) ✅ (bereits vorhanden)
- [ ] 7.9 `PrimanotaRow.svelte` migrieren (~100 Zeilen) ✅ (bereits vorhanden)
- [ ] 7.10 `PrimanotaContextMenu.svelte` migrieren (~100 Zeilen) ✅ (bereits vorhanden)
- [ ] 7.11 `ReconcileDialog.svelte` migrieren (fehlte in Phase 6)
- [ ] 7.12 `SplitKreditorDialog.svelte` migrieren ✅
- [ ] 7.13 `SplitDebitorDialog.svelte` migrieren ✅
- [ ] 7.14 Integration-Test: Primanota-Tabelle komplett
- [ ] 7.15 Zeilen-Check: Kein Modul >500 Zeilen?
- [ ] 7.16 Commit: "refactor: Complete Primanota refactoring (1527→1200 lines)"

**Ergebnis:** PrimanotaTable aufgeteilt, alle Module <500 Zeilen ✅

---

### Phase 8: Invoice Module (Tag 14-15)
**Ziel:** Invoice-Page von 817 → 950 Zeilen aufteilen + Email migrieren

**Tag 14: Invoice-Komponenten**
- [ ] 8.1 `InvoiceContainer.svelte` erstellen (~200 Zeilen)
  - View-Switching (List/Form)
  - State-Management
- [ ] 8.2 `InvoiceForm.svelte` erstellen (~300 Zeilen)
  - Formular-Logic
  - Position-Handling
- [ ] 8.3 `InvoiceList.svelte` migrieren (~250 Zeilen) ✅ (bereits vorhanden)
- [ ] 8.4 `InvoicePositions.svelte` migrieren (~200 Zeilen) ✅ (bereits vorhanden)
- [ ] 8.5 Invoice-Unterkomponenten migrieren:
  - invoiceActionBar ✅
  - invoiceEstimateNumbers ✅
  - invoiceHeaderFields ✅
  - invoiceSendModal ✅
  - invoiceStatusBar ✅
  - invoiceTotalsBox ✅
- [ ] 8.6 Commit: "refactor: Split Invoice page (817→950 lines)"

**Tag 15: PDF + Email (OHNE Debug!)**
- [ ] 8.7 `src/lib/server/pdf-generator.js` migrieren + Test
- [ ] 8.8 `src/lib/server/invoice-to-journal.js` migrieren + Test
- [ ] 8.9 `src/lib/server/email/*.js` migrieren (7 Module, OHNE mock/selftest!)
  - index.js ✅
  - provider.js ✅
  - sendAndCommitInvoice.js ✅
  - composeInvoiceMail.js ✅
  - eventStore.js ✅
  - appendToSent.js ✅
  - dsn.js ✅
  - ❌ NICHT: signature.js (wenn nur für Mock/Test)
  - ❌ NICHT: parseWebhook.js (wenn nur für Mock/Test)
  - ❌ NICHT: templates.js (wenn nur für Mock/Test)
  - ❌ NICHT: statusMap.js (wenn nur für Mock/Test)
  - ❌ NICHT: subject.js (wenn nur für Mock/Test)
- [ ] 8.10 Invoice-Logic erstellen (`src/lib/logic/invoice/`)
  - invoiceCalculations.js (Brutto/Netto mit decimal.js!)
  - invoiceValidation.js
  - invoiceFormatting.js
- [ ] 8.11 Invoice-Logic-Tests (100% Coverage)
- [ ] 8.12 Commit: "feat: Migrate invoice modules + email (no debug code)"

**Ergebnis:** Invoice komplett, PDF + Email funktionieren, kein Debug-Code ✅

---

### Phase 9: Routing & Pages (Tag 16-17)
**Ziel:** Alle Pages + API-Routes migrieren (OHNE Test-Routes!)

**Tag 16: API-Routes**
- [ ] 9.1 `/api/booking/` migrieren (28 Endpoints):
  - account-details ✅
  - account-taxgroup ✅
  - account-totals ✅
  - accounts ✅
  - allaccounts ✅
  - allowed-accounts ✅
  - attach-pdf ✅
  - balance-open ✅
  - cancel ✅
  - check-duplicate ✅
  - companycodes ✅
  - delete ✅
  - delete-pdf ✅
  - op-accounts ✅
  - pdf ✅
  - primanota ✅
  - reconcile ✅
  - split-kreditor ✅
  - split-debitor ✅
  - taxgroups ✅
  - unreconcile ✅
  - ... (weitere)
- [ ] 9.2 `/api/invoice/` migrieren (2 Endpoints):
  - handover-to-booking ✅
  - pdf ✅
- [ ] 9.3 `/api/ledgers/` migrieren (2 Endpoints):
  - accounts ✅
  - companycodes ✅
- [ ] 9.4 `/api/tooltips/` migrieren (3 Endpoints):
  - +server.js ✅
  - categories/+server.js ✅
  - keys/+server.js ✅
- [ ] 9.5 `/api/rules/` migrieren (1 Endpoint) ✅
- [ ] 9.6 ❌ NICHT migrieren:
  - /routes/email/selftest/
  - /routes/email/mock/
  - /routes/email/mock-deliver/
  - /routes/email/dry-run/
- [ ] 9.7 API-Integration-Tests schreiben
- [ ] 9.8 Commit: "feat: Migrate all API routes (36 endpoints, no test routes)"

**Tag 17: Pages**
- [ ] 9.9 `/booking/+page.svelte` erstellen (nutzt BookingFormContainer + PrimanotaContainer)
- [ ] 9.10 `/invoice/+page.svelte` erstellen (nutzt InvoiceContainer)
- [ ] 9.11 `/estimate/+page.svelte` migrieren
- [ ] 9.12 `/ledgers/+page.svelte` migrieren
- [ ] 9.13 `/creditors/+page.svelte` migrieren
- [ ] 9.14 `/debtors/+page.svelte` migrieren
- [ ] 9.15 `/rates/+page.svelte` migrieren
- [ ] 9.16 `/stammdaten/+page.svelte` migrieren
- [ ] 9.17 `+layout.svelte` migrieren (Menu-Integration)
- [ ] 9.18 `+page.svelte` (Dashboard) migrieren
- [ ] 9.19 Commit: "feat: Migrate all pages (9 routes)"

**Ergebnis:** Alle Routes migriert, kein Debug-Code ✅

---

### Phase 10: Shared Components (Tag 18)
**Ziel:** Ledgers + Shared Components + Actions

- [ ] 10.1 Ledgers-Komponenten migrieren:
  - LedgerAccounts.svelte ✅
  - LedgerCompanyCodes.svelte ✅
  - LedgerRules.svelte ✅
- [ ] 10.2 Shared-Komponenten migrieren:
  - SplitDialogLayout.svelte ✅
  - DynamicRowsTable.svelte ✅
  - ToastContainer.svelte ✅
  - TooltipAdminHost.svelte ✅
  - TooltipEditorModal.svelte ✅
  - Letter.svelte ✅
  - LetterPreview.svelte ✅
  - InvoiceLetter.svelte ✅
  - SendForm.svelte ✅
  - SendButton.svelte ✅
  - SendStatusBadge.svelte ✅
  - CustomDropdown.svelte ✅
  - RateDropdown.svelte ✅
  - offer.svelte ✅
- [ ] 10.3 Actions migrieren:
  - focusTrap.js ✅
  - tip.js ✅
- [ ] 10.4 `+menu.svelte` migrieren
- [ ] 10.5 `hooks.server.js` migrieren
- [ ] 10.6 `settings.js` migrieren
- [ ] 10.7 Commit: "feat: Migrate shared components + actions + menu"

**Ergebnis:** Alle Shared Components migriert ✅

---

### Phase 11: Integration Testing (Tag 19-20)
**Ziel:** End-to-End Testing + Coverage-Ziel erreichen

**Tag 19: Flow-Tests**
- [ ] 11.1 Booking-Flow Integration-Test:
  - Create Booking → Verify in Primanota → Cancel → Verify Storno
- [ ] 11.2 Invoice-Flow Integration-Test:
  - Create Invoice → Add Positions → Generate PDF → Send Email → Handover to Booking
- [ ] 11.3 Split-Flow Integration-Test:
  - Create Split Kreditor → Verify Positions → Reconcile
- [ ] 11.4 Commit: "test: Add integration flow tests"

**Tag 20: Coverage-Review**
- [ ] 11.5 `npm run test:coverage` ausführen
- [ ] 11.6 Coverage-Report analysieren:
  - Logic >= 95%?
  - Server >= 85%?
  - Validation = 100%?
  - Utils >= 90%?
- [ ] 11.7 Lücken schließen (fehlende Tests ergänzen)
- [ ] 11.8 Coverage-Badges generieren
- [ ] 11.9 Commit: "test: Achieve 90% coverage threshold"

**Ergebnis:** 90% Coverage erreicht ✅

---

### Phase 12: Cleanup & Final (Tag 21)
**Ziel:** Production-Ready machen

- [ ] 12.1 **Cleanup:**
  - Alle `console.log()` entfernen (Search: "console.log")
  - Ungenutzte Imports entfernen (ESLint)
  - Kommentierte Code-Blöcke löschen
- [ ] 12.2 **Code-Review:**
  - Alle Module <500 Zeilen? (Stichproben)
  - decimal.js wird genutzt? (taxCalculations.js, invoiceCalculations.js)
  - Keine Test-Routes vorhanden?
- [ ] 12.3 **Dependencies aufräumen:**
  - `package.json` prüfen (nur Production-Dependencies?)
  - `npm audit` ausführen
  - Veraltete Packages updaten
- [ ] 12.4 **README.md schreiben:**
  - Project Overview
  - Setup Instructions
  - Test Commands
  - Deployment Guide
- [ ] 12.5 **Deployment-Konfiguration:**
  - `adapter-auto` oder `adapter-node`?
  - `.env.example` erstellen
  - Build testen: `npm run build`
- [ ] 12.6 **Final Checks:**
  - `npm run test` → Alle Tests grün?
  - `npm run build` → Build erfolgreich?
  - `npm run preview` → App läuft?
- [ ] 12.7 **Git:**
  - Final Commit: "chore: Production-ready cleanup"
  - Tag: `v2.0.0`
  - Push: `git push origin main --tags`

**Ergebnis:** Accounting_2 ist Production-Ready! 🎉

---

## KRITISCHE ERFOLGSFAKTOREN

### ✅ Muss erfüllt sein

1. **Alle Module <500 Zeilen** (keine Ausnahmen!)
2. **90% Test Coverage** (Logic + Server)
3. **Kein Debug-Code** (keine console.logs, keine Test-Routes)
4. **decimal.js genutzt** (Brutto/Netto-Berechnungen!)
5. **DB-Schema erweitert** (Split + Reconcile Spalten)
6. **Build erfolgreich** (`npm run build` funktioniert)

### ⚠️ Nice-to-have

- TypeScript-Migration (optional, nicht in 21 Tagen)
- E2E-Tests mit Playwright (optional)
- Component-Tests mit Testing-Library (optional)

---

## RISIKEN & MITIGATION

### Risiko 1: Zeit überschreitet 21 Tage
**Mitigation:**
- Phasen priorisieren: 1-7 = kritisch, 8-10 = wichtig, 11-12 = optional
- Bei Verzug: Phase 11-12 auf "nach Go-Live" verschieben

### Risiko 2: Coverage <90%
**Mitigation:**
- Logic-Tests = Prio 1 (einfach zu testen, 100% Ziel)
- Server-Tests = Prio 2 (80% OK)
- Integration-Tests = Nice-to-have

### Risiko 3: Bugs in Accounting entdeckt während Migration
**Mitigation:**
- Bugs in ACCOUNTING_2_BUGS.md dokumentieren
- Erst nach Migration fixen (nicht während!)
- Oder: Quick-Fix in Accounting, dann migrieren

### Risiko 4: Unerwartete Dependencies
**Mitigation:**
- Grep nach allen Imports: `grep -r "from '\$lib" src/`
- Dependency-Graph erstellen
- Module in richtiger Reihenfolge migrieren

---

## ✅ FRAGEN BEANTWORTET (2025-11-15)

### A. Datenbank & Migration

**Frage A1:** Sollen bestehende Journal-Einträge mit `split_group_id`/`match_id` nachträglich befüllt werden?
- [x] Ja, nach Kriterium: nicht gesperrt
- [ ] Nein, nur neue Einträge nutzen neue Spalten

**Frage A2:** Soll vor Migration ein automatisches Backup erstellt werden?
- [x] Ja, automatisch vor jedem Schema-Change
- [ ] Nein, manuelles Backup reicht

**Frage A3:** Was passiert mit `db.sqlite` im alten Projekt nach Migration?
- [x] Umbenennen zu `db_old.sqlite`
- [ ] Komplett löschen
- [ ] Unverändert lassen

---

### B. Features & Funktionalität

**Frage B1:** Email Mock/Selftest-Routes werden entfernt - alternative Test-Strategie?
- [ ] Lokale Test-Email-Config (z.B. Mailhog)
- [ ] Kompletter Verzicht auf Email-Testing
- [x] Unit-Tests für Email-Logic reichen

**Frage B2:** Gibt es angefangene Features im aktuellen Projekt die NICHT migriert werden sollen?
- [x] Nein, alles migrieren
- [ ] Ja, folgende: ___________

**Frage B3:** Welche Features sind absolut kritisch für Go-Live?
- [x] Booking-Form + Primanota = kritisch
- [x] Invoice + Email = kritisch
- [ ] Ledgers = kritisch
- [ ] Estimates = optional

---

### C. Testing

**Frage C1:** Soll für Tests eine separate `test.sqlite` verwendet werden?
- [ ] Ja, mit Fixtures/Seed-Daten
- [x] Ja, In-Memory-DB
- [ ] Nein, Production-DB (Vorsicht!)

**Frage C2:** Coverage-Ziel 90% ist ambitioniert - welche Module sind am wichtigsten?
- [x] Booking-Logic = 100%, Rest >= 80%
- [ ] Alles >= 90%
- [ ] Logic = 95%, Server = 80%, Email = 60%

**Frage C3:** Sind Browser-Tests (Playwright/Cypress) gewünscht?
- [x] Ja, E2E-Tests mit Playwright
- [ ] Nein, nur Unit + Integration reicht

---

### D. Code-Qualität

**Frage D1:** Soll Accounting_2 TypeScript nutzen statt JavaScript?
- [x] Ja, TypeScript (Migration aufwändiger, +3-5 Tage)
- [ ] Nein, JavaScript beibehalten

**Frage D2:** Welche Code-Style-Regeln gelten?
- [ ] Bestehende aus Accounting übernehmen
- [ ] Neue Airbnb-Config
- [ ] Neue Standard-Config
- [x] Prettier + ESLint

**Frage D3:** Sollen JSDoc-Kommentare für alle Funktionen Pflicht sein?
- [x] Ja, für alle Public-Functions
- [ ] Nur für komplexe Funktionen
- [ ] Nein, Code soll selbsterklärend sein

---

### E. Dependencies

**Frage E1:** `decimal.js` wird aktuell NICHT genutzt (trotz claude.md!) - soll es in Accounting_2 verwendet werden?
- [x] Ja, für ALLE Brutto/Netto-Berechnungen (EMPFOHLEN!)
- [ ] Nein, Number-Arithmetik reicht

**Frage E2:** UUID-Library: Aktuell `uuid@13.0.0` - ist das OK?
- [ ] Ja, uuid beibehalten
- [x] Nein, lieber `nanoid` (kleiner, schneller)

**Frage E3:** Puppeteer ist sehr groß (~300MB) - Alternative erwägen?
- [x] Puppeteer beibehalten (HTML→PDF funktioniert gut)
- [ ] Alternative: `pdfkit` (nur reine PDF-Generierung)
- [ ] Alternative: `playwright` (moderner, schneller)

---

### F. Deployment

**Frage F1:** Wo wird Accounting_2 deployed?
- [x] Lokal (Windows)
- [ ] Server (Linux)
- [ ] Docker
- [ ] Cloud (z.B. Vercel, Railway)

**Frage F2:** Build-Prozess: `npm run build` soll was erzeugen?
- [x] Node-Adapter (default, für Server)
- [ ] Static-Adapter (für statisches Hosting)

**Frage F3:** Soll `db.sqlite`-Pfad relativ oder absolut konfigurierbar sein?
- [x] Via `.env`-File (DB_PATH=...)
- [ ] Fest relativ zum Projekt-Root
- [ ] Fest absolut (z.B. /var/data/accounting.db)

---

### G. Migration-Zeitpunkt

**Frage G1:** Wann starten?
- [x] Sofort (aktuelle Bugs in Accounting on-the-fly beheben)
- [ ] Nach HK Auto-Fill Bug-Fix
- [ ] Nach allen offenen Bugs in Accounting

**Frage G2:** Gibt es einen festen Go-Live-Termin bis wann Accounting_2 fertig sein muss?
- [x] Nein, flexibel
- [ ] Ja, Datum: ___________

**Frage G3:** Sollen beide Projekte parallel laufen?
- [ ] Ja: Accounting = Production, Accounting_2 = Development
- [x] Nein: Big Bang (Accounting einfrieren, noch ist eh nichts live)

---

---

## ZUSÄTZLICHE PHASEN (wegen TypeScript)

### Phase 13: TypeScript-Migration (Tag 22-24)
**Ziel:** Alle JavaScript-Module zu TypeScript migrieren

**Tag 22: Server & Logic**
- [ ] 13.1 `tsconfig.json` konfigurieren
- [ ] 13.2 Server-Module: `.js` → `.ts` (DB, booking, email, etc.)
- [ ] 13.3 Logic-Module: `.js` → `.ts` (alle 15+ Module)
- [ ] 13.4 Type-Definitionen hinzufügen (`@types/better-sqlite3`, `@types/node`)
- [ ] 13.5 Compile-Errors beheben
- [ ] 13.6 Commit: "feat: Migrate server + logic to TypeScript"

**Tag 23: Components**
- [ ] 13.7 Alle `.svelte` Dateien: `<script>` → `<script lang="ts">`
- [ ] 13.8 Booking-Komponenten typisieren
- [ ] 13.9 Primanota-Komponenten typisieren
- [ ] 13.10 Invoice-Komponenten typisieren
- [ ] 13.11 Shared-Komponenten typisieren
- [ ] 13.12 Commit: "feat: Migrate components to TypeScript"

**Tag 24: Stores & Tests**
- [ ] 13.13 Stores typisieren (viewModeStore, splitStore, etc.)
- [ ] 13.14 Utils typisieren
- [ ] 13.15 Test-Dateien: `.test.js` → `.test.ts`
- [ ] 13.16 Type-Errors beheben (Strict Mode)
- [ ] 13.17 `npm run build` → erfolgreich?
- [ ] 13.18 `npm run test` → alle grün?
- [ ] 13.19 Commit: "feat: Complete TypeScript migration"

**Ergebnis:** 100% TypeScript, Type-Safety ✅

---

### Phase 14: Playwright E2E-Tests (Tag 25)
**Ziel:** E2E-Tests für kritische User-Flows

- [ ] 14.1 Playwright installieren: `npm create playwright@latest`
- [ ] 14.2 `playwright.config.ts` konfigurieren
- [ ] 14.3 Test 1: Booking-Flow
  - Neuer Beleg → Formular ausfüllen → Speichern → In Primanota sichtbar
- [ ] 14.4 Test 2: Invoice-Flow
  - Neue Rechnung → Positionen hinzufügen → PDF generieren → Email senden
- [ ] 14.5 Test 3: Split-Kreditor-Flow
  - Split-Dialog öffnen → Positionen eingeben → Speichern → In Primanota prüfen
- [ ] 14.6 Test 4: Reconcile-Flow
  - OP-Ansicht → Mehrere Posten markieren → Ausziffern → Validieren
- [ ] 14.7 Playwright UI-Mode testen: `npx playwright test --ui`
- [ ] 14.8 Commit: "test: Add Playwright E2E tests (4 critical flows)"

**Ergebnis:** 4 E2E-Tests, kritische Flows abgedeckt ✅

---

### Phase 15: Final Cleanup & Production-Ready (Tag 26)
**Ziel:** Production-fertig machen

**Cleanup:**
- [ ] 15.1 Alle `console.log()` entfernen
- [ ] 15.2 Ungenutzte Imports entfernen (ESLint --fix)
- [ ] 15.3 Kommentierte Code-Blöcke löschen
- [ ] 15.4 `any` Types eliminieren (TypeScript Strict Mode)

**Package.json Optimieren:**
```json
{
  "name": "accounting_2",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "better-sqlite3": "^12.2.0",
    "decimal.js": "^10.6.0",
    "imapflow": "^1.0.196",
    "nanoid": "^5.0.4",
    "nodemailer": "^7.0.6",
    "puppeteer": "^24.20.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@playwright/test": "^1.45.0",
    "@sveltejs/adapter-node": "^5.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@testing-library/svelte": "^5.0.0",
    "@types/better-sqlite3": "^7.6.8",
    "@types/node": "^22.0.0",
    "@types/nodemailer": "^6.4.14",
    "@vitest/coverage-v8": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.0.0",
    "happy-dom": "^15.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-svelte": "^3.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

**.env.example erstellen:**
```env
# Database
DB_PATH=./db.sqlite

# Email (Production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=secret

# Development
NODE_ENV=development
PORT=5173
```

**README.md schreiben:**
- [ ] 15.5 Project Overview
- [ ] 15.6 Setup Instructions
- [ ] 15.7 Test Commands
- [ ] 15.8 Deployment Guide

**Final Checks:**
- [ ] 15.9 `npm run check` → Keine TypeScript-Errors?
- [ ] 15.10 `npm run test` → Alle Tests grün?
- [ ] 15.11 `npm run test:coverage` → >= 90%?
- [ ] 15.12 `npm run e2e` → Alle E2E-Tests grün?
- [ ] 15.13 `npm run build` → Build erfolgreich?
- [ ] 15.14 `npm run preview` → App läuft?
- [ ] 15.15 Code-Review: Alle Module <500 Zeilen?
- [ ] 15.16 Git: Final Commit "chore: Production-ready cleanup v2.0.0"
- [ ] 15.17 Git: Tag `v2.0.0`
- [ ] 15.18 Git: Push `git push origin main --tags`

**Ergebnis:** Accounting_2 v2.0.0 ist Production-Ready! 🎉

---

## AKTUALISIERTER ZEITPLAN

| Phase | Tage | Beschreibung |
|-------|------|--------------|
| 1 | 1 | Setup |
| 2 | 1 | Datenbank |
| 3 | 2 | Server Foundation |
| 4 | 2 | Logic Foundation |
| 5 | 1 | Stores |
| 6 | 3 | Booking-Form Refactoring |
| 7 | 3 | Primanota Refactoring |
| 8 | 2 | Invoice Module |
| 9 | 2 | Routing & Pages |
| 10 | 1 | Shared Components |
| 11 | 2 | Integration Testing |
| 12 | 1 | Cleanup & Final |
| **13** | **3** | **TypeScript-Migration** |
| **14** | **1** | **Playwright E2E-Tests** |
| **15** | **1** | **Final Production-Ready** |
| **TOTAL** | **26** | **Tage** |

---

## ENTSCHEIDUNGEN BASIEREND AUF USER-ANTWORTEN

### ✅ Datenbank & Migration
- Bestehende Journal-Einträge WERDEN mit split_group_id/match_id befüllt (nur nicht gesperrte)
- Automatisches Backup vor jedem Schema-Change
- `db.sqlite` im alten Projekt wird umbenannt zu `db_old.sqlite`

### ✅ Features & Funktionalität
- Email Mock/Selftest-Routes entfernt → Unit-Tests für Email-Logic reichen
- Alle Features migrieren (nichts auslassen)
- Booking+Primanota UND Invoice+Email = kritisch für Go-Live

### ✅ Testing
- In-Memory-DB für Tests
- Booking-Logic = 100% Coverage, Rest >= 80%
- Ja, E2E-Tests mit Playwright

### ✅ Code-Qualität
- **TypeScript verwenden** (+5 Tage Aufwand)
- Prettier + ESLint
- JSDoc für alle Public-Functions

### ✅ Dependencies
- decimal.js für ALLE Brutto/Netto-Berechnungen
- Wechsel zu `nanoid` statt `uuid`
- Puppeteer beibehalten

### ✅ Deployment
- Lokal (Windows)
- Node-Adapter
- DB-Pfad via `.env`

### ✅ Migration-Zeitpunkt
- **Sofort starten** (Bugs on-the-fly beheben)
- Kein fester Go-Live-Termin (flexibel)
- Big Bang (Accounting einfrieren)

---

## NÄCHSTE SCHRITTE

1. ✅ **Fragen beantwortet** (2025-11-15)
2. ✅ **Plan aktualisiert** (TypeScript + Playwright hinzugefügt)
3. **Phase 1 starten:** Setup mit TypeScript (Tag 1)
4. **Daily Progress Tracking:** in `ACCOUNTING_2_PROGRESS.md`

---

**Stand:** 2025-11-15
**Letzte Aktualisierung:** Plan aktualisiert mit TypeScript-Migration + Playwright E2E-Tests
**Erstellt von:** Claude (Sonnet 4.5)
**Status:** ✅ BEREIT FÜR PHASE 1
