<!-- src/lib/components/primanota/PrimanotaTableState.svelte -->
<script lang="ts">
  // Primanota table state management - handles filtering, sorting, transformations
  import type {
    JournalRow,
    PrimanotaFilterState,
    PrimanotaSortState,
    ViewMode
  } from '$lib/types/ui.js';
  import type { TableColumn } from '../config/tableColumns.js';
  import { TABLE_CONSTANTS } from '../config/tableColumns.js';

  // Import logic modules
  import {
    filterRows,
    applyCircleFilter,
    applyCancelledFilter,
    computeComparableFromRaw,
    deriveValueOptions
  } from '$lib/logic/primanota/filtering.js';
  import { sortRows } from '$lib/logic/primanota/sorting.js';
  import { calculateBalanceForRows } from '$lib/logic/primanota/calculations.js';
  import {
    transformRowsForAccountView,
    transformRowsForOpView,
    transformRowsForPrimanotaView
  } from '$lib/logic/primanota/transformations.js';
  import { formatMoney, formatDate, formatColumnValue } from '$lib/logic/primanota/formatting.js';
  import { getComparableValue } from '$lib/logic/primanota/filtering.js';

  // Props
  export let rows: JournalRow[] = [];
  export let viewMode: ViewMode = 'primanota';
  export let selectedAccount: number | null = null;
  export let selectedCircle: number = 0;
  export let hideStornos: boolean = false;
  export let opFilter: 'open' | 'balanced' | 'all' = 'open';
  export let filtersActive: boolean = false;
  export let columns: TableColumn[] = [];

  // State
  export let filterState: Record<string, PrimanotaFilterState> = {};
  export let sortState: PrimanotaSortState = {
    ...TABLE_CONSTANTS.DEFAULT_SORT,
    userSelected: false
  };
  export let filterVersion: number = 0;

  // Derived state (readonly, computed from above)
  let transformedRows: JournalRow[] = [];
  let filteredRows: JournalRow[] = [];
  let displayRows: JournalRow[] = [];
  let valueOptions: Record<string, unknown[]> = {};

  /**
   * Get default comparable value for column type
   */
  function getDefaultComparable(column: TableColumn): string | number | null {
    return column.type === 'text' ? '' : null;
  }

  /**
   * Create initial filter state for columns
   */
  function createInitialFilterState(columnList: TableColumn[]): Record<string, PrimanotaFilterState> {
    const initial: Record<string, PrimanotaFilterState> = {};
    for (const column of columnList) {
      initial[column.key] = {
        mode: '',
        valueKey: '',
        inputValue: '',
        comparableValue: getDefaultComparable(column)
      };
    }
    return initial;
  }

  /**
   * Wrapper for computeComparableFromRaw with default handling
   */
  function computeComparableLocal(column: TableColumn, rawValue: string): string | number | null {
    if (!rawValue && rawValue !== 0) {
      return getDefaultComparable(column);
    }
    return computeComparableFromRaw(column, rawValue);
  }

  /**
   * Wrapper for filterRows with format functions
   */
  function filterRowsLocal(
    sourceRows: JournalRow[],
    state: Record<string, PrimanotaFilterState>,
    active: boolean,
    skipColumnKey: string | null = null
  ): JournalRow[] {
    return filterRows(sourceRows, state, active, columns, skipColumnKey, formatDate, formatMoney);
  }

  /**
   * Wrapper for deriveValueOptions
   */
  function deriveValueOptionsLocal(
    sourceRows: JournalRow[],
    state: Record<string, PrimanotaFilterState>,
    active: boolean
  ): Record<string, unknown[]> {
    return deriveValueOptions(sourceRows, state, active, columns, formatColumnValue, filterRowsLocal);
  }

  /**
   * Sort and calculate rows
   */
  function sortAndCalculateRows(
    rowsToSort: JournalRow[],
    _sortState: PrimanotaSortState
  ): JournalRow[] {
    const sorted = sortRows(rowsToSort, sortState, columns, getComparableValue);
    return calculateBalanceForRows(sorted, viewMode);
  }

  /**
   * Ensure filter selections are valid against current value options
   */
  function ensureFilterSelectionsValid(optionsMap: Record<string, unknown[]>): void {
    for (const column of columns) {
      const filter = filterState[column.key];
      if (!filter || !filter.valueKey) {
        continue;
      }
      const options = (optionsMap[column.key] ?? []) as Array<{
        key: string;
        label: string;
        comparable: unknown;
      }>;
      const match = options.find((option) => option.key === filter.valueKey);
      if (!match) {
        updateFilterState(column.key, (current) => ({
          ...current,
          valueKey: '',
          inputValue: '',
          comparableValue: getDefaultComparable(column)
        }));
        continue;
      }
      if (filter.inputValue !== match.label || filter.comparableValue !== match.comparable) {
        updateFilterState(column.key, (current) => ({
          ...current,
          inputValue: match.label,
          comparableValue: match.comparable
        }));
      }
    }
  }

  /**
   * Update filter state for a specific column
   */
  function updateFilterState(
    columnKey: string,
    updater: (current: PrimanotaFilterState) => PrimanotaFilterState
  ): void {
    filterState = {
      ...filterState,
      [columnKey]: updater(filterState[columnKey])
    };
  }

  /**
   * Public API: Reset filters
   */
  export function resetFilters(options: { resetSort?: boolean; resetDisplay?: boolean } = {}): void {
    const { resetSort = false, resetDisplay = false } = options;

    filterState = createInitialFilterState(columns);
    filterVersion += 1;

    if (resetSort) {
      sortState = { ...TABLE_CONSTANTS.DEFAULT_SORT, userSelected: false };
    }

    if (resetDisplay) {
      const baseRows = Array.isArray(rows) ? [...rows] : [];
      filteredRows = baseRows;
      displayRows = sortAndCalculateRows(baseRows, sortState);
    }

    valueOptions = deriveValueOptionsLocal(
      Array.isArray(rows) ? rows : [],
      filterState,
      filtersActive
    );
  }

  /**
   * Public API: Handle mode change
   */
  export function handleModeChange(column: TableColumn, mode: string): void {
    updateFilterState(column.key, (current) => {
      const next = {
        ...current,
        mode
      };

      if (!mode) {
        next.valueKey = '';
        next.inputValue = '';
        next.comparableValue = getDefaultComparable(column);
        return next;
      }

      if (next.valueKey) {
        const options = (valueOptions[column.key] ?? []) as Array<{
          key: string;
          label: string;
          comparable: unknown;
        }>;
        const match = options.find((option) => option.key === next.valueKey);
        if (match) {
          next.inputValue = match.label;
          next.comparableValue = match.comparable;
          return next;
        }
      }

      next.comparableValue = computeComparableLocal(column, next.inputValue);
      return next;
    });
  }

  /**
   * Public API: Handle value input
   */
  export function handleValueInput(column: TableColumn, rawInput: string | unknown): void {
    const value = rawInput ?? '';
    const textValue = typeof value === 'string' ? value : String(value);
    const trimmed = textValue.trim();

    updateFilterState(column.key, (current) => {
      const options = (valueOptions[column.key] ?? []) as Array<{
        key: string;
        label: string;
        comparable: unknown;
      }>;
      const match = options.find((option) => option.label === trimmed);
      if (match) {
        return {
          ...current,
          valueKey: match.key,
          inputValue: match.label,
          comparableValue: match.comparable
        };
      }

      return {
        ...current,
        valueKey: '',
        inputValue: textValue,
        comparableValue: computeComparableLocal(column, textValue)
      };
    });
  }

  /**
   * Public API: Update sort state
   */
  export function updateSort(key: string, direction: 'asc' | 'desc', userSelected: boolean = true): void {
    sortState = { key, direction, userSelected };
  }

  /**
   * Public API: Get current display rows
   */
  export function getDisplayRows(): JournalRow[] {
    return displayRows;
  }

  /**
   * Public API: Get current filtered rows
   */
  export function getFilteredRows(): JournalRow[] {
    return filteredRows;
  }

  /**
   * Public API: Get value options for column
   */
  export function getValueOptions(columnKey: string): unknown[] {
    return valueOptions[columnKey] ?? [];
  }

  // Reactive computations
  $: normalizedRows = Array.isArray(rows) ? rows : [];

  $: transformedRows =
    viewMode === 'account'
      ? transformRowsForAccountView(normalizedRows, selectedAccount)
      : viewMode === 'op'
        ? transformRowsForOpView(normalizedRows, selectedAccount, opFilter)
        : transformRowsForPrimanotaView(normalizedRows);

  $: {
    // Auto-sort by Date when entering account view or OP view
    if ((viewMode === 'account' || viewMode === 'op') && selectedAccount && !sortState.userSelected) {
      sortState = { key: 'Datum', direction: 'asc', userSelected: false };
    } else if (viewMode === 'primanota' && !sortState.userSelected) {
      sortState = { key: 'Datum', direction: 'asc', userSelected: false };
    }
  }

  $: baseFilteredRows = filterRowsLocal(transformedRows, filterState, filtersActive);
  $: circleFilteredRows =
    viewMode === 'primanota'
      ? applyCircleFilter(baseFilteredRows, selectedCircle)
      : baseFilteredRows;
  $: stornoFilteredRows = applyCancelledFilter(circleFilteredRows, hideStornos);
  $: filteredRows = stornoFilteredRows;
  $: valueOptions = deriveValueOptionsLocal(filteredRows, filterState, filtersActive);
  $: ensureFilterSelectionsValid(valueOptions);
  $: displayRows = sortAndCalculateRows(filteredRows, sortState);

  // Initialize filter state when columns change
  $: if (columns.length > 0 && Object.keys(filterState).length === 0) {
    filterState = createInitialFilterState(columns);
  }
</script>

<!-- This component has no visual output - it's pure logic -->
