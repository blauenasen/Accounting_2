# BOOKING PAGE - DETAILLIERTER UMSETZUNGSPLAN
**Projekt:** Accounting_2
**Ziel:** 1:1 Visual Matching mit Original (localhost:5173)
**Messdaten:** Siehe `Mess-Tabelle.md`
**Datum:** 2025-11-22

---

## PROJEKTÜBERSICHT

### Ziel
Vollständige Implementierung der Booking-Seite in Accounting_2 mit:
- ✅ Pixel-genauer visueller Übereinstimmung mit Original
- ✅ Identischer Funktionalität aus User-Perspektive
- ✅ Moderner Component-Architektur (CLAUDE.md konform)
- ✅ TypeScript statt JavaScript
- ✅ Alle Module ≤500 Zeilen

### Referenzen
- **Messdaten:** `Mess-Tabelle.md` (vollständige Spezifikation)
- **Original:** http://localhost:5173/booking
- **Target:** http://localhost:5174/booking
- **Regeln:** `CLAUDE.md`

### Drei Ansichten
1. **Primanota** - Journal-Einträge-Liste (15 Spalten)
2. **Kontoansicht** - Account View mit 8 Balance-Feldern (14 Spalten)
3. **OP-Ansicht** - Open Items Management mit Due Date, Balance-Feldern, Reconciliation (14 Spalten)

---

## COMPONENT-ARCHITEKTUR

### Dateistruktur
```
src/routes/booking/
├── +page.svelte                          # Main page (Orchestrator, ≤200 Zeilen)
├── BookingHeader.svelte                  # H1 + Status + View Buttons (≤300 Zeilen)
├── BookingControlBar.svelte              # Year/Month/Navigation/Book Circle (≤350 Zeilen)
├── BookingBalanceFields.svelte           # 8 Balance Fields (Kontoansicht only, ≤250 Zeilen)
├── PrimanotaTable.svelte                 # Primanota/OP Table View (≤400 Zeilen)
├── KontoansichtTable.svelte              # Account View Table (≤400 Zeilen)
├── BookingInputForm.svelte               # Bottom Input Form (≤350 Zeilen)
├── BookingAccountInfo.svelte             # Account Info Display (≤150 Zeilen)
└── booking.css                           # Page-specific styles

src/lib/stores/
├── bookingStore.ts                       # View state, filters (≤300 Zeilen)
└── journalStore.ts                       # Data, CRUD operations (≤300 Zeilen)

src/routes/api/journal/
├── +server.ts                            # GET, POST (≤250 Zeilen)
└── [id]/+server.ts                       # GET, PUT, DELETE (≤200 Zeilen)
```

---

## PHASE 1: HEADER & NAVIGATION (Tag 1-2)

### 1.1 BookingHeader.svelte (≤300 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → "H1 HEADER SECTION" + "VIEW MODE BUTTONS"

**Implementierung:**
```svelte
<script lang="ts">
  import { bookingViewStore } from '$lib/stores/bookingStore';

  export let statusText: string = '';

  function setView(view: 'primanota' | 'kontoansicht' | 'op') {
    bookingViewStore.setView(view);
  }
</script>

<div class="booking-header-container">
  <!-- H1: X:18px, Y:59px, W:1439.75px, H:25px -->
  <h1 class="booking-h1">BOOKING</h1>

  <!-- Status Text: X:1467.75px, Y:59px -->
  <div class="booking-status">{statusText}</div>

  <!-- View Mode Buttons: Y:57px, gap:15px -->
  <div class="view-mode-buttons">
    <button
      class="view-btn primanota"
      class:active={$bookingViewStore.currentView === 'primanota'}
      on:click={() => setView('primanota')}
      title="Primanota">
      📋 <!-- List icon -->
    </button>
    <button
      class="view-btn kontoansicht"
      class:active={$bookingViewStore.currentView === 'kontoansicht'}
      on:click={() => setView('kontoansicht')}
      title="Kontoansicht">
      📁 <!-- Folder icon -->
    </button>
    <button
      class="view-btn op"
      class:active={$bookingViewStore.currentView === 'op'}
      on:click={() => setView('op')}
      title="OP-Ansicht">
      ✓ <!-- Checkmark icon -->
    </button>
    <button class="view-btn filter" title="Turn filters on/off">
      🔍 <!-- Filter icon -->
    </button>
  </div>

  <!-- Book Circle Buttons: X:380px-595px, gap:15px -->
  <div class="book-circle-buttons">
    {#each ['B005', 'B006', 'B007', 'B008', 'B009', 'B0010'] as circle}
      <button class="book-circle-btn" title={circle}>
        {circle}
      </button>
    {/each}
  </div>
</div>

<style>
  /* Alle Maße aus Mess-Tabelle.md */
  .booking-h1 {
    position: absolute;
    left: 18px;
    top: 59px;
    width: 1439.75px;
    height: 25px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 25px;
    font-weight: 700;
    color: rgb(0, 0, 0);
    background-color: rgb(200, 231, 141);
    margin-left: 10px;
  }

  .booking-status {
    position: absolute;
    left: 1467.75px;
    top: 59px;
    width: 242.25px;
    height: 26px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    color: rgb(55, 48, 163);
  }

  .view-mode-buttons {
    position: absolute;
    top: 57px;
    left: 208px;
    display: flex;
    gap: 15px;
  }

  .view-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border: 0px none;
    padding: 2px;
    cursor: pointer;
  }

  .view-btn.active {
    border: 2px solid rgb(6, 161, 58);
    padding: 0px;
  }

  .book-circle-buttons {
    position: absolute;
    top: 57px;
    left: 380px;
    display: flex;
    gap: 15px;
  }

  .book-circle-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border: 0px none;
    padding: 2px;
    cursor: pointer;
  }
</style>
```

