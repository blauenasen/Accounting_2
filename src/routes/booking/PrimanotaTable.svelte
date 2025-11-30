<!-- PrimanotaTable.svelte -->
<!-- Primanota View Table - 15 Columns -->
<!-- Measurements from Mess-Tabelle.md: PRIMANOTA VIEW -->

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { formatDateUS } from '$lib/utils/dateFormat';
  import { formatPercent } from '$lib/logic/primanota/formatting';
  import PrimanotaTableHeader from '$lib/components/primanota/PrimanotaTableHeader.svelte';
  import PrimanotaFilters from '$lib/components/primanota/PrimanotaFilters.svelte';
  import PrimanotaContextMenu from '$lib/components/primanota/PrimanotaContextMenu.svelte';
  import { isRowStorno } from '$lib/logic/primanota/validation';
  import {
    sortAndFilterRows,
    createInitialFilterState,
    deriveValueOptions,
    type SortState,
    type FilterState
  } from '$lib/utils/tableUtils';

  const dispatch = createEventDispatcher();

  // Define JournalEntry type based on actual API response
  interface JournalEntry {
    IdNr: number;
    pdf_blob?: string;
    Warnung?: string;
    LfdNr: number;
    UE: number;
    SH: string;
    GU: string;
    BU: string;
    GegKto: number;
    BelNr: string;
    Datum: string;
    Kto: number;
    Buchungstext: string;
    BookCircle: number;
    Steuer: string;
    split_group_id?: string | null;
    AusziffNr?: number | null;
    id_invoice?: number | null;
  }

  export let entries: JournalEntry[] = [];
  export let hideStornos = false;
  export let filtersActive = false;

  // Column definitions with exact widths from original
  const PRIMANOTA_COLUMN_WIDTHS = {
    IdNr: 60,
    BL: 60,
    Warnung: 60,
    LfdNr: 60,
    UE: 100,
    SH: 60,
    GU: 60,
    BU: 60,
    GegKto: 110,
    BelNr: 200,
    Datum: 100,
    Kto: 90,
    Buchungstext: 340,
    HK: 60,
    Steuer: 90
  };

  const primanotaColumns = [
    { key: 'IdNr', label: 'ID', width: PRIMANOTA_COLUMN_WIDTHS.IdNr, align: 'right', type: 'number' },
    { key: 'BL', label: 'PDF', width: PRIMANOTA_COLUMN_WIDTHS.BL, align: 'center', type: 'text' },
    { key: 'Warnung', label: 'W', width: PRIMANOTA_COLUMN_WIDTHS.Warnung, align: 'center', type: 'text' },
    { key: 'LfdNr', label: 'No', width: PRIMANOTA_COLUMN_WIDTHS.LfdNr, align: 'right', type: 'number' },
    { key: 'UE', label: 'Turnover', width: PRIMANOTA_COLUMN_WIDTHS.UE, align: 'right', type: 'number' },
    { key: 'SH', label: 'SH', width: PRIMANOTA_COLUMN_WIDTHS.SH, align: 'center', type: 'text' },
    { key: 'GU', label: 'GU', width: PRIMANOTA_COLUMN_WIDTHS.GU, align: 'center', type: 'text' },
    { key: 'BU', label: 'BU', width: PRIMANOTA_COLUMN_WIDTHS.BU, align: 'center', type: 'text' },
    { key: 'GegKto', label: 'Contra Acc', width: PRIMANOTA_COLUMN_WIDTHS.GegKto, align: 'right', type: 'number' },
    { key: 'BelNr', label: 'Doc Number', width: PRIMANOTA_COLUMN_WIDTHS.BelNr, align: 'left', type: 'text' },
    { key: 'Datum', label: 'Date', width: PRIMANOTA_COLUMN_WIDTHS.Datum, align: 'center', type: 'text' },
    { key: 'Kto', label: 'Account', width: PRIMANOTA_COLUMN_WIDTHS.Kto, align: 'right', type: 'number' },
    { key: 'Buchungstext', label: 'Booking Text', width: PRIMANOTA_COLUMN_WIDTHS.Buchungstext, align: 'left', type: 'text' },
    { key: 'BookCircle', label: 'BC', width: PRIMANOTA_COLUMN_WIDTHS.HK, align: 'center', type: 'number' },
    { key: 'Steuer', label: 'TaxRate', width: PRIMANOTA_COLUMN_WIDTHS.Steuer, align: 'right', type: 'text' }
  ];

  // State variables
  let sortState: SortState = { key: 'Datum', direction: 'asc', userSelected: false };
  let filterState: FilterState = createInitialFilterState(primanotaColumns);
  let valueOptions: Record<string, Array<{ label: string; count: number }>> = {};
  let filterVersion = 0;

  // Filter entries based on hideStornos flag
  // Stornos are identified by Warnung (W) column containing '❌'
  $: filteredEntries = hideStornos
    ? entries.filter(entry => entry.Warnung !== '❌')
    : entries;

  // Apply sorting and filtering
  $: displayRows = sortAndFilterRows(filteredEntries, sortState, filterState, filtersActive);

  // Derive value options for autocomplete
  $: valueOptions = deriveValueOptions(filteredEntries, filterState, filtersActive);

  // Row selection and highlighting
  let highlightedRowId: number | null = null;
  let selectedRowId: number | null = null;

  // Context menu state
  let wrapper: HTMLDivElement;
  let contextMenu = { visible: false, x: 0, y: 0, rowIndex: null as number | null };

  function highlightRow(entry: JournalEntry) {
    // Don't highlight storno rows
    if (isRowStornoLocal(entry)) {
      return;
    }
    highlightedRowId = entry.IdNr;
  }

  function selectRow(entry: JournalEntry) {
    // Don't select storno rows
    if (isRowStornoLocal(entry)) {
      return;
    }
    selectedRowId = entry.IdNr;
    dispatch('rowselect', entry);
  }

  // Helper functions to determine row states
  function isRowStornoLocal(entry: JournalEntry): boolean {
    return entry.Warnung === '❌';
  }

  function isSplitEntry(entry: JournalEntry): boolean {
    return entry.split_group_id !== null && entry.split_group_id !== undefined;
  }

  function isReconciled(entry: JournalEntry): boolean {
    return entry.AusziffNr !== null && entry.AusziffNr !== undefined;
  }

  function openPdf(entry: JournalEntry) {
    dispatch('open-pdf', { idNr: entry.IdNr });
  }

  // Event handlers
  function handleSort(event: CustomEvent) {
    sortState = {
      key: event.detail.key,
      direction: event.detail.direction,
      userSelected: event.detail.userSelected
    };
  }

  function handleModeChange(event: CustomEvent) {
    const { column, mode } = event.detail;
    filterState[column.key].mode = mode;
    filterState = filterState; // Trigger reactivity
  }

  function handleValueInput(event: CustomEvent) {
    const { column, value } = event.detail;
    filterState[column.key].inputValue = value;
    filterState = filterState; // Trigger reactivity
  }

  // Format numbers to 2 decimal places
  function formatCurrency(value: number): string {
    return value.toFixed(2);
  }

  // Watch filtersActive changes - reset filters when deactivated
  let previousFiltersActive = filtersActive;
  $: if (filtersActive !== previousFiltersActive) {
    if (!filtersActive) {
      // Reset filters when deactivated
      filterState = createInitialFilterState(primanotaColumns);
      filterVersion += 1;
    }
    previousFiltersActive = filtersActive;
  }

  // Context menu functions
  function resetContextMenu() {
    contextMenu = { visible: false, x: 0, y: 0, rowIndex: null };
  }

  function showContextMenu(event: MouseEvent, index: number) {
    event.preventDefault();
    if (!wrapper) return;

    const row = displayRows?.[index] ?? null;
    if (!row) return;

    // Don't show context menu for storno bookings
    if (isRowStorno(row)) {
      return;
    }

    const SAFETY_MARGIN = 10;
    const MENU_WIDTH = 200;  // Approximate menu width
    const MENU_HEIGHT = 80;  // Approximate menu height (2-3 buttons)

    const clickX = event.clientX;
    const clickY = event.clientY;

    let x = clickX;
    let y = clickY;

    // Check if menu would overflow bottom
    if (y + MENU_HEIGHT + SAFETY_MARGIN > window.innerHeight) {
      y = clickY - MENU_HEIGHT;
    }

    // Check if menu would overflow right
    if (x + MENU_WIDTH + SAFETY_MARGIN > window.innerWidth) {
      x = clickX - MENU_WIDTH;
    }

    // Ensure menu doesn't go beyond edges
    x = Math.max(SAFETY_MARGIN, Math.min(x, window.innerWidth - MENU_WIDTH - SAFETY_MARGIN));
    y = Math.max(SAFETY_MARGIN, Math.min(y, window.innerHeight - MENU_HEIGHT - SAFETY_MARGIN));

    contextMenu = {
      visible: true,
      x,
      y,
      rowIndex: index
    };
  }

  function handleCopyToBookingAction() {
    const rowIndex = contextMenu.rowIndex;
    const row = displayRows?.[rowIndex ?? -1] ?? null;

    if (!row) return;

    resetContextMenu();

    // Check if row is storno (cancelled bookings cannot be copied)
    if (isRowStorno(row)) {
      dispatch('message', { text: 'Cancelled booking cannot be copied', rowIndex });
      return;
    }

    // Create a copy of the row with cleared GU for new entry
    const copiedEntry = {
      ...row,
      GU: '', // Clear GU for new entry
      IdNr: null, // Clear ID for new entry
      pdf_blob: null, // Don't copy PDF
      id_invoice: null // Don't copy invoice link
    };

    // Dispatch to parent - send the copied entry directly with BookCircle
    dispatch('fillform', { formData: copiedEntry, originalRow: row, bookCircle: row.BookCircle });
    dispatch('message', { text: 'Entry copied to booking form', rowIndex });
  }

  function handleDeleteAction() {
    const rowIndex = contextMenu.rowIndex;
    const row = displayRows?.[rowIndex ?? -1] ?? null;

    if (!row) {
      dispatch('message', { text: 'No booking selected', rowIndex });
      resetContextMenu();
      return;
    }

    resetContextMenu();
    dispatch('deleteentry', { bookingData: row });
  }

  function handleContextAction() {
    const rowIndex = contextMenu.rowIndex;
    const row = displayRows?.[rowIndex ?? -1] ?? null;

    if (!row) {
      dispatch('message', { text: 'No booking selected', rowIndex });
      resetContextMenu();
      return;
    }

    resetContextMenu();
    dispatch('cancelentry', { bookingData: row });
  }

  function handleGlobalClick(event: MouseEvent) {
    if (!contextMenu.visible) return;

    // Check if click is within wrapper
    if (wrapper && wrapper.contains(event.target as Node)) return;

    // Check if click is on context menu itself
    const target = event.target as HTMLElement;
    if (target.closest('.context-menu')) return;

    resetContextMenu();
  }

  // Mount/unmount handlers
  onMount(() => {
    window.addEventListener('click', handleGlobalClick, { capture: true });

    // Cleanup function - called when component is destroyed
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  });
</script>

