<!-- KontoansichtTableHeader.svelte -->
<!-- Header row for Kontoansicht table with dynamic columns and sorting -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TableColumn } from '$lib/components/primanota/config/tableColumns';
  import type { PrimanotaSortState } from '$lib/types/ui';

  const dispatch = createEventDispatcher<{
    sort: { key: string; direction: 'asc' | 'desc'; userSelected: boolean };
  }>();

  // Props
  export let columns: TableColumn[] = [];
  export let sortState: PrimanotaSortState;

  function handleSort(key: string): void {
    const direction = sortState.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
    dispatch('sort', { key, direction, userSelected: true });
  }
</script>

<thead>
  <tr class="header-row">
    {#each columns as column}
      <th
        class="header-cell"
        class:sortable={column.sortable}
        class:sorted={sortState.key === column.key}
        on:click={() => column.sortable && handleSort(column.key)}
        style="width: {column.width}px;"
      >
        {column.label}
        {#if sortState.key === column.key}
          <span class="sort-indicator">
            {sortState.direction === 'asc' ? '↑' : '↓'}
          </span>
        {/if}
      </th>
    {/each}
  </tr>
</thead>

<style>
  .header-row {
    height: 22px;
  }

  .header-cell {
    font-size: 13px;
    font-weight: 600;
    color: rgb(34, 34, 34);
    background-color: transparent;
    padding: 1px;
    text-align: center;
    border: 1px solid rgb(221, 221, 221);
    user-select: none;
  }

  .header-cell.sortable {
    cursor: pointer;
  }

  .header-cell.sortable:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .header-cell.sorted {
    background-color: rgba(0, 123, 255, 0.1);
  }

  .header-cell.align-left {
    text-align: left;
  }

  .header-cell.align-right {
    text-align: right;
  }

  .header-cell.align-center {
    text-align: center;
  }

  .sort-indicator {
    margin-left: 4px;
    font-weight: bold;
  }
</style>