**CSS-Referenz:** Alle Werte aus `Mess-Tabelle.md` - Abschnitt "H1 HEADER SECTION" & "VIEW MODE BUTTONS"

**Tests:**
- ✅ H1 Position exakt (18px, 59px)
- ✅ Button-Abstände 15px
- ✅ Active-State grüner Border
- ✅ Status-Text rechts positioniert

---

### 1.2 BookingControlBar.svelte (≤350 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → "CONTROL BAR"

**Implementierung:**
```svelte
<script lang="ts">
  import { bookingViewStore } from '$lib/stores/bookingStore';

  let selectedYear = 2024;
  let selectedMonth = 12;
  let selectedBookCircle = 'Bank 1';

  function selectBookCircle() {
    // Open Book Circle selection dialog
  }
</script>

<div class="control-bar">
  <!-- Year Select: X:18px, Y:115px, W:60px, H:30px -->
  <select bind:value={selectedYear} class="year-select">
    {#each [2023, 2024, 2025] as year}
      <option value={year}>{year}</option>
    {/each}
  </select>

  <!-- Month Select: X:86px, Y:115px, W:55px, H:30px -->
  <select bind:value={selectedMonth} class="month-select">
    {#each Array(12) as _, i}
      <option value={i + 1}>{i + 1}</option>
    {/each}
  </select>

  {#if $bookingViewStore.currentView === 'primanota' || $bookingViewStore.currentView === 'op'}
    <!-- Book Circle Button: X:149px, Y:105px (Primanota) -->
    <button class="book-circle-button" on:click={selectBookCircle}>
      Book Circle
    </button>

    <!-- Selected Circle Display: X:307px, Y:105px -->
    <input
      type="text"
      readonly
      value={selectedBookCircle}
      class="selected-circle-display" />
  {/if}

  {#if $bookingViewStore.currentView === 'kontoansicht'}
    <!-- Navigation Buttons: X:149px-351px, Y:115px -->
    <button class="nav-btn first">⏮</button>
    <button class="nav-btn prev">◀</button>
    <input type="text" class="search-input" placeholder="Search..." />
    <button class="nav-btn next">▶</button>
    <button class="nav-btn last">⏭</button>

    <!-- Search Display: X:389px, Y:115px, W:225px -->
    <input
      type="text"
      readonly
      class="search-display"
      placeholder="Suche..." />
  {/if}

  <!-- Hide Stornos Checkbox -->
  <div class="hide-stornos">
    <input
      type="checkbox"
      id="hide-stornos"
      class="hide-stornos-checkbox" />
    <label for="hide-stornos">Hide Stornos</label>
  </div>
</div>

<style>
  /* Alle Maße aus Mess-Tabelle.md */
  .control-bar {
    position: relative;
  }

  .year-select {
    position: absolute;
    left: 18px;
    top: 115px;
    width: 60px;
    height: 30px;
    border: 1px solid rgb(51, 51, 51);
    background-color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 4px;
  }

  .month-select {
    position: absolute;
    left: 86px;
    top: 115px;
    width: 55px;
    height: 30px;
    border: 1px solid rgb(51, 51, 51);
    background-color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 4px;
  }

  .book-circle-button {
    position: absolute;
    left: 149px;
    top: 105px;
    width: 150px;
    height: 30px;
    border: 1px solid rgb(51, 51, 51);
    background-color: rgb(76, 175, 80);
    font-size: 12px;
    font-family: Helvetica, Arial, sans-serif;
    padding: 0px 10px;
    color: white;
  }

  .selected-circle-display {
    position: absolute;
    left: 307px;
    top: 105px;
    width: 150px;
    height: 30px;
    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
  }

  .nav-btn {
    width: 30px;
    height: 30px;
    background-color: rgb(33, 150, 243);
    border: 1px solid rgb(51, 51, 51);
    color: rgb(255, 255, 255);
    font-size: 14px;
    cursor: pointer;
  }

  .nav-btn.first { position: absolute; left: 149px; top: 115px; }
  .nav-btn.prev { position: absolute; left: 187px; top: 115px; }
  .nav-btn.next { position: absolute; left: 313px; top: 115px; }
  .nav-btn.last { position: absolute; left: 351px; top: 115px; }

  .search-input {
    position: absolute;
    left: 225px;
    top: 115px;
    width: 80px;
    height: 30px;
    border: 1px solid rgb(204, 204, 204);
    background: rgb(255, 255, 255);
    font-size: 12px;
  }

  .search-display {
    position: absolute;
    left: 389px;
    top: 115px;
    width: 225px;
    height: 30px;
    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
  }

  .hide-stornos {
    position: absolute;
    left: 30px;
  }

  /* Primanota/OP: Y:151px, Kontoansicht: Y:181px */
  :global(.view-primanota) .hide-stornos,
  :global(.view-op) .hide-stornos {
    top: 151px;
  }

  :global(.view-kontoansicht) .hide-stornos {
    top: 181px;
  }

  .hide-stornos-checkbox {
    width: 14px;
    height: 14px;
  }
</style>
```