<!-- TABLE CONTAINER: Y:194px (Primanota - no balance fields above) -->
<div class="primanota-table-container" bind:this={wrapper}>
  <table class="primanota-table">
    <thead>
      <PrimanotaTableHeader
        columns={primanotaColumns}
        {sortState}
        on:sort={handleSort} />

      {#if filtersActive}
        <PrimanotaFilters
          columns={primanotaColumns}
          {filterState}
          {valueOptions}
          {filterVersion}
          on:mode-change={handleModeChange}
          on:value-input={handleValueInput} />
      {/if}
    </thead>
    <tbody>
      {#if displayRows.length === 0}
        <tr>
          <td colspan="15" class="no-data">
            {filtersActive ? 'No entries match the filter criteria' : 'No data found for this month'}
          </td>
        </tr>
      {:else}
        {#each displayRows as entry, index}
          <tr
            on:click={() => highlightRow(entry)}
            on:dblclick={() => selectRow(entry)}
            on:contextmenu={(e) => showContextMenu(e, index)}
            class="data-row"
            class:highlighted={highlightedRowId === entry.IdNr}
            class:selected={selectedRowId === entry.IdNr}
            class:storno={isRowStornoLocal(entry)}
            class:split-entry={isSplitEntry(entry)}
            class:reconciled={isReconciled(entry)}>
            <td class="cell-id">{entry.IdNr}</td>
            <td class="cell-pdf">
              {#if entry.pdf_blob || entry.id_invoice}
                <span
                  class="pdf-icon"
                  role="button"
                  tabindex="0"
                  title="Open PDF"
                  on:click|stopPropagation={() => openPdf(entry)}
                  on:keydown={(e) => e.key === 'Enter' && openPdf(entry)}>📄</span>
              {/if}
            </td>
            <td class="cell-w">
              <span class="icon-container">
                {#if isSplitEntry(entry)}
                  <span class="split-icon" title="Split invoice entry (Group: {entry.split_group_id?.substring(0, 8)})">⊞</span>
                {/if}
                <span class="reconciliation-icon">{entry.Warnung || ''}</span>
              </span>
            </td>
            <td class="cell-no">{entry.LfdNr}</td>
            <td class="cell-turnover">{formatCurrency(entry.UE)}</td>
            <td class="cell-sh">{entry.SH}</td>
            <td class="cell-gu">{entry.GU || ''}</td>
            <td class="cell-bu">{entry.BU}</td>
            <td class="cell-contra">{entry.GegKto}</td>
            <td class="cell-doc">{entry.BelNr}</td>
            <td class="cell-date">{formatDateUS(entry.Datum)}</td>
            <td class="cell-account">{entry.Kto}</td>
            <td class="cell-text">{entry.Buchungstext}</td>
            <td class="cell-hk">{entry.BookCircle}</td>
            <td class="cell-tax">{formatPercent(entry.Steuer)}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<PrimanotaContextMenu
  visible={contextMenu.visible}
  x={contextMenu.x}
  y={contextMenu.y}
  row={displayRows?.[contextMenu.rowIndex ?? -1]}
  rowIndex={contextMenu.rowIndex}
  viewMode="primanota"
  on:copytobooking={handleCopyToBookingAction}
  on:delete={handleDeleteAction}
  on:cancel={handleContextAction}
/>

<style>
  /* ==================================================================
     TABLE CONTAINER - Mess-Tabelle.md: PRIMANOTA VIEW
     ================================================================== */

  .primanota-table-container {
    position: absolute;
    left: 10px;
    top: 130px;
    width: 1580px;
    max-height: 800px;
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

  .primanota-table thead {
    position: sticky;
    top: 0;
    z-index: 3;
  }

  .primanota-table th {
    font-size: 13px;
    font-weight: 700;
    color: rgb(34, 34, 34);
    background-color: rgb(229, 240, 234);
    padding: 1px;
    text-align: center;
    border: 1px solid rgb(221, 221, 221);
  }

  /* ==================================================================
     BODY ROWS - Mess-Tabelle.md: TABLE BODY
     Height: 35px
     ================================================================== */

  .primanota-table tbody tr {
    height: 35px;
  }

  .primanota-table tbody tr.data-row {
    cursor: pointer;
  }

  /* Standard hover effect - exact color from original */
  .primanota-table tbody tr:hover td {
    background: #98ecb7;
    cursor: pointer;
  }

  /* Highlighted rows */
  .primanota-table tbody tr.highlighted td {
    background-color: #a5d6a7 !important;
  }

  .primanota-table tbody tr:nth-child(even).highlighted td {
    background-color: #81c784 !important;
  }

  .primanota-table tbody tr.highlighted:hover td {
    background-color: #66bb6a !important;
    cursor: pointer;
  }

  .primanota-table tbody tr:nth-child(even).highlighted:hover td {
    background-color: #4caf50 !important;
    cursor: pointer;
  }

  /* Selected rows (double-click) - light blue, highest priority */
  .primanota-table tbody tr.selected td,
  .primanota-table tbody tr:nth-child(even).selected td {
    background-color: #bbdefb !important;
  }

  .primanota-table tbody tr.selected:hover td,
  .primanota-table tbody tr:nth-child(even).selected:hover td {
    background-color: #90caf9 !important;
    cursor: pointer;
  }

  /* Storno rows - gray, italic, no hover */
  .primanota-table tbody tr.storno td {
    background: #e5e5e5;
    color: #999;
    font-style: italic;
  }

  .primanota-table tbody tr.storno:hover td {
    background: #e5e5e5;
    cursor: not-allowed;
  }

  /* Reconciled rows - light green */
  .primanota-table tbody tr.reconciled td {
    background-color: #e8f5e9 !important;
  }

  .primanota-table tbody tr:nth-child(even).reconciled td {
    background-color: #d8edd9 !important;
  }

  .primanota-table tbody tr.reconciled:hover td {
    background-color: #c8e6c9 !important;
  }

  /* Split invoice entries - orange border and background */
  .primanota-table tbody tr.split-entry td {
    border-left: 3px solid #ff9800 !important;
  }

  .primanota-table tbody tr.split-entry td:first-child {
    border-left: 3px solid #ff9800 !important;
  }

  .primanota-table tbody tr:nth-child(even).split-entry td {
    background-color: #fff8f0;
  }

  .primanota-table tbody tr.split-entry:hover td {
    background-color: #ffe0b2 !important;
  }

  .primanota-table td {
    border: 1px solid rgb(221, 221, 221);
    padding: 2px 4px;
    font-size: 13px;
    color: rgb(34, 34, 34);
    user-select: none;
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

  /* ==================================================================
     ICONS - PDF, Split, Reconciliation
     ================================================================== */

  /* PDF Icon with transform effect */
  .pdf-icon {
    cursor: pointer;
    font-size: 18px;
    user-select: none;
    display: inline-block;
    transition: transform 0.1s ease;
  }

  .pdf-icon:hover {
    transform: scale(1.2);
  }

  .pdf-icon:active {
    transform: scale(0.95);
  }

  /* Icon container for warning column */
  .icon-container {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
  }

  /* Split icon */
  .split-icon {
    font-size: 14px;
    color: #ff9800;
    font-weight: bold;
    display: inline-block;
  }

  /* Reconciliation icon (checkmark) */
  .reconciliation-icon {
    font-size: 16px;
  }
</style>
