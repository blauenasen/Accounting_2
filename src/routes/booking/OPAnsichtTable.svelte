<!-- OPAnsichtTable.svelte -->
<!-- OP-Ansicht (Open Items View) Table - 14 Columns with Due Date -->
<!-- Measurements from Mess-Tabelle.md: OP-ANSICHT -->

<script lang="ts">
  // Define OPEntry type for OP-Ansicht
  interface OPEntry {
    id: number;
    pdf?: string;
    w?: string;
    x?: string;
    t?: string;
    gu: string;
    docNumber: string;
    date: string;
    dueDate: string; // CRITICAL - unique to OP!
    bookingText: string;
    grossPrice: number;
    contraAccount: number;
    buNr: string;
    bookC: string;
  }

  export let entries: OPEntry[] = [];

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

  // Format currency to 2 decimal places
  function formatCurrency(value: number): string {
    return value.toFixed(2);
  }
</script>

<!-- TABLE CONTAINER: Y:257px (OP-Ansicht - after balance fields) -->
<div class="op-table-container">
  <table class="op-table">
    <thead>
      <tr>
        <!-- 14 COLUMNS - Exact widths from Mess-Tabelle.md -->

        <!-- ID: 35px, center -->
        <th class="col-id" on:click={() => sortBy('id')}>
          ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>

        <!-- PDF: 35px, center -->
        <th class="col-pdf" on:click={() => sortBy('pdf')}>
          PDF
        </th>

        <!-- W: 35px, center -->
        <th class="col-w" on:click={() => sortBy('w')}>
          W
        </th>

        <!-- X: 35px, center -->
        <th class="col-x" on:click={() => sortBy('x')}>
          X
        </th>

        <!-- T: 35px, center -->
        <th class="col-t" on:click={() => sortBy('t')}>
          T
        </th>

        <!-- GU: 35px, center -->
        <th class="col-gu" on:click={() => sortBy('gu')}>
          GU
        </th>

        <!-- Doc Number: 170px, center -->
        <th class="col-doc" on:click={() => sortBy('docNumber')}>
          Doc Number
        </th>

        <!-- Date: 90px, center -->
        <th class="col-date" on:click={() => sortBy('date')}>
          Date
        </th>

        <!-- Due Date: 91px, center - CRITICAL! -->
        <th class="col-due-date" on:click={() => sortBy('dueDate')}>
          Due Date
        </th>

        <!-- Booking Text: 237px, center -->
        <th class="col-text" on:click={() => sortBy('bookingText')}>
          Booking Text
        </th>

        <!-- Gross Price: 102px, center -->
        <th class="col-price" on:click={() => sortBy('grossPrice')}>
          Gross Price
        </th>

        <!-- Contra Account: 102px, center -->
        <th class="col-contra" on:click={() => sortBy('contraAccount')}>
          Contra Account
        </th>

        <!-- BuNr: 91px, center -->
        <th class="col-bunr" on:click={() => sortBy('buNr')}>
          BuNr
        </th>

        <!-- BookC: 35px, center -->
        <th class="col-bookc" on:click={() => sortBy('bookC')}>
          BookC
        </th>
      </tr>
    </thead>
    <tbody>
      {#if entries.length === 0}
        <tr>
          <td colspan="14" class="no-data">No open items found</td>
        </tr>
      {:else}
        {#each entries as entry}
          <tr>
            <td class="cell-id">{entry.id}</td>
            <td class="cell-pdf">{entry.pdf || ''}</td>
            <td class="cell-w">{entry.w || ''}</td>
            <td class="cell-x">{entry.x || ''}</td>
            <td class="cell-t">{entry.t || ''}</td>
            <td class="cell-gu">{entry.gu}</td>
            <td class="cell-doc">{entry.docNumber}</td>
            <td class="cell-date">{entry.date}</td>
            <td class="cell-due-date">{entry.dueDate}</td>
            <td class="cell-text">{entry.bookingText}</td>
            <td class="cell-price">{formatCurrency(entry.grossPrice)}</td>
            <td class="cell-contra">{entry.contraAccount}</td>
            <td class="cell-bunr">{entry.buNr}</td>
            <td class="cell-bookc">{entry.bookC}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* ==================================================================
     TABLE CONTAINER - Mess-Tabelle.md: OP-ANSICHT
     Y:257px (after balance fields)
     ================================================================== */

  .op-table-container {
    position: absolute;
    left: 18px;
    top: 257px;
    width: 1580px;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(204, 204, 204);
  }

  /* ==================================================================
     TABLE - Mess-Tabelle.md: TABLE GENERAL STYLING
     ================================================================== */

  .op-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(229, 240, 234);
  }

  /* ==================================================================
     HEADER ROW - Mess-Tabelle.md: OP TABLE HEADER
     Y:273px, Height: 22px
     ================================================================== */

  .op-table thead tr {
    height: 22px;
  }

  .op-table th {
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

  .op-table th:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* ==================================================================
     COLUMN WIDTHS - Mess-Tabelle.md: OP TABLE (14 columns)
     CRITICAL: Due Date column (91px) is unique to OP!
     ================================================================== */

  .col-id { width: 35px; }
  .col-pdf { width: 35px; }
  .col-w { width: 35px; }
  .col-x { width: 35px; }
  .col-t { width: 35px; }
  .col-gu { width: 35px; }
  .col-doc { width: 170px; }
  .col-date { width: 90px; }
  .col-due-date { width: 91px; } /* CRITICAL - unique to OP! */
  .col-text { width: 237px; }
  .col-price { width: 102px; }
  .col-contra { width: 102px; }
  .col-bunr { width: 91px; }
  .col-bookc { width: 35px; }

  /* ==================================================================
     BODY ROWS - Mess-Tabelle.md: TABLE BODY
     Height: 35px
     ================================================================== */

  .op-table tbody tr {
    height: 35px;
  }

  .op-table tbody tr:hover {
    background-color: rgba(6, 161, 58, 0.1);
  }

  .op-table td {
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
  .cell-x { text-align: center; }
  .cell-t { text-align: center; }
  .cell-gu { text-align: center; }
  .cell-doc { text-align: left; }
  .cell-date { text-align: center; }
  .cell-due-date { text-align: center; } /* CRITICAL column */
  .cell-text { text-align: left; }
  .cell-price { text-align: right; }
  .cell-contra { text-align: right; }
  .cell-bunr { text-align: center; }
  .cell-bookc { text-align: center; }

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
