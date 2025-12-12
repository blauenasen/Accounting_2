<!-- src/lib/components/primanota/PrimanotaFilters.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let columns: any[] = [];
  export let filterState: any = {};
  export let valueOptions: any = {};
  export let filterVersion: number = 0;

  const MODE_CONTAINS = 'contains';
  const MODE_PLACEHOLDER = '[A]';
  const VALUE_PLACEHOLDER = '- values-';

  const MODE_OPTIONS: Record<string, string[]> = {
    text: ['', '=', MODE_CONTAINS],
    number: ['', '=', '>', '<'],
    date: ['', '=', '>', '<']
  };

  const dispatch = createEventDispatcher();

  function handleModeChange(column: any, mode: string) {
    dispatch('mode-change', { column, mode });
  }

  function handleValueInput(column: any, value: string) {
    dispatch('value-input', { column, value });
  }

  function shouldDisableValueInput(mode: string): boolean {
    return !mode;
  }

  function getFilterListId(columnKey: string): string {
    return `primanota-filter-${columnKey}`;
  }
</script>

{#key filterVersion}
  <tr class="filter-row">
    {#each columns as column}
      <th>
        <div
          class="filter-controls"
          class:left={column.align === 'left'}
          class:right={column.align === 'right'}
          class:center={column.align === 'center'}
        >
          <select
            class="filter-mode"
            aria-label={`Filter mode ${column.label}`}
            value={filterState[column.key].mode}
            on:change={(event) => handleModeChange(column, event.currentTarget.value)}
          >
            {#each MODE_OPTIONS[column.type] ?? [] as modeValue}
              <option value={modeValue}>{modeValue || MODE_PLACEHOLDER}</option>
            {/each}
          </select>
          <input
            class="filter-input"
            list={getFilterListId(column.key)}
            aria-label={`Filter value ${column.label}`}
            placeholder={VALUE_PLACEHOLDER}
            value={filterState[column.key].inputValue}
            on:input={(event) => handleValueInput(column, event.currentTarget.value)}
            disabled={shouldDisableValueInput(filterState[column.key].mode)}
            style={`width:${column.width}px;`}
          />
          <datalist id={getFilterListId(column.key)}>
            {#each valueOptions[column.key] ?? [] as option}
              <option value={option.label}></option>
            {/each}
          </datalist>
        </div>
      </th>
    {/each}
  </tr>
{/key}

<style>
  .filter-row {
    background-color: white;
  }

  .filter-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
  }

  .filter-mode,
  .filter-input {
    box-sizing: border-box;
    height: 24px;
    border: 1px solid #cbd5f5;
    border-radius: 2px;
    background-color: #e2ecd6;
    color: #1f2937;
    padding: 0 4px;
    font-size: 10px;
  }

  .filter-mode {
    width: 42px;
    min-width: 42px;
  }

  .filter-input {
    width: 100%;
  }

  .filter-mode:disabled,
  .filter-input:disabled {
    background-color: #f5f5f5;
    color: #9ca3af;
  }

  .filter-input:disabled {
    cursor: not-allowed;
  }

  .filter-controls.left {
    align-items: flex-start;
    text-align: left;
  }

  .filter-controls.right {
    align-items: flex-end;
    text-align: right;
  }

  .filter-controls.center {
    align-items: center;
    text-align: center;
  }
</style>
