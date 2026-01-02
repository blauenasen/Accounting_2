<!-- KontoansichtTableRow.svelte -->
<!-- Single row component for Kontoansicht table with event handling -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formatDateUS } from '$lib/utils/dateFormat';
  import { viewModeStore } from '$lib/stores/viewModeStore.js';
  import { selectionStore } from '$lib/stores/selectionStore.js';

  // Define entry interface
  interface KontoansichtEntry {
    IdNr?: number;
    id?: number;
    PDF?: string;
    pdf?: string;
    Warnung?: string;
    w?: string;
    LfdNr?: number;
    no?: number;
    Datum?: string;
    date?: string;
    GU?: string;
    gu?: string;
    BU?: string;
    bu?: string;
    ContraAccDynamic?: number;
    contraAccount?: number;
    BelNr?: string;
    docNumber?: string;
    Steuer?: number;
    taxRate?: number;
    SumSoll?: number;
    sumSoll?: number;
    SumHaben?: number;
    sumHaben?: number;
    Balance?: number;
    balance?: number;
    Buchungstext?: string;
    BText?: string;
    bookingText?: string;
    BookCircle?: number;
  }

  const dispatch = createEventDispatcher<{
    'row-dblclick': { entry: KontoansichtEntry; index: number };
    'row-click': { entry: KontoansichtEntry; index: number };
    'row-contextmenu': { event: MouseEvent; entry: KontoansichtEntry; index: number };
  }>();

  // Props
  export let entry: KontoansichtEntry;
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

  // Format percent to 2 decimal places with % sign
  function formatPercent(value: number | string | undefined): string {
    if (value === undefined || value === null || value === '') {
      return '0.00%';
    }
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) {
      return '0.00%';
    }
    return `${(num * 100).toFixed(2)}%`;
  }

  // Multi-selection for Kontoansicht View
  $: isSelected = $viewModeStore.mode === 'account' && entry?.IdNr
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
  <td class="cell-no">{entry.LfdNr || entry.no}</td>
  <td class="cell-date">{formatDateUS(entry.Datum || entry.date)}</td>
  <td class="cell-gu">{entry.GU || entry.gu || ''}</td>
  <td class="cell-bu">{entry.BU || entry.bu || ''}</td>
  <td class="cell-contra">{entry.ContraAccDynamic || entry.GegKto || entry.contraAccount}</td>
  <td class="cell-doc">{entry.BelNr || entry.docNumber}</td>
  <td class="cell-tax">{formatPercent(entry.Steuer || entry.taxRate)}</td>
  <td class="cell-soll">{formatCurrency(entry.SumSoll || entry.sumSoll)}</td>
  <td class="cell-haben">{formatCurrency(entry.SumHaben || entry.sumHaben)}</td>
  <td class="cell-balance">{formatCurrency(entry.Balance || entry.balance)}</td>
  <td class="cell-text">{entry.Buchungstext || entry.BText || entry.bookingText}</td>
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
</style>