**CSS-Referenz:** `Mess-Tabelle.md` - "CONTROL BAR" (Primanota & Kontoansicht)

**Tests:**
- ✅ Year/Month Selects korrekte Position
- ✅ Navigation-Buttons nur in Kontoansicht
- ✅ Book Circle nur in Primanota/OP
- ✅ Hide Stornos Y-Position je nach View

---

## PHASE 2: BALANCE FIELDS (Tag 3)

### 2.1 BookingBalanceFields.svelte (≤250 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → "BALANCE FIELDS (8 FIELDS - USER POSITIONED!)"

**KRITISCH:** User hat diese Felder persönlich positioniert - EXAKTE Übernahme!

**Implementierung:**
```svelte
<script lang="ts">
  export let openingBalance = '0.00';
  export let debitBalance = '0.00';
  export let creditBalance = '0.00';
  export let totalBalance = '0.00';
  export let closingBalance = '0.00';
  export let sumDebit = '0.00';
  export let sumCredit = '0.00';
  export let sumTotal = '0.00';
</script>

<div class="balance-fields-container">
  <!-- Row 1: Primary Balance Fields -->
  <div class="balance-field">
    <label for="opening" style="left: 649.08px; top: 105px; width: 61.83px;">
      Opening-Balance
    </label>
    <input
      id="opening"
      type="text"
      readonly
      value={openingBalance}
      style="left: 630px; top: 115px; width: 100px; height: 30px;" />
  </div>

  <div class="balance-field">
    <label for="debit" style="left: 770.88px; top: 105px; width: 50.25px;">
      Debit-Balance
    </label>
    <input
      id="debit"
      type="text"
      readonly
      value={debitBalance}
      style="left: 746px; top: 115px; width: 100px; height: 30px;" />
  </div>

  <div class="balance-field">
    <label for="credit" style="left: 885.53px; top: 105px; width: 52.92px;">
      Credit-Balance
    </label>
    <input
      id="credit"
      type="text"
      readonly
      value={creditBalance}
      style="left: 862px; top: 115px; width: 100px; height: 30px;" />
  </div>

  <div class="balance-field">
    <label for="total" style="left: 1003.75px; top: 105px; width: 48.48px;">
      Total-Balance
    </label>
    <input
      id="total"
      type="text"
      readonly
      value={totalBalance}
      style="left: 978px; top: 115px; width: 100px; height: 30px;" />
  </div>

  <div class="balance-field">
    <label for="closing" style="left: 1114.86px; top: 105px; width: 58.27px;">
      Closing-Balance
    </label>
    <input
      id="closing"
      type="text"
      readonly
      value={closingBalance}
      style="left: 1094px; top: 115px; width: 100px; height: 30px;" />
  </div>

  <!-- Row 2: Sum Fields -->
  <div class="balance-field">
    <label for="sum-debit" style="left: 777.31px; top: 163px; width: 37.36px;">
      Sum Debit
    </label>
    <input
      id="sum-debit"
      type="text"
      readonly
      value={sumDebit}
      style="left: 746px; top: 173px; width: 100px; height: 30px;" />
  </div>

  <div class="balance-field">
    <label for="sum-credit" style="left: 891.98px; top: 163px; width: 40.02px;">
      Sum Credit
    </label>
    <input
      id="sum-credit"
      type="text"
      readonly
      value={sumCredit}
      style="left: 862px; top: 173px; width: 100px; height: 30px;" />
  </div>

  <div class="balance-field">
    <label for="sum-total" style="left: 1010.28px; top: 163px; width: 35.44px;">
      Sum Total
    </label>
    <input
      id="sum-total"
      type="text"
      readonly
      value={sumTotal}
      style="left: 978px; top: 173px; width: 100px; height: 30px;" />
  </div>

  <!-- Account/Contra Account Toggle -->
  <div class="account-toggle">
    <button class="toggle-btn account" disabled style="left: 1482px; top: 105px;">
      Account
    </button>
    <button class="toggle-btn contra" disabled style="left: 1482px; top: 135px;">
      Contra Account
    </button>
  </div>
</div>

<style>
  .balance-fields-container {
    position: relative;
  }

  .balance-field label {
    position: absolute;
    font-size: 8px; /* SEHR KLEIN! */
    font-weight: 400;
    color: rgb(85, 85, 85);
    text-align: center;
  }

  .balance-field input {
    position: absolute;
    font-family: Arial;
    font-size: 14px;
    font-weight: 400;
    color: rgb(0, 0, 0);
    text-align: right;
    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    padding: 0px 6px;
    box-sizing: border-box;
  }

  .toggle-btn {
    position: absolute;
    width: 150px;
    height: 30px;
    background: transparent;
    border: 0px none;
    border-radius: 6px;
    color: rgb(51, 51, 51);
    font-size: 12px;
  }
</style>
```

