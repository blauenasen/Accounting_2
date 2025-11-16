<script lang="ts">
  // src/lib/components/shared/Table.svelte
  // Reusable table component with sorting, filtering, and selection

  import { createEventDispatcher } from 'svelte';
  import type { TableColumn, SortState } from '$lib/types/ui.js';

  /**
   * Table columns configuration
   */
  export let columns: TableColumn[] = [];

  /**
   * Table rows data
   */
  export let rows: Record<string, unknown>[] = [];

  /**
   * Current sort state
   */
  export let sortState: SortState | null = null;

  /**
   * Enable row selection
   */
  export let selectable: boolean = false;

  /**
   * Selected row IDs
   */
  export let selectedIds: Set<number> = new Set();

  /**
   * Enable striped rows
   */
  export let striped: boolean = true;

  /**
   * Enable hover effect
   */
  export let hoverable: boolean = true;

  /**
   * Table size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Loading state
   */
  export let loading: boolean = false;

  /**
   * Empty message
   */
  export let emptyMessage: string = 'No data available';

  /**
   * Row key field (for selection)
   */
  export let rowKey: string = 'id';

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  const dispatch = createEventDispatcher<{
    sort: { column: string; direction: 'asc' | 'desc' };
    select: { id: number; selected: boolean };
    selectAll: { selected: boolean };
    rowClick: { row: Record<string, unknown>; index: number };
  }>();

  /**
   * Computed table classes
   */
  $: tableClasses = [
    'table',
    `table-${size}`,
    striped ? 'table-striped' : '',
    hoverable ? 'table-hoverable' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Computed visible columns
   */
  $: visibleColumns = columns.filter(col => col.visible !== false);

  /**
   * Handle column header click for sorting
   */
  function handleSort(column: TableColumn) {
    if (!column.sortable) return;

    const newDirection: 'asc' | 'desc' =
      sortState?.column === column.key && sortState?.direction === 'asc' ? 'desc' : 'asc';

    sortState = {
      column: column.key,
      direction: newDirection
    };

    dispatch('sort', sortState);
  }

  /**
   * Handle row selection
   */
  function handleRowSelect(rowId: number) {
    const newSelected = new Set(selectedIds);

    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }

    selectedIds = newSelected;
    dispatch('select', { id: rowId, selected: newSelected.has(rowId) });
  }

  /**
   * Handle select all
   */
  function handleSelectAll(event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      selectedIds = new Set(rows.map(row => Number(row[rowKey])));
    } else {
      selectedIds = new Set();
    }

    dispatch('selectAll', { selected: checked });
  }

  /**
   * Check if all rows are selected
   */
  $: allSelected = rows.length > 0 && selectedIds.size === rows.length;

  /**
   * Check if some rows are selected
   */
  $: someSelected = selectedIds.size > 0 && selectedIds.size < rows.length;

  /**
   * Format cell value
   */
  function formatCell(column: TableColumn, row: Record<string, unknown>): string {
    const value = row[column.key];

    if (column.format) {
      return column.format(value);
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  /**
   * Get sort icon
   */
  function getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';

    if (sortState?.column === column.key) {
      return sortState.direction === 'asc' ? '↑' : '↓';
    }

    return '↕';
  }

  /**
   * Handle row click
   */
  function handleRowClick(row: Record<string, unknown>, index: number) {
    dispatch('rowClick', { row, index });
  }
</script>

<div class="table-wrapper">
  {#if loading}
    <div class="table-loading">
      <div class="table-spinner">Loading...</div>
    </div>
  {/if}

  <table class={tableClasses}>
    <thead class="table-header">
      <tr>
        {#if selectable}
          <th class="table-cell table-cell-checkbox">
            <input
              type="checkbox"
              checked={allSelected}
              indeterminate={someSelected}
              on:change={handleSelectAll}
              aria-label="Select all rows"
            />
          </th>
        {/if}

        {#each visibleColumns as column}
          <th
            class="table-cell table-header-cell"
            class:sortable={column.sortable}
            class:sorted={sortState?.column === column.key}
            style:width={column.width}
            style:text-align={column.align || 'left'}
            on:click={() => handleSort(column)}
            on:keydown={(e) => e.key === 'Enter' && handleSort(column)}
            role={column.sortable ? 'button' : undefined}
            tabindex={column.sortable ? 0 : undefined}
          >
            <div class="table-header-content">
              <span>{column.label}</span>
              {#if column.sortable}
                <span class="table-sort-icon">{getSortIcon(column)}</span>
              {/if}
            </div>
          </th>
        {/each}
      </tr>
    </thead>

    <tbody class="table-body">
      {#if rows.length === 0 && !loading}
        <tr>
          <td
            class="table-cell table-empty"
            colspan={selectable ? visibleColumns.length + 1 : visibleColumns.length}
          >
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each rows as row, index}
          {@const rowId = Number(row[rowKey])}
          {@const isSelected = selectedIds.has(rowId)}

          <tr
            class="table-row"
            class:selected={isSelected}
            on:click={() => handleRowClick(row, index)}
            on:keydown={(e) => e.key === 'Enter' && handleRowClick(row, index)}
            role="row"
            tabindex="0"
          >
            {#if selectable}
              <td class="table-cell table-cell-checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  on:change={() => handleRowSelect(rowId)}
                  on:click={(e) => e.stopPropagation()}
                  aria-label="Select row"
                />
              </td>
            {/if}

            {#each visibleColumns as column}
              <td
                class="table-cell"
                style:text-align={column.align || 'left'}
              >
                {formatCell(column, row)}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  .table-wrapper {
    position: relative;
    width: 100%;
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    background-color: #ffffff;
  }

  /* Sizes */
  .table-small .table-cell {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .table-medium .table-cell {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .table-large .table-cell {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  /* Header */
  .table-header {
    background-color: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  }

  .table-header-cell {
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
  }

  .table-header-cell.sortable {
    cursor: pointer;
    user-select: none;
  }

  .table-header-cell.sortable:hover {
    background-color: #f3f4f6;
  }

  .table-header-cell.sorted {
    background-color: #e5e7eb;
  }

  .table-header-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .table-sort-icon {
    color: #9ca3af;
    font-size: 0.875em;
  }

  .table-header-cell.sorted .table-sort-icon {
    color: #3b82f6;
  }

  /* Body */
  .table-body .table-row {
    border-bottom: 1px solid #e5e7eb;
  }

  .table-striped .table-body .table-row:nth-child(even) {
    background-color: #f9fafb;
  }

  .table-hoverable .table-body .table-row:hover {
    background-color: #f3f4f6;
  }

  .table-body .table-row.selected {
    background-color: #dbeafe;
  }

  .table-body .table-row:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  /* Cell */
  .table-cell {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: #1f2937;
  }

  .table-cell-checkbox {
    width: 2.5rem;
    text-align: center;
  }

  .table-empty {
    text-align: center;
    color: #9ca3af;
    padding: 2rem;
  }

  /* Loading */
  .table-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
  }

  .table-spinner {
    padding: 1rem 2rem;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* Checkbox */
  input[type='checkbox'] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }

  input[type='checkbox']:indeterminate {
    background-color: #3b82f6;
  }
</style>
