<!-- src/lib/components/primanota/PrimanotaTableRow.svelte -->
<script lang="ts">
  // Single row component for Primanota table with event handling
  import { createEventDispatcher } from 'svelte';
  import type { JournalRow } from '$lib/types/ui.js';
  import type { TableColumn } from './config/tableColumns.js';
  import { viewModeStore } from '$lib/stores/viewModeStore.js';
  import { selectionStore } from '$lib/stores/selectionStore.js';
  import { hasValue } from '$lib/utils/stringNormalizer.js';

  const dispatch = createEventDispatcher<{
    'row-click': { index: number; originalEvent: MouseEvent };
    'row-dblclick': { index: number };
    'row-contextmenu': { event: MouseEvent; index: number };
    'account-field-dblclick': { field: string; row: JournalRow };
    'open-pdf': { idNr: number };
  }>();

  // Props
  export let row: JournalRow;
  export let columns: TableColumn[];
  export let index: number;
  export let highlighted: boolean = false;
  export let selectedCircle: number = 0;

  // Computed properties
  $: isStorno = hasValue(row?.GU);
  $: isLocked = Boolean(row?.Gesperrt);
  $: hasPdf = Boolean(row?.pdf_blob);
  $: isMatchingCircle = selectedCircle > 0 && row?.BookCircle === selectedCircle;
  // Multi-selection for Primanota View
  $: isSelected = $viewModeStore.mode === 'primanota' && row?.IdNr ? $selectionStore.selectedIds.has(row.IdNr) : false;

  /**
   * Handle row click
   */
  function handleRowClick(event: MouseEvent): void {
    dispatch('row-click', { index, originalEvent: event });
  }

  /**
   * Handle row double-click
   */
  function handleRowDblClick(): void {
    dispatch('row-dblclick', { index });
  }

  /**
   * Handle context menu
   */
  function handleContextMenu(event: MouseEvent): void {
    dispatch('row-contextmenu', { event, index });
  }

  /**
   * Handle PDF icon click
   */
  function handlePdfClick(event: MouseEvent): void {
    event.stopPropagation();
    if (hasPdf && row?.IdNr) {
      dispatch('open-pdf', { idNr: row.IdNr });
    }
  }

  /**
   * Format cell value based on column type
   */
  function formatCellValue(column: TableColumn, row: JournalRow): string {
    const value = row[column.key as keyof JournalRow];

    if (value === null || value === undefined) {
      return '';
    }

    // Format based on column format
    if (column.format === 'money') {
      const num = Number.parseFloat(String(value));
      if (Number.isNaN(num)) return String(value);
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (column.format === 'date') {
      const dateStr = String(value);
      if (!dateStr) return '';
      // Convert YYYY-MM-DD to MM/DD/YYYY
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const [, yyyy, mm, dd] = match;
        return `${mm}/${dd}/${yyyy}`;
      }
      return dateStr;
    }

    if (column.format === 'percent') {
      const num = Number.parseFloat(String(value));
      if (Number.isNaN(num)) return String(value);
      return `${(num * 100).toFixed(2)}%`;
    }

    return String(value);
  }

  /**
   * Get cell class based on column and row state
   */
  function getCellClass(column: TableColumn): string {
    const classes: string[] = [];

    if (column.align === 'right') classes.push('text-right');
    if (column.align === 'center') classes.push('text-center');

    // Special styling for specific columns
    if (column.key === 'SH' && row.SH === 'H') {
      classes.push('sh-haben');
    }

    if (column.key === 'BL' && hasPdf) {
      classes.push('has-pdf');
    }

    return classes.join(' ');
  }
</script>

<tr
  class="primanota-row"
  class:storno={isStorno}
  class:locked={isLocked}
  class:highlighted
  class:matching-circle={isMatchingCircle}
  class:multi-selected={isSelected}
  on:click={handleRowClick}
  on:dblclick={handleRowDblClick}
  on:contextmenu={handleContextMenu}
  role="row"
  tabindex="-1"
>
  {#each columns as column (column.key)}
    <td
      class={getCellClass(column)}
      role="gridcell"
    >
      {#if column.key === 'BL'}
        {#if hasPdf}
          <button
            type="button"
            class="pdf-icon"
            on:click={handlePdfClick}
            title="Open PDF"
            aria-label="Open PDF"
          >
            📄
          </button>
        {/if}
      {:else if column.key === 'Warnung'}
        {#if row.Warnung}
          <span class="warning-icon" title={row.Warnung}>⚠️</span>
        {/if}
      {:else}
        {formatCellValue(column, row)}
      {/if}
    </td>
  {/each}
</tr>

<style>
  .primanota-row {
    border-bottom: 1px solid #ddd;
    background: #fff;
    transition: background-color 0.1s ease;
  }

  .primanota-row:hover td {
    background-color: #98ecb7 !important;
    cursor: pointer;
  }

  .primanota-row.highlighted {
    background-color: #fffacd !important;
    font-weight: bold;
  }

  .primanota-row.storno {
    background-color: #ffe6e6;
    text-decoration: line-through;
    opacity: 0.7;
  }

  .primanota-row.locked {
    background-color: #f5f5f5;
  }

  .primanota-row.matching-circle {
    background-color: #e8f5e9;
  }

  /* Multi-selection - blue background with white text */
  .primanota-row.multi-selected td,
  .primanota-row:nth-child(even).multi-selected td {
    background-color: #1976d2 !important;
    color: white !important;
  }

  .primanota-row.multi-selected:hover td,
  .primanota-row:nth-child(even).multi-selected:hover td {
    background-color: #1565c0 !important;
    color: white !important;
  }

  td {
    padding: 4px 6px;
    font-size: 13px;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-right: 1px solid #e0e0e0;
    user-select: none;
  }

  td:last-child {
    border-right: none;
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }

  .sh-haben {
    color: #dc2626;
    font-weight: bold;
  }

  .has-pdf {
    text-align: center;
  }

  .pdf-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 2px;
    transition: transform 0.1s ease;
  }

  .pdf-icon:hover {
    transform: scale(1.2);
  }

  .warning-icon {
    font-size: 14px;
    cursor: help;
  }
</style>