**CSS-Referenz:** `Mess-Tabelle.md` - "BALANCE FIELDS (CRITICAL - USER POSITIONED!)"

**CRITICAL TESTS:**
- ✅ Label font-size: 8px (sehr klein!)
- ✅ Input dimensions: alle 100px × 30px
- ✅ Horizontal spacing: 116px zwischen Inputs
- ✅ Vertical spacing: 58px zwischen Rows
- ✅ Text-align: labels center, inputs right

---

## PHASE 3: TABELLEN (Tag 4-6)

### 3.1 PrimanotaTable.svelte (≤400 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → "TABLE HEADER COLUMNS (15 columns)"

**Implementierung:**
```svelte
<script lang="ts">
  import { journalStore } from '$lib/stores/journalStore';

  export let entries: JournalEntry[] = [];

  let sortColumn = '';
  let sortDirection: 'asc' | 'desc' = 'asc';

  function sortBy(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    // Sort logic
  }
</script>

<div class="primanota-table-container">
  <table class="primanota-table">
    <thead>
      <tr>
        <!-- 15 Spalten - exakte Breiten aus Mess-Tabelle.md -->
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('id')}>
          ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('pdf')}>
          PDF
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('w')}>
          W
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('no')}>
          No
        </th>
        <th style="width: 104.63px; text-align: center;" on:click={() => sortBy('turnover')}>
          Turnover
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('sh')}>
          SH
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('gu')}>
          GU
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('bu')}>
          BU
        </th>
        <th style="width: 115.09px; text-align: center;" on:click={() => sortBy('contra')}>
          Contra Acc
        </th>
        <th style="width: 209.27px; text-align: center;" on:click={() => sortBy('docNumber')}>
          Doc Number
        </th>
        <th style="width: 104.63px; text-align: center;" on:click={() => sortBy('date')}>
          Date
        </th>
        <th style="width: 94.17px; text-align: center;" on:click={() => sortBy('account')}>
          Account
        </th>
        <th style="width: 355.75px; text-align: center;" on:click={() => sortBy('text')}>
          Booking Text
        </th>
        <th style="width: 62.78px; text-align: center;" on:click={() => sortBy('hk')}>
          HK
        </th>
        <th style="width: 94.22px; text-align: center;" on:click={() => sortBy('taxRate')}>
          TaxRate
        </th>
      </tr>
    </thead>
    <tbody>
      {#each entries as entry, i}
        <tr>
          <td style="text-align: right;">{entry.id}</td>
          <td style="text-align: center;">{entry.pdf || ''}</td>
          <td style="text-align: center;">{entry.w || ''}</td>
          <td style="text-align: right;">{entry.no}</td>
          <td style="text-align: right;">{entry.turnover}</td>
          <td style="text-align: center;">{entry.sh}</td>
          <td style="text-align: center;">{entry.gu}</td>
          <td style="text-align: center;">{entry.bu}</td>
          <td style="text-align: right;">{entry.contraAccount}</td>
          <td style="text-align: left;">{entry.docNumber}</td>
          <td style="text-align: center;">{entry.date}</td>
          <td style="text-align: right;">{entry.account}</td>
          <td style="text-align: left;">{entry.bookingText}</td>
          <td style="text-align: center;">{entry.hk}</td>
          <td style="text-align: right;">{entry.taxRate}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .primanota-table-container {
    position: absolute;
    left: 20px;
    top: 194px;
    width: 1580px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .primanota-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(229, 240, 234);
  }

  .primanota-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .primanota-table th {
    height: 22px;
    padding: 1px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(34, 34, 34);
    background-color: transparent;
    cursor: pointer;
    user-select: none;
  }

  .primanota-table td {
    height: 35px;
    padding: 2px 4px;
    border: 1px solid rgb(221, 221, 221);
    background-color: transparent;
    font-size: 13px;
  }

  .primanota-table tbody tr:hover td {
    background-color: rgba(255, 255, 255, 0.5);
  }
</style>
```

**CSS-Referenz:** `Mess-Tabelle.md` - "TABLE HEADER COLUMNS (15 columns)" & "TABLE BODY"

**Tests:**
- ✅ 15 Spalten mit exakten Breiten
- ✅ Header sticky positioned
- ✅ Row height: 35px
- ✅ Cell padding: 2px 4px
- ✅ Text-align pro Spalte korrekt

---

### 3.2 KontoansichtTable.svelte (≤400 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → Kontoansicht "TABLE HEADER COLUMNS (14 columns)"

