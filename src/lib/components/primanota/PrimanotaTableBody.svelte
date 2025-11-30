<!-- src/lib/components/primanota/PrimanotaTableBody.svelte -->
<script lang="ts">
  // Table body component with row rendering and event forwarding
  import { createEventDispatcher } from 'svelte';
  import type { JournalRow } from '$lib/types/ui.js';
  import type { TableColumn } from './config/tableColumns.js';
  import PrimanotaTableRow from './PrimanotaTableRow.svelte';

  const dispatch = createEventDispatcher<{
    'row-click': { index: number; originalEvent: MouseEvent };
    'row-dblclick': { index: number };
    'row-contextmenu': { event: MouseEvent; index: number };
    'account-field-dblclick': { field: string; row: JournalRow };
    'open-pdf': { idNr: number };
  }>();

  // Props
  export let displayRows: JournalRow[] = [];
  export let columns: TableColumn[] = [];
  export let selectedCircle: number = 0;
  export let highlightedRow: { idNr: number | null } | null = null;

  /**
   * Check if row is highlighted
   */
  function isRowHighlighted(row: JournalRow): boolean {
    if (!highlightedRow) return false;
    if (highlightedRow.idNr === null) return false;
    return row?.IdNr === highlightedRow.idNr;
  }

  /**
   * Forward row click event
   */
  function handleRowClick(event: CustomEvent): void {
    dispatch('row-click', event.detail);
  }

  /**
   * Forward row double-click event
   */
  function handleRowDblClick(event: CustomEvent): void {
    dispatch('row-dblclick', event.detail);
  }

  /**
   * Forward row context menu event
   */
  function handleRowContextMenu(event: CustomEvent): void {
    dispatch('row-contextmenu', event.detail);
  }

  /**
   * Forward account field double-click event
   */
  function handleAccountFieldDblClick(event: CustomEvent): void {
    dispatch('account-field-dblclick', event.detail);
  }

  /**
   * Forward open PDF event
   */
  function handleOpenPdf(event: CustomEvent): void {
    dispatch('open-pdf', event.detail);
  }
</script>

<tbody>
  {#if displayRows.length === 0}
    <tr>
      <td colspan={columns.length} class="no-data">
        No entries to display
      </td>
    </tr>
  {:else}
    {#each displayRows as row, index (row.IdNr || `row-${index}`)}
      <PrimanotaTableRow
        {row}
        {columns}
        {index}
        {selectedCircle}
        highlighted={isRowHighlighted(row)}
        on:row-click={handleRowClick}
        on:row-dblclick={handleRowDblClick}
        on:row-contextmenu={handleRowContextMenu}
        on:account-field-dblclick={handleAccountFieldDblClick}
        on:open-pdf={handleOpenPdf}
      />
    {/each}
  {/if}
</tbody>

<style>
  tbody {
    background: #fff;
  }

  .no-data {
    text-align: center;
    padding: 20px;
    color: #999;
    font-style: italic;
  }
</style>
