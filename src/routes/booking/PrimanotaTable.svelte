<!-- PrimanotaTable.svelte -->
<!-- Primanota View Table - 15 Columns -->
<!-- Measurements from Mess-Tabelle.md: PRIMANOTA VIEW -->

<script lang="ts">
  // Define JournalEntry type inline to avoid imports
  interface JournalEntry {
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
    hk: string;
    taxRate: number;
  }

  export let entries: JournalEntry[] = [];

  // Sorting state
  let sortColumn: string = '';
  let sortDirection: 'asc' | 'desc' = 'asc';

  function sortBy(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    // TODO: Implement actual sorting logic in Phase 5
  }

  // Format numbers to 2 decimal places
  function formatCurrency(value: number): string {
    return value.toFixed(2);
  }
</script>

<!-- TABLE CONTAINER: Y:194px (Primanota - no balance fields above) -->
<div class="primanota-table-container">
  <table class="primanota-table">
    <thead>
      <tr>
        <!-- 15 COLUMNS - Exact widths from Mess-Tabelle.md -->

        <!-- ID: 62.78px, center -->
        <th class="col-id" on:click={() => sortBy('id')}>
          ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>

        <!-- PDF: 62.78px, center -->
        <th class="col-pdf" on:click={() => sortBy('pdf')}>
          PDF
        </th>

        <!-- W: 62.78px, center -->
        <th class="col-w" on:click={() => sortBy('w')}>
          W
        </th>

        <!-- No: 62.78px, center -->
        <th class="col-no" on:click={() => sortBy('no')}>
          No
        </th>

        <!-- Turnover: 104.63px, center -->
        <th class="col-turnover" on:click={() => sortBy('turnover')}>
          Turnover
        </th>

        <!-- SH: 62.78px, center -->
        <th class="col-sh" on:click={() => sortBy('sh')}>
          SH
        </th>

        <!-- GU: 62.78px, center -->
        <th class="col-gu" on:click={() => sortBy('gu')}>
          GU
        </th>

        <!-- BU: 62.78px, center -->
        <th class="col-bu" on:click={() => sortBy('bu')}>
          BU
        </th>

        <!-- Contra Acc: 115.09px, center -->
        <th class="col-contra" on:click={() => sortBy('contraAccount')}>
          Contra Acc
        </th>

        <!-- Doc Number: 209.27px, center -->
        <th class="col-doc" on:click={() => sortBy('docNumber')}>
          Doc Number
        </th>

        <!-- Date: 104.63px, center -->
        <th class="col-date" on:click={() => sortBy('date')}>
          Date
        </th>

        <!-- Account: 94.17px, center -->
        <th class="col-account" on:click={() => sortBy('account')}>
          Account
        </th>

        <!-- Booking Text: 355.75px, center -->
        <th class="col-text" on:click={() => sortBy('bookingText')}>
          Booking Text
        </th>

        <!-- HK: 62.78px, center -->
        <th class="col-hk" on:click={() => sortBy('hk')}>
          HK
        </th>

        <!-- TaxRate: 94.22px, center -->
        <th class="col-tax" on:click={() => sortBy('taxRate')}>
          TaxRate
        </th>
      </tr>
    </thead>
    <tbody>
      {#if entries.length === 0}
        <tr>
          <td colspan="15" class="no-data">No data found for this month</td>
        </tr>
      {:else}
        {#each entries as entry}
          <tr>
            <td class="cell-id">{entry.id}</td>
            <td class="cell-pdf">{entry.pdf || ''}</td>
            <td class="cell-w">{entry.w || ''}</td>
            <td class="cell-no">{entry.no}</td>
            <td class="cell-turnover">{formatCurrency(entry.turnover)}</td>
            <td class="cell-sh">{entry.sh}</td>
            <td class="cell-gu">{entry.gu}</td>
            <td class="cell-bu">{entry.bu}</td>
            <td class="cell-contra">{entry.contraAccount}</td>
            <td class="cell-doc">{entry.docNumber}</td>
            <td class="cell-date">{entry.date}</td>
            <td class="cell-account">{entry.account}</td>
            <td class="cell-text">{entry.bookingText}</td>
            <td class="cell-hk">{entry.hk}</td>
            <td class="cell-tax">{formatCurrency(entry.taxRate)}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* ==================================================================
     TABLE CONTAINER - Mess-Tabelle.md: PRIMANOTA VIEW
     ================================================================== */

  .primanota-table-container {
    position: absolute;
    left: 20px;
    top: 194px;
    width: 1580px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ==================================================================
     TABLE - Mess-Tabelle.md: TABLE GENERAL STYLING
     ================================================================== */

  .primanota-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(229, 240, 234);
  }

  /* ==================================================================
     HEADER ROW - Mess-Tabelle.md: TABLE HEADER COLUMNS
     Height: 22px
     ================================================================== */

  .primanota-table thead tr {
    height: 22px;
  }

  .primanota-table th {
    font-size: 13px;
    font-weight: 700;
    color: rgb(34, 34, 34);
    background-color: transparent;
    padding: 1px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    border: 1px solid rgb(221, 221, 221);
  }

  .primanota-table th:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* ==================================================================
     COLUMN WIDTHS - Mess-Tabelle.md: TABLE HEADER COLUMNS (15 columns)
     ================================================================== */

  .col-id { width: 62.78px; }
  .col-pdf { width: 62.78px; }
  .col-w { width: 62.78px; }
  .col-no { width: 62.78px; }
  .col-turnover { width: 104.63px; }
  .col-sh { width: 62.78px; }
  .col-gu { width: 62.78px; }
  .col-bu { width: 62.78px; }
  .col-contra { width: 115.09px; }
  .col-doc { width: 209.27px; }
  .col-date { width: 104.63px; }
  .col-account { width: 94.17px; }
  .col-text { width: 355.75px; }
  .col-hk { width: 62.78px; }
  .col-tax { width: 94.22px; }

  /* ==================================================================
     BODY ROWS - Mess-Tabelle.md: TABLE BODY
     Height: 35px
     ================================================================== */

  .primanota-table tbody tr {
    height: 35px;
  }

  .primanota-table tbody tr:hover {
    background-color: rgba(6, 161, 58, 0.1);
  }

  .primanota-table td {
    border: 1px solid rgb(221, 221, 221);
    padding: 2px 4px;
    font-size: 13px;
    color: rgb(34, 34, 34);
  }

  /* ==================================================================
     CELL TEXT ALIGNMENT - Mess-Tabelle.md: Cell Text Alignment by Column
     ================================================================== */

  .cell-id { text-align: right; }
  .cell-pdf { text-align: center; }
  .cell-w { text-align: center; }
  .cell-no { text-align: right; }
  .cell-turnover { text-align: right; }
  .cell-sh { text-align: center; }
  .cell-gu { text-align: center; }
  .cell-bu { text-align: center; }
  .cell-contra { text-align: right; }
  .cell-doc { text-align: left; }
  .cell-date { text-align: center; }
  .cell-account { text-align: right; }
  .cell-text { text-align: left; }
  .cell-hk { text-align: center; }
  .cell-tax { text-align: right; }

  /* ==================================================================
     NO DATA MESSAGE
     ================================================================== */

  .no-data {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: rgb(85, 85, 85);
  }
</style>