**Ähnlich zu PrimanotaTable, aber:**
- 14 Spalten statt 15
- Andere Spaltenstruktur (Sum Soll, Sum Haben, Balance)
- Table Position Y: 210px (statt 194px)

**Implementation analog zu PrimanotaTable mit angepassten Spalten.**

---

## PHASE 4: INPUT FORM (Tag 7-8)

### 4.1 BookingInputForm.svelte (≤350 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → "INPUT FORM (BOTTOM SECTION)"

**Implementierung:**
```svelte
<script lang="ts">
  let gu = '';
  let turnover = '';
  let sh = 'S';
  let contraAccount = '';
  let reference = '';
  let date = '';
  let account = '';
  let tax = '';
  let dueDate = '';
  let disc = '0.00';
  let description = '';

  let canSave = false;

  function handleSave() {
    // Save logic
  }
</script>

<div class="input-form">
  <!-- Labels -->
  <label for="gu" style="left: 30px; top: 1160px;">GU</label>
  <label for="turnover" style="left: 79px; top: 1160px;">Turnover</label>
  <label for="sh" style="left: 171px; top: 1160px;">SH</label>
  <!-- ... alle Labels -->

  <!-- Inputs - EXAKTE Positionen aus Mess-Tabelle.md -->
  <input
    id="gu"
    type="text"
    readonly
    bind:value={gu}
    style="left: 30px; top: 1172px; width: 37px; height: 28px; text-align: center;"
    class="input-readonly" />

  <input
    id="turnover"
    type="text"
    bind:value={turnover}
    style="left: 79px; top: 1172px; width: 80px; height: 28px; text-align: right;"
    class="input-active" />

  <!-- ... alle 11 Felder -->

  <!-- Buttons -->
  <button
    class="btn-ok"
    style="left: 1364px; top: 1172px; width: 43.27px; height: 28px;"
    disabled={!canSave}
    on:click={handleSave}>
    OK
  </button>

  <button
    class="btn-cancel"
    style="left: 1420.81px; top: 1172px; width: 65.5px; height: 28px;">
    Cancel
  </button>

  <button
    class="btn-pdf"
    style="left: 1492.31px; top: 1172px; width: 70px; height: 28px;">
    +PDF
  </button>
</div>

<style>
  .input-form label {
    position: absolute;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: rgb(152, 148, 147);
    height: 12px;
  }

  .input-form input {
    position: absolute;
    font-family: Arial;
    font-size: 14.4px;
    border-style: inset;
    border-width: 2px;
    border-color: rgb(118, 118, 118);
    padding: 4px 6px;
    box-sizing: border-box;
  }

  .input-readonly {
    background-color: rgb(249, 250, 251);
    color: rgb(55, 65, 81);
  }

  .input-active {
    background-color: rgb(255, 243, 205); /* Yellow BG */
    border-color: rgb(255, 0, 0); /* Red border */
    color: rgb(0, 0, 0);
  }

  .btn-ok {
    position: absolute;
    background-color: rgb(76, 175, 80);
    color: rgb(255, 255, 255);
    border: 0px none;
    border-radius: 4px;
    font-family: Arial;
    font-size: 13.33px;
    padding: 6px 12px;
    cursor: pointer;
  }

  .btn-cancel {
    position: absolute;
    background-color: rgb(244, 67, 54);
    color: rgb(255, 255, 255);
    border: 0px none;
    border-radius: 4px;
    font-family: Arial;
    font-size: 13.33px;
    padding: 6px 12px;
    cursor: pointer;
  }

  .btn-pdf {
    position: absolute;
    background-color: rgb(33, 150, 243);
    color: rgb(255, 255, 255);
    border: 0px none;
    border-radius: 4px;
    font-family: Arial;
    font-size: 13.33px;
    padding: 6px 18px;
    cursor: pointer;
  }
</style>
```

**CSS-Referenz:** `Mess-Tabelle.md` - "INPUT FORM (BOTTOM SECTION)" & "ACTION BUTTONS"

**Tests:**
- ✅ 11 Felder exakt positioniert
- ✅ Turnover: Red border, Yellow BG
- ✅ Readonly fields: Gray BG
- ✅ Buttons: exakte Größen (43.27px, 65.5px, 70px)
- ✅ Field spacing: 12px gaps

---

### 4.2 BookingAccountInfo.svelte (≤150 Zeilen)

**Messdaten:** Siehe `Mess-Tabelle.md` → "ACCOUNT INFO SECTION (BOTTOM)"

