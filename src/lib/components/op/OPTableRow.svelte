<!-- OPTableRow.svelte -->
<!-- Single row component for OP table with event handling -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formatDateUS } from '$lib/utils/dateFormat';
  import { viewModeStore } from '$lib/stores/viewModeStore.js';
  import { selectionStore } from '$lib/stores/selectionStore.js';

  // Define OP entry interface
  interface OPEntry {
    IdNr?: number;
    id?: number;
    PDF?: string;
    pdf?: string;
    Warnung?: string;
    w?: string;
    X?: string;
    x?: string;
    T?: string;
    t?: string;
    GU?: string;
    gu?: string;
    BelNr?: string;
    docNumber?: string;
    Datum?: string;
    date?: string;
    Faelligkeit?: string;
    dueDate?: string;
    Buchungstext?: string;
    BText?: string;
    bookingText?: string;
    Brutto?: number;
    grossPrice?: number;
    ContraAccDynamic?: number;
    contraAccount?: number;
    BU?: string;
    buNr?: string;
    BookCircle?: number;
    bookC?: string;
    [key: string]: any;
  }

  const dispatch = createEventDispatcher<{
    'row-dblclick': { entry: OPEntry; index: number };
    'row-click': { entry: OPEntry; index: number };
    'row-contextmenu': { event: MouseEvent; entry: OPEntry; index: number };
  }>();

  // Props
  export let entry: OPEntry;
  export let index: number;

  // Format currency to 2 decimal places
  function formatCurrency(value: number | string | undefined): string {
    if (value === undefined || value === null || value === '') {
      return '0.00';
    }
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) {
      return '0.00';
    }
    return num.toFixed(2);
  }

  // Multi-selection for OP View
  $: isSelected = $viewModeStore.mode === 'op' && entry?.IdNr
    ? $selectionStore.selectedIds.has(entry.IdNr)
    : false;

  // Event handlers
  function handleRowDblClick(): void {
    dispatch('row-dblclick', { entry, index });
  }

  function handleRowClick(event: MouseEvent): void {
    dispatch('row-click', { entry, index, event });
  }

  function handleContextMenu(event: MouseEvent): void {
    dispatch('row-contextmenu', { event, entry, index });
  }
</script>

<tr
  class:multi-selected={isSelected}
  on:dblclick={handleRowDblClick}
  on:click={handleRowClick}
  on:contextmenu={handleContextMenu}>
  <td class="cell-id">{entry.IdNr || entry.id}</td>
  <td class="cell-pdf">{entry.PDF || entry.pdf || ''}</td>
  <td class="cell-w">{entry.Warnung || entry.w || ''}</td>
  <td class="cell-x">{entry.X || entry.x || ''}</td>
  <td class="cell-t">{entry.T || entry.t || ''}</td>
  <td class="cell-gu">{entry.GU || entry.gu || ''}</td>
  <td class="cell-doc">{entry.BelNr || entry.docNumber}</td>
  <td class="cell-date">{formatDateUS(entry.Datum || entry.date)}</td>
  <td class="cell-due-date">{formatDateUS(entry.Faelligkeit || entry.dueDate)}</td>
  <td class="cell-text">{entry.Buchungstext || entry.BText || entry.bookingText}</td>
  <td class="cell-price">{formatCurrency(entry.Brutto || entry.grossPrice)}</td>
  <td class="cell-contra">{entry.ContraAccDynamic || entry.contraAccount}</td>
  <td class="cell-bunr">{entry.BU || entry.buNr || ''}</td>
  <td class="cell-bookc">{entry.BookCircle || entry.bookC || ''}</td>
</tr>

<style>
  tr {
    height: 35px;
  }

  tr:hover {
    background-color: rgba(6, 161, 58, 0.1);
  }

  td {
    border: 1px solid rgb(221, 221, 221);
    padding: 2px 4px;
    font-size: 13px;
    color: rgb(34, 34, 34);
    user-select: none;
  }

  /* Multi-selection - blue background with white text */
  tr.multi-selected td,
  tr:nth-child(even).multi-selected td {
    background-color: #1976d2 !important;
    color: white !important;
  }

  tr.multi-selected:hover td,
  tr:nth-child(even).multi-selected:hover td {
    background-color: #1565c0 !important;
    color: white !important;
  }

  .cell-id { text-align: right; }
  .cell-pdf { text-align: center; }
  .cell-w { text-align: center; }
  .cell-x { text-align: center; }
  .cell-t { text-align: center; }
  .cell-gu { text-align: center; }
  .cell-doc { text-align: left; }
  .cell-date { text-align: center; }
  .cell-due-date { text-align: center; }
  .cell-text { text-align: left; }
  .cell-price { text-align: right; }
  .cell-contra { text-align: right; }
  .cell-bunr { text-align: center; }
  .cell-bookc { text-align: center; }
</style>
