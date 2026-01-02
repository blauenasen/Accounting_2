<!-- src/lib/components/primanota/PrimanotaTableHeader.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { tip } from '$lib/actions/tip';

  export let columns: any[] = [];
  export let sortState: any = { key: '', direction: '' };

  const dispatch = createEventDispatcher();

  function toggleSort(column: any, direction: 'asc' | 'desc') {
    dispatch('sort', {
      key: column.key,
      direction,
      userSelected: true
    });
  }

  function getAriaSort(column: any): 'none' | 'ascending' | 'descending' {
    if (sortState.key !== column.key || !sortState.direction) {
      return 'none';
    }
    return sortState.direction === 'asc' ? 'ascending' : 'descending';
  }
</script>

<tr>
  {#each columns as column}
    <th aria-sort={getAriaSort(column)}>
      <div class="header-inner">
        <button
          type="button"
          class="sort-button sort-button--asc"
          class:active={sortState.key === column.key && sortState.direction === 'asc'}
          on:click={() => toggleSort(column, 'asc')}
          use:tip={'T001'}
        >
          &uarr;
        </button>
        <span class="header-label">{column.label}</span>
        <button
          type="button"
          class="sort-button sort-button--desc"
          class:active={sortState.key === column.key && sortState.direction === 'desc'}
          on:click={() => toggleSort(column, 'desc')}
          use:tip={'T002'}
        >
          &darr;
        </button>
      </div>
    </th>
  {/each}
</tr>

<style>
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
  }

  .header-label {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    white-space: nowrap;
    text-align: center;
  }

  .sort-button {
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 2px;
    font-weight: 400;
  }

  .sort-button.active {
    color: #111827;
    font-weight: 900;
    font-size: 16px;
  }

  .sort-button:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 1px;
  }
</style>
