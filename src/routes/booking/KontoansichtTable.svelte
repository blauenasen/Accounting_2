<!-- KontoansichtTable.svelte -->
<!-- Kontoansicht (Account View) Table - 14 Columns -->
<!-- Measurements from Mess-Tabelle.md: KONTOANSICHT -->

<script lang="ts">
  // Define JournalEntry type for Kontoansicht
  interface KontoansichtEntry {
    id: number;
    pdf?: string;
    w?: string;
    no: number;
    date: string;
    gu: string;
    bu: string;
    contraAccount: number;
    docNumber: string;
    taxRate: number;
    sumSoll: number;
    sumHaben: number;
    balance: number;
    bookingText: string;
  }

  export let entries: KontoansichtEntry[] = [];

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

<!-- TABLE CONTAINER: Y:215.5px (Kontoansicht - after balance fields) -->
<div class="kontoansicht-table-container">
  <table class="kontoansicht-table">
    <thead>
      <tr>
        <!-- 14 COLUMNS - Exact widths from Mess-Tabelle.md -->

        <!-- ID: 31.19px, center -->
        <th class="col-id" on:click={() => sortBy('id')}>
          ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>

        <!-- PDF: 31.19px, center -->
        <th class="col-pdf" on:click={() => sortBy('pdf')}>
          PDF
        </th>

        <!-- W: 31.19px, center -->
        <th class="col-w" on:click={() => sortBy('w')}>
          W
        </th>

        <!-- No: 31.19px, center -->
        <th class="col-no" on:click={() => sortBy('no')}>
          No
        </th>

        <!-- Date: 82.86px, center -->
        <th class="col-date" on:click={() => sortBy('date')}>
          Date
        </th>

        <!-- GU: 31.19px, center -->
        <th class="col-gu" on:click={() => sortBy('gu')}>
          GU
        </th>

        <!-- BU: 31.19px, center -->
        <th class="col-bu" on:click={() => sortBy('bu')}>
          BU
        </th>

        <!-- Contra Acc: 83.86px, center -->
        <th class="col-contra" on:click={() => sortBy('contraAccount')}>
          Contra Acc
        </th>

        <!-- Doc Number: 157.59px, center -->
        <th class="col-doc" on:click={() => sortBy('docNumber')}>
          Doc Number
        </th>

        <!-- TaxRate: 62.80px, center -->
        <th class="col-tax" on:click={() => sortBy('taxRate')}>
          TaxRate
        </th>

        <!-- Sum Soll: 83.86px, center -->
        <th class="col-soll" on:click={() => sortBy('sumSoll')}>
          Sum Soll
        </th>

        <!-- Sum Haben: 83.86px, center -->
        <th class="col-haben" on:click={() => sortBy('sumHaben')}>
          Sum Haben
        </th>

        <!-- Balance: 83.86px, center -->
        <th class="col-balance" on:click={() => sortBy('balance')}>
          Balance
        </th>

        <!-- Booking Text: 305.19px, center -->
        <th class="col-text" on:click={() => sortBy('bookingText')}>
          Booking Text
        </th>
      </tr>
    </thead>
    <tbody>
      {#if entries.length === 0}
        <tr>
          <td colspan="14" class="no-data">No data found for this account</td>
        </tr>
      {:else}
        {#each entries as entry}
          <tr>
            <td class="cell-id">{entry.id}</td>
            <td class="cell-pdf">{entry.pdf || ''}</td>
            <td class="cell-w">{entry.w || ''}</td>
            <td class="cell-no">{entry.no}</td>
            <td class="cell-date">{entry.date}</td>
            <td class="cell-gu">{entry.gu}</td>
            <td class="cell-bu">{entry.bu}</td>
            <td class="cell-contra">{entry.contraAccount}</td>
            <td class="cell-doc">{entry.docNumber}</td>
            <td class="cell-tax">{formatCurrency(entry.taxRate)}</td>
            <td class="cell-soll">{formatCurrency(entry.sumSoll)}</td>
            <td class="cell-haben">{formatCurrency(entry.sumHaben)}</td>
            <td class="cell-balance">{formatCurrency(entry.balance)}</td>
            <td class="cell-text">{entry.bookingText}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* ==================================================================
     TABLE CONTAINER - Mess-Tabelle.md: KONTOANSICHT
     Y:215.5px (after balance fields)
     ================================================================== */

  .kontoansicht-table-container {
    position: absolute;
    left: 20px;
    top: 215.5px;
    width: 1584px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ==================================================================
     TABLE - Mess-Tabelle.md: TABLE GENERAL STYLING
     ================================================================== */

  .kontoansicht-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(229, 240, 234);
  }

  /* ==================================================================
     HEADER ROW - Mess-Tabelle.md: TABLE HEADER COLUMNS
     Height: 22px
     ================================================================== */

  .kontoansicht-table thead tr {
    height: 22px;
  }

  .kontoansicht-table th {
    font-size: 13px;
    font-weight: 600;
    color: rgb(34, 34, 34);
    background-color: transparent;
    padding: 1px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    border: 1px solid rgb(221, 221, 221);
  }

  .kontoansicht-table th:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* ==================================================================
     COLUMN WIDTHS - Mess-Tabelle.md: KONTOANSICHT TABLE (14 columns)
     ================================================================== */

  .col-id { width: 31.19px; }
  .col-pdf { width: 31.19px; }
  .col-w { width: 31.19px; }
  .col-no { width: 31.19px; }
  .col-date { width: 82.86px; }
  .col-gu { width: 31.19px; }
  .col-bu { width: 31.19px; }
  .col-contra { width: 83.86px; }
  .col-doc { width: 157.59px; }
  .col-tax { width: 62.80px; }
  .col-soll { width: 83.86px; }
  .col-haben { width: 83.86px; }
  .col-balance { width: 83.86px; }
  .col-text { width: 305.19px; }

  /* ==================================================================
     BODY ROWS - Mess-Tabelle.md: TABLE BODY
     Height: 35px
     ================================================================== */

  .kontoansicht-table tbody tr {
    height: 35px;
  }

  .kontoansicht-table tbody tr:hover {
    background-color: rgba(6, 161, 58, 0.1);
  }

  .kontoansicht-table td {
    border: 1px solid rgb(221, 221, 221);
    padding: 2px 4px;
    font-size: 13px;
    color: rgb(34, 34, 34);
  }

  /* ==================================================================
     CELL TEXT ALIGNMENT - Mess-Tabelle.md: Cell Alignment
     ================================================================== */

  .cell-id { text-align: right; }
  .cell-pdf { text-align: center; }
  .cell-w { text-align: center; }
  .cell-no { text-align: right; }
  .cell-date { text-align: center; }
  .cell-gu { text-align: center; }
  .cell-bu { text-align: center; }
  .cell-contra { text-align: right; }
  .cell-doc { text-align: left; }
  .cell-tax { text-align: right; }
  .cell-soll { text-align: right; }
  .cell-haben { text-align: right; }
  .cell-balance { text-align: right; }
  .cell-text { text-align: left; }

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