**Implementierung:**
```svelte
<script lang="ts">
  export let contraAccountNumber = '';
  export let contraAccountName = '';
  export let contraSaldo = 0;
  export let accountNumber = '';
  export let accountName = '';
  export let accountSaldo = 0;
</script>

<div class="account-info" style="left: 30px; top: 1228px; width: 1578px;">
  <div class="info-row" style="top: 11px;">
    <span class="label" style="left: 13px;">Contra Account:</span>
    <span class="account-num">{contraAccountNumber}</span>
    <span class="account-name" style="left: 257px;">{contraAccountName}</span>
    <span class="saldo-label" style="left: 1341px;">Saldo: EUR</span>
    <span class="saldo-amount" style="left: 1433px;" class:negative={contraSaldo < 0}>
      {contraSaldo >= 0 ? '+' : ''}{contraSaldo.toFixed(2)}
    </span>
  </div>

  <div class="info-row" style="top: 36px;">
    <span class="label" style="left: 13px;">Account:</span>
    <span class="account-num">{accountNumber}</span>
    <span class="account-name" style="left: 257px;">{accountName}</span>
    <span class="saldo-label" style="left: 1341px;">Saldo: EUR</span>
    <span class="saldo-amount" style="left: 1433px;" class:negative={accountSaldo < 0}>
      {accountSaldo >= 0 ? '+' : ''}{accountSaldo.toFixed(2)}
    </span>
  </div>
</div>

<style>
  .account-info {
    position: absolute;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(240, 240, 240);
  }

  .info-row {
    position: relative;
    height: 25px;
  }

  .label {
    position: absolute;
    font-size: 14px;
    font-weight: 600;
    color: rgb(51, 51, 51);
  }

  .account-num,
  .account-name {
    position: absolute;
    font-size: 14px;
    font-weight: 400;
    color: rgb(85, 85, 85);
  }

  .saldo-label {
    position: absolute;
    font-size: 14px;
    font-weight: 500;
    color: rgb(51, 51, 51);
  }

  .saldo-amount {
    position: absolute;
    font-size: 14px;
    font-weight: 600;
    color: rgb(0, 0, 0);
  }

  .saldo-amount.negative {
    color: rgb(220, 38, 38); /* Red for negative */
  }
</style>
```

**CSS-Referenz:** `Mess-Tabelle.md` - "ACCOUNT INFO SECTION (BOTTOM)"

---

## PHASE 5: STORES & STATE MANAGEMENT (Tag 9)

### 5.1 bookingStore.ts (≤300 Zeilen)

**Implementierung:**
```typescript
// src/lib/stores/bookingStore.ts
import { writable, derived } from 'svelte/store';

export type BookingView = 'primanota' | 'kontoansicht' | 'op';

interface BookingState {
  currentView: BookingView;
  selectedYear: number;
  selectedMonth: number;
  selectedBookCircle: string;
  hideStornos: boolean;
  filterActive: boolean;
}

function createBookingStore() {
  const { subscribe, set, update } = writable<BookingState>({
    currentView: 'primanota',
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedBookCircle: 'Bank 1',
    hideStornos: false,
    filterActive: false
  });

  return {
    subscribe,
    setView: (view: BookingView) => update(state => ({ ...state, currentView: view })),
    setYear: (year: number) => update(state => ({ ...state, selectedYear: year })),
    setMonth: (month: number) => update(state => ({ ...state, selectedMonth: month })),
    setBookCircle: (circle: string) => update(state => ({ ...state, selectedBookCircle: circle })),
    toggleHideStornos: () => update(state => ({ ...state, hideStornos: !state.hideStornos })),
    toggleFilter: () => update(state => ({ ...state, filterActive: !state.filterActive })),
    reset: () => set({
      currentView: 'primanota',
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      selectedBookCircle: 'Bank 1',
      hideStornos: false,
      filterActive: false
    })
  };
}

export const bookingViewStore = createBookingStore();
```

---

### 5.2 journalStore.ts (≤300 Zeilen)

**Implementierung:**
```typescript
// src/lib/stores/journalStore.ts
import { writable, derived } from 'svelte/store';

export interface JournalEntry {
  id: number;
  pdf?: string;
  w?: string;
  no: number;
  turnover: number;
  sh: string;
  gu: string;
  bu: string;
  contraAccount: number;
  docNumber: string;
  date: string;
  account: number;
  bookingText: string;
  hk?: string;
  taxRate: number;
}

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  selectedEntry: JournalEntry | null;
}

function createJournalStore() {
  const { subscribe, set, update } = writable<JournalState>({
    entries: [],
    loading: false,
    error: null,
    selectedEntry: null
  });

  return {
    subscribe,

    load: async (year: number, month: number, bookCircle?: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      try {
        const params = new URLSearchParams({
          year: String(year),
          month: String(month),
          ...(bookCircle && { bookCircle })
        });
        const res = await fetch(`/api/journal?${params}`);
        if (!res.ok) throw new Error('Failed to load journal entries');
        const entries = await res.json();
        update(state => ({ ...state, entries, loading: false }));
      } catch (error) {
        update(state => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    },

    create: async (entry: Omit<JournalEntry, 'id'>) => {
      try {
        const res = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error('Failed to create entry');
        const newEntry = await res.json();
        update(state => ({
          ...state,
          entries: [...state.entries, newEntry]
        }));
        return newEntry;
      } catch (error) {
        throw error;
      }
    },

    update: async (id: number, entry: Partial<JournalEntry>) => {
      try {
        const res = await fetch(`/api/journal/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error('Failed to update entry');
        update(state => ({
          ...state,
          entries: state.entries.map(e => e.id === id ? { ...e, ...entry } : e)
        }));
      } catch (error) {
        throw error;
      }
    },

    delete: async (id: number) => {
      try {
        const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete entry');
        update(state => ({
          ...state,
          entries: state.entries.filter(e => e.id !== id)
        }));
      } catch (error) {
        throw error;
      }
    },

    select: (entry: JournalEntry | null) => {
      update(state => ({ ...state, selectedEntry: entry }));
    }
  };
}

export const journalStore = createJournalStore();
```

---

## PHASE 6: API INTEGRATION (Tag 10)

### 6.1 API Routes

**src/routes/api/journal/+server.ts:**
```typescript
import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'db.sqlite'));

export const GET: RequestHandler = async ({ url }) => {
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');
  const bookCircle = url.searchParams.get('bookCircle');

  let query = 'SELECT * FROM journal WHERE 1=1';
  const params: any[] = [];

  if (year) {
    query += ' AND strftime("%Y", date) = ?';
    params.push(year);
  }

  if (month) {
    query += ' AND strftime("%m", date) = ?';
    params.push(month.padStart(2, '0'));
  }

  if (bookCircle) {
    query += ' AND book_circle = ?';
    params.push(bookCircle);
  }

  query += ' ORDER BY date DESC, id DESC';

  const stmt = db.prepare(query);
  const entries = stmt.all(...params);

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const entry = await request.json();

  // Validation
  if (!entry.contraAccount || !entry.turnover) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stmt = db.prepare(`
    INSERT INTO journal
    (turnover, sh, contra_account, reference, date, account, tax_rate, due_date, disc, booking_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    entry.turnover,
    entry.sh,
    entry.contraAccount,
    entry.reference,
    entry.date,
    entry.account,
    entry.taxRate,
    entry.dueDate,
    entry.disc,
    entry.bookingText
  );

  return new Response(
    JSON.stringify({ id: result.lastInsertRowid }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
```

---

## PHASE 7: MAIN PAGE ORCHESTRATION (Tag 11)

### 7.1 +page.svelte (≤200 Zeilen)

**Implementierung:**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { bookingViewStore } from '$lib/stores/bookingStore';
  import { journalStore } from '$lib/stores/journalStore';

  import BookingHeader from './BookingHeader.svelte';
  import BookingControlBar from './BookingControlBar.svelte';
  import BookingBalanceFields from './BookingBalanceFields.svelte';
  import PrimanotaTable from './PrimanotaTable.svelte';
  import KontoansichtTable from './KontoansichtTable.svelte';
  import BookingInputForm from './BookingInputForm.svelte';
  import BookingAccountInfo from './BookingAccountInfo.svelte';

  import './booking.css';

  $: statusText = `Month All: ${$journalStore.entries.length} journal entries | Book Circle ${$bookingViewStore.selectedBookCircle}`;

  onMount(async () => {
    await journalStore.load(
      $bookingViewStore.selectedYear,
      $bookingViewStore.selectedMonth,
      $bookingViewStore.selectedBookCircle
    );
  });

  $: {
    // Reload when filters change
    if ($bookingViewStore.selectedYear || $bookingViewStore.selectedMonth) {
      journalStore.load(
        $bookingViewStore.selectedYear,
        $bookingViewStore.selectedMonth,
        $bookingViewStore.selectedBookCircle
      );
    }
  }
</script>

<div class="booking-page view-{$bookingViewStore.currentView}">
  <BookingHeader {statusText} />

  <BookingControlBar />

  {#if $bookingViewStore.currentView === 'kontoansicht'}
    <BookingBalanceFields />
  {/if}

  {#if $bookingViewStore.currentView === 'primanota' || $bookingViewStore.currentView === 'op'}
    <PrimanotaTable entries={$journalStore.entries} />
  {:else if $bookingViewStore.currentView === 'kontoansicht'}
    <KontoansichtTable entries={$journalStore.entries} />
  {/if}

  <BookingInputForm />

  <BookingAccountInfo
    contraAccountNumber="10004"
    contraAccountName="Mr Ryan Harbridge"
    contraSaldo={1782.39}
    accountNumber="4400"
    accountName="Proceeds with taxes"
    accountSaldo={-10140.84} />
</div>

<style>
  .booking-page {
    position: relative;
    min-height: 100vh;
    background-color: rgb(247, 244, 239);
  }
</style>
```

---

## PHASE 8: TESTING & VISUAL MATCHING (Tag 12-13)

### 8.1 Visual Regression Tests

**Testskript erstellen:**
```bash
# scripts/visual-test-booking.sh
#!/bin/bash

# Screenshots Original vs Accounting_2
npx playwright test visual-booking.spec.ts

# Vergleich mit pixelmatch
node scripts/compare-booking-screenshots.js
```

**Playwright Test:**
```typescript
// tests/visual-booking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Visual Matching', () => {
  test('Primanota view matches Original', async ({ page }) => {
    await page.goto('http://localhost:5174/booking');
    await page.waitForSelector('.primanota-table');
    await expect(page).toHaveScreenshot('primanota-5174.png');
  });

  test('Kontoansicht matches Original', async ({ page }) => {
    await page.goto('http://localhost:5174/booking');
    await page.click('[title="Kontoansicht"]');
    await page.waitForSelector('.balance-fields-container');
    await expect(page).toHaveScreenshot('kontoansicht-5174.png');
  });
});
```

### 8.2 Pixel-Perfect Validation Checklist

**Für JEDE Komponente:**
- [ ] X, Y Positionen stimmen (±1px Toleranz)
- [ ] Width, Height stimmen (±1px Toleranz)
- [ ] Font-Family korrekt
- [ ] Font-Size korrekt
- [ ] Font-Weight korrekt
- [ ] Border-Width, Border-Style, Border-Color korrekt
- [ ] Background-Color korrekt (RGB exakt)
- [ ] Text-Color korrekt (RGB exakt)
- [ ] Padding korrekt (alle 4 Seiten)
- [ ] Text-Align korrekt

**Balance Fields Extra-Validierung:**
- [ ] Label Font-Size: 8px (sehr klein!)
- [ ] Input Width: 100px (alle 8 Felder)
- [ ] Horizontal Spacing: 116px
- [ ] Vertical Spacing: 58px
- [ ] Text-Align: labels center, inputs right

---

## PHASE 9: OPTIMIZATION & REFINEMENT (Tag 14)

### 9.1 Performance

- Virtualisierung für große Tabellen (>100 Zeilen)
- Debouncing für Sorting/Filtering
- Lazy Loading für nicht-sichtbare Views

### 9.2 Code Review

**CLAUDE.md Compliance:**
- [ ] Alle Module ≤500 Zeilen
- [ ] TypeScript (kein JavaScript)
- [ ] Keine Technical Debt
- [ ] Svelte 4 (nicht Svelte 5)
- [ ] Store-basiertes State Management

### 9.3 Documentation

- README.md für Booking-Seite
- Component-Dokumentation
- API-Dokumentation

---

## ZEITPLAN

| Phase | Dauer | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Tag 1-2 | Header & Navigation | ⬜ |
| 2 | Tag 3 | Balance Fields | ⬜ |
| 3 | Tag 4-6 | Tabellen (Primanota & Kontoansicht) | ⬜ |
| 4 | Tag 7-8 | Input Form & Account Info | ⬜ |
| 5 | Tag 9 | Stores & State Management | ⬜ |
| 6 | Tag 10 | API Integration | ⬜ |
| 7 | Tag 11 | Main Page Orchestration | ⬜ |
| 8 | Tag 12-13 | Testing & Visual Matching | ⬜ |
| 9 | Tag 14 | Optimization & Refinement | ⬜ |

**Gesamtdauer:** ~14 Tage (2-3 Wochen)

---

## RISIKEN & MITIGATION

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Balance Fields nicht exakt positioniert | Mittel | Hoch | User hat positioniert - exakte Übernahme aus Mess-Tabelle.md |
| Component >500 Zeilen | Niedrig | Mittel | Regelmäßige Line-Counts, frühzeitiges Refactoring |
| Performance-Probleme bei großen Tabellen | Mittel | Mittel | Virtualisierung von Anfang an einplanen |
| Visual Mismatches | Hoch | Hoch | Screenshot-Vergleiche nach jeder Phase |
| API-Integration Bugs | Mittel | Hoch | Umfangreiche Tests, Error Handling |

---

## ERFOLGSMETRIKEN

### Technisch
- ✅ Alle Komponenten ≤500 Zeilen
- ✅ TypeScript ohne `any`
- ✅ Unit Test Coverage ≥80%
- ✅ Visual Regression Tests bestanden
- ✅ Performance <200ms Render-Zeit

### Visuell
- ✅ Pixel-Perfect Match (±2px Toleranz)
- ✅ Alle Farben RGB-exakt
- ✅ Alle Fonts korrekt
- ✅ Alle Borders exakt
- ✅ Balance Fields 1:1 positioniert

### Funktional
- ✅ Alle 3 Views funktionieren
- ✅ View-Switching ohne Fehler
- ✅ Sorting funktioniert
- ✅ Filtering funktioniert
- ✅ CRUD-Operationen erfolgreich

---

## NÄCHSTE SCHRITTE

1. ✅ Messdaten in `Mess-Tabelle.md` validieren
2. ⬜ Phase 1 starten: BookingHeader.svelte
3. ⬜ Git-Branch erstellen: `feature/booking-implementation`
4. ⬜ Erste Komponente implementieren
5. ⬜ Visual Test durchführen
6. ⬜ Commit & weiter zu nächster Phase

---

**WICHTIG:** Alle Maße, Farben, Fonts aus `Mess-Tabelle.md` 1:1 übernehmen!

**Stand:** 2025-11-22
**Erstellt von:** Claude (Sonnet 4.5) + User
**Dokumentation:** Mess-Tabelle.md, Booking-Plan.md
