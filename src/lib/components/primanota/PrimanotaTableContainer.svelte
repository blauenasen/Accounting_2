<!-- src/lib/components/primanota/PrimanotaTableContainer.svelte -->
<script lang="ts">
  // Primanota table orchestrator component - coordinates all sub-components
  import { createEventDispatcher, onMount, onDestroy, afterUpdate, tick } from 'svelte';
  import type {
    JournalRow,
    PrimanotaDialogState,
    PrimanotaSortState,
    PrimanotaFilterState,
    ContextMenuState,
    ViewMode
  } from '$lib/types/ui.js';

  // Sub-components
  import PrimanotaTableHeader from './PrimanotaTableHeader.svelte';
  import PrimanotaFilters from './PrimanotaFilters.svelte';
  import PrimanotaTableBody from './PrimanotaTableBody.svelte';
  import PrimanotaContextMenu from './PrimanotaContextMenu.svelte';
  import PrimanotaTableDialogs from './PrimanotaTableDialogs.svelte';
  import PrimanotaTableState from './PrimanotaTableState.svelte';

  // Import stores
  import { viewModeStore } from '$lib/stores/viewModeStore.js';
  import { selectionStore } from '$lib/stores/selectionStore.js';
  import { toastStore } from '$lib/utils/toast.js';

  // Import configuration
  import { getColumnsForView, TABLE_CONSTANTS, TABLE_EVENTS } from './config/tableColumns.js';
  import type { TableColumn } from './config/tableColumns.js';

  // Props
  export let rows: JournalRow[] = [];
  export let maxHeight: string = '480px';
  export let filtersActive: boolean = false;
  export let selectedAccount: number | null = null;

  const dispatch = createEventDispatcher<{
    rowselect: { rowIndex: number; row: JournalRow };
    fillform: { formData: Record<string, unknown>; originalRow: JournalRow };
    deleteentry: { bookingData: JournalRow };
    message: { text: string; rowIndex?: number | null };
    reload: void;
    'account-selected': { field: string; accountNumber: number; designation: string };
  }>();

  // Component refs
  let wrapper: HTMLElement;
  let stateRef: PrimanotaTableState;

  // State
  let viewMode: ViewMode = 'primanota';
  let selectedCircle: number = 0;
  let hideStornos: boolean = false;
  let opFilter: 'open' | 'balanced' | 'all' = 'open';
  let columns: TableColumn[] = [];
  let filterState: Record<string, PrimanotaFilterState> = {};
  let sortState: PrimanotaSortState = {
    ...TABLE_CONSTANTS.DEFAULT_SORT,
    userSelected: false
  };
  let filterVersion: number = 0;

  // Context menu state
  let contextMenu: ContextMenuState = {
    visible: false,
    x: 0,
    y: 0,
    rowIndex: null
  };

  // Dialog states
  let dialogState: PrimanotaDialogState = {
    cancelBooking: {
      visible: false,
      bookingData: null
    },
    splitKreditor: {
      visible: false,
      invoiceData: null
    },
    splitDebitor: {
      visible: false,
      invoiceData: null
    },
    reconcile: {
      visible: false,
      selectedEntries: []
    },
    accountSelection: {
      visible: false,
      field: '',
      bookCircle: null,
      accounts: []
    }
  };

  // UI state
  let highlightedRow: { idNr: number | null } | null = null;
  let highlightedRowIndex: number = -1;
  let clickTimer: ReturnType<typeof setTimeout> | null = null;
  const clickDelay: number = 250;

  // Lifecycle management
  let previousFiltersActive: boolean = filtersActive;
  let suppressFilterBroadcast: boolean = false;
  let skipNextDeactivateLog: boolean = false;
  let pendingControllerReset: {
    resetSort?: boolean;
    resetDisplay?: boolean;
    source?: string;
  } | null = null;
  let cleanup: () => void = () => {};

  // Derived state
  let displayRows: JournalRow[] = [];

  // Calculate body max-height
  $: bodyMaxHeight = filtersActive
    ? `calc(${maxHeight} - ${TABLE_CONSTANTS.HEADER_ROW_HEIGHT + TABLE_CONSTANTS.FILTER_ROW_HEIGHT}px)`
    : `calc(${maxHeight} - ${TABLE_CONSTANTS.HEADER_ROW_HEIGHT}px)`;

  // Update columns when view mode changes
  $: columns = getColumnsForView(viewMode);

  // Get display rows from state component
  $: if (stateRef) {
    displayRows = stateRef.getDisplayRows();
  }

  // Selected entries for reconcile dialog
  $: selectedEntries = displayRows.filter(
    (row) => row && row.IdNr && $selectionStore.selectedIds.has(row.IdNr)
  );

  // Update reconcile dialog selected entries
  $: {
    dialogState.reconcile.selectedEntries = selectedEntries;
  }

  // Dispatch displayRows changes for BookingButtons sum calculation
  $: if (typeof window !== 'undefined' && displayRows) {
    window.dispatchEvent(
      new CustomEvent(TABLE_EVENTS.DISPLAY_ROWS_CHANGE, {
        detail: { displayRows, viewMode }
      })
    );
  }

  /**
   * Lifecycle: Handle filter activation/deactivation
   */
  afterUpdate(async () => {
    if (filtersActive === previousFiltersActive) {
      return;
    }

    const deactivating = !filtersActive;
    if (deactivating) {
      await tick();
      if (pendingControllerReset) {
        const { resetSort, resetDisplay, source } = pendingControllerReset;
        performReset({ resetSort, resetDisplay, source });
        pendingControllerReset = null;
      } else {
        performReset({ source: skipNextDeactivateLog ? undefined : 'Filter deactivated' });
      }
      skipNextDeactivateLog = false;
      selectedCircle = 0;
    } else {
      if (pendingControllerReset) {
        const { resetSort, resetDisplay, source } = pendingControllerReset;
        performReset({ resetSort, resetDisplay, source });
        pendingControllerReset = null;
      } else {
        if (stateRef) {
          stateRef.resetFilters({ resetSort: false, resetDisplay: true });
        }
      }
      skipNextDeactivateLog = false;
    }

    if (suppressFilterBroadcast) {
      suppressFilterBroadcast = false;
    } else {
      broadcastFilterToggle(filtersActive);
    }

    previousFiltersActive = filtersActive;
  });

  /**
   * Lifecycle: Setup event listeners
   */
  onMount(() => {
    const clickHandler = (event: MouseEvent) => handleGlobalClick(event);
    const keyHandler = (event: KeyboardEvent) => handleKeydown(event);

    const filterToggleHandler = (event: CustomEvent) => {
      if (!event?.detail || typeof event.detail.active !== 'boolean') return;
      const nextActive = Boolean(event.detail.active);
      if (filtersActive === nextActive) return;
      suppressFilterBroadcast = true;
      filtersActive = nextActive;
    };

    const circleHandler = (event: CustomEvent) => {
      const detail = event?.detail;
      const circleValue = Number.parseInt(detail?.no, 10);
      selectedCircle = Number.isFinite(circleValue) && circleValue > 0 ? circleValue : 0;
    };

    const viewModeHandler = (event: CustomEvent) => {
      const detail = event?.detail;
      const mode = detail?.mode;
      if (mode === 'primanota' || mode === 'account' || mode === 'op') {
        const previousMode = viewMode;
        viewMode = mode;

        // Update store for child components
        viewModeStore.setMode(mode);

        // Reset filters when changing view mode
        if (previousMode !== mode && stateRef) {
          const columnsForMode = getColumnsForView(mode);
          filterState = {};
          stateRef.resetFilters({ resetSort: true, resetDisplay: true });
          filterVersion += 1;
        }

        // Always sort by Datum ascending when switching view mode
        sortState = { key: 'Datum', direction: 'asc', userSelected: false };
      }
    };

    let lastProcessedAccountChange = '';
    let lastProcessedAccountTime = 0;

    const accountChangeHandler = (event: CustomEvent) => {
      const detail = event?.detail;
      const account = detail?.account;
      const now = Date.now();

      // Prevent duplicate processing within 100ms
      if (account === lastProcessedAccountChange && now - lastProcessedAccountTime < 100) {
        return;
      }

      lastProcessedAccountChange = account;
      lastProcessedAccountTime = now;

      const numeric = Number.parseInt(account, 10);
      selectedAccount = Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    };

    const hideStornosHandler = (event: CustomEvent) => {
      const detail = event?.detail;
      hideStornos = Boolean(detail?.hide);
    };

    const opFilterHandler = (event: CustomEvent) => {
      const detail = event?.detail;
      opFilter = detail?.filter || 'all';
    };

    window.addEventListener('click', clickHandler, { capture: true });
    window.addEventListener('keydown', keyHandler);
    window.addEventListener(TABLE_EVENTS.FILTER_TOGGLE, filterToggleHandler);
    window.addEventListener(TABLE_EVENTS.CIRCLE_CHANGE, circleHandler);
    window.addEventListener(TABLE_EVENTS.VIEW_MODE_CHANGE, viewModeHandler);
    window.addEventListener(TABLE_EVENTS.ACCOUNT_CHANGE, accountChangeHandler);
    window.addEventListener(TABLE_EVENTS.HIDE_STORNOS_CHANGE, hideStornosHandler);
    window.addEventListener(TABLE_EVENTS.OP_FILTER_CHANGE, opFilterHandler);
    broadcastFilterToggle(filtersActive);

    cleanup = () => {
      window.removeEventListener('click', clickHandler, { capture: true });
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener(TABLE_EVENTS.FILTER_TOGGLE, filterToggleHandler);
      window.removeEventListener(TABLE_EVENTS.CIRCLE_CHANGE, circleHandler);
      window.removeEventListener(TABLE_EVENTS.VIEW_MODE_CHANGE, viewModeHandler);
      window.removeEventListener(TABLE_EVENTS.ACCOUNT_CHANGE, accountChangeHandler);
      window.removeEventListener(TABLE_EVENTS.HIDE_STORNOS_CHANGE, hideStornosHandler);
      window.removeEventListener(TABLE_EVENTS.OP_FILTER_CHANGE, opFilterHandler);
    };
  });

  onDestroy(() => {
    cleanup();
  });

  /**
   * Broadcast filter toggle event
   */
  function broadcastFilterToggle(active: boolean): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent(TABLE_EVENTS.FILTER_TOGGLE, { detail: { active } })
    );
  }

  /**
   * Reset filters
   */
  function performReset(options: {
    resetSort?: boolean;
    resetDisplay?: boolean;
    source?: string;
  } = {}): void {
    if (stateRef) {
      stateRef.resetFilters(options);
    }
  }

  /**
   * Public API: Reset filters from controller
   */
  export function resetFiltersFromController(
    reason: string = 'Controller',
    options: { resetSort?: boolean; resetDisplay?: boolean; deactivate?: boolean } = {}
  ): void {
    const { resetSort = true, resetDisplay = true, deactivate = false } = options;
    pendingControllerReset = null;
    if (deactivate) {
      if (filtersActive) {
        skipNextDeactivateLog = reason !== 'Filter deactivated';
        suppressFilterBroadcast = true;
        filtersActive = false;
        pendingControllerReset = { resetSort, resetDisplay, source: reason };
      } else {
        performReset({ resetSort, resetDisplay, source: reason });
      }
      return;
    }

    performReset({ resetSort, resetDisplay, source: reason });
  }

  /**
   * Reset context menu
   */
  function resetContextMenu(): void {
    contextMenu = { visible: false, x: 0, y: 0, rowIndex: null };
  }

  /**
   * Handle global click (close context menu)
   */
  function handleGlobalClick(event: MouseEvent): void {
    if (!contextMenu.visible) return;
    if (wrapper && wrapper.contains(event.target as Node)) return;
    const target = event.target as HTMLElement;
    if (target.closest('.context-menu')) return;
    resetContextMenu();
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event: KeyboardEvent): void {
    if ($viewModeStore.mode === 'account') {
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        selectionStore.selectAll(displayRows);
        return;
      }
      if (event.key === 'Escape') {
        selectionStore.keepLastSelected(displayRows);
        if (contextMenu.visible) resetContextMenu();
        highlightedRow = null;
        return;
      }
    }
    if (event.key === 'Escape') {
      if (contextMenu.visible) resetContextMenu();
      highlightedRow = null;
    }
  }

  /**
   * Handle row click
   */
  function handleRowClick(rowIndex: number, event: MouseEvent): void {
    if (!event || event.button !== 2) {
      resetContextMenu();
    }

    const row = displayRows[rowIndex];
    if (!row) return;

    // Multi-selection for Account View and OP View
    if ((viewMode === 'account' || viewMode === 'op') && event) {
      const rowId = row?.IdNr || null;
      if (rowId) {
        if (event.ctrlKey) {
          selectionStore.toggle(rowIndex, rowId);
          return;
        }
        if (event.shiftKey && $selectionStore.lastSelectedIndex >= 0) {
          selectionStore.selectRange($selectionStore.lastSelectedIndex, rowIndex, displayRows);
          return;
        }
        selectionStore.selectSingle(rowIndex, rowId);
        return;
      }
    }

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }

    clickTimer = setTimeout(() => {
      const row = displayRows?.[rowIndex] ?? null;
      if (!row) return;
      dispatch('rowselect', { rowIndex, row });
      dispatch('message', { text: 'Row selected', rowIndex });
      clickTimer = null;
    }, clickDelay);
  }

  /**
   * Handle row double-click (edit row)
   */
  function handleRowDblClick(rowIndex: number): void {
    resetContextMenu();

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }

    const row = displayRows?.[rowIndex] ?? null;
    if (!row) return;

    // Check if row is storno or locked
    const isStorno = Boolean(row?.GU && row.GU.trim() !== '');
    const isLocked = Boolean(row?.Gesperrt ?? false);

    if (isStorno) {
      dispatch('message', { text: 'Cancelled booking cannot be edited', rowIndex });
      return;
    }

    if (isLocked) {
      dispatch('message', { text: 'Record is locked and cannot be edited', rowIndex });
      return;
    }

    highlightedRow = { idNr: row.IdNr ?? null };
    highlightedRowIndex = rowIndex;

    // Build form data from row (simplified)
    const formData: Record<string, unknown> = {
      idNr: row.IdNr,
      gu: row.GU || '',
      turnover: row.UE || '0.00',
      sh: row.SH || '',
      contra: row.GegKto || '',
      reference: row.BelNr || '',
      date: row.Datum || '',
      account: row.Kto || '',
      tax: row.BU !== null ? String(row.BU) : '',
      desc: row.Buchungstext || '',
      bookCircle: row.BookCircle || null
    };

    dispatch('fillform', { formData, originalRow: row });
  }

  /**
   * Handle context menu (right-click)
   */
  function showContextMenu(event: MouseEvent, rowIndex: number): void {
    event.preventDefault();
    if (!wrapper) return;

    const row = displayRows?.[rowIndex] ?? null;
    if (!row) return;

    const isStorno = Boolean(row?.GU && row.GU.trim() !== '');
    if (isStorno) return;

    const SAFETY_MARGIN = 10;
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 80;

    let x = event.clientX;
    let y = event.clientY;

    if (y + MENU_HEIGHT + SAFETY_MARGIN > window.innerHeight) {
      y = event.clientY - MENU_HEIGHT;
    }
    if (x + MENU_WIDTH + SAFETY_MARGIN > window.innerWidth) {
      x = event.clientX - MENU_WIDTH;
    }

    x = Math.max(SAFETY_MARGIN, Math.min(x, window.innerWidth - MENU_WIDTH - SAFETY_MARGIN));
    y = Math.max(SAFETY_MARGIN, Math.min(y, window.innerHeight - MENU_HEIGHT - SAFETY_MARGIN));

    contextMenu = { visible: true, x, y, rowIndex };
  }

  /**
   * Handle context menu actions
   */
  function handleCopyToBooking(): void {
    const rowIndex = contextMenu.rowIndex;
    if (rowIndex === null) return;
    const row = displayRows?.[rowIndex] ?? null;
    if (!row) return;

    resetContextMenu();

    const formData: Record<string, unknown> = {
      idNr: null,
      gu: '',
      turnover: row.UE || '0.00',
      sh: row.SH || '',
      contra: row.GegKto || '',
      reference: row.BelNr || '',
      date: row.Datum || '',
      account: row.Kto || '',
      tax: row.BU !== null ? String(row.BU) : '',
      desc: row.Buchungstext || '',
      bookCircle: row.BookCircle || null
    };

    dispatch('fillform', { formData, originalRow: row });
    dispatch('message', { text: 'Entry copied to booking form', rowIndex });
  }

  function handleDelete(): void {
    const rowIndex = contextMenu.rowIndex;
    if (rowIndex === null) return;
    const row = displayRows?.[rowIndex] ?? null;
    if (!row) {
      toastStore.error('No booking selected');
      resetContextMenu();
      return;
    }

    const isLocked = Boolean(row?.Gesperrt ?? false);
    const hasGU = Boolean(row?.GU && row.GU.trim() !== '');
    const hasPDF = Boolean(row?.pdf_blob);
    const hasInvoice = Boolean(row?.id_invoice);

    if (isLocked || hasGU || hasPDF || hasInvoice) {
      toastStore.error('Entry cannot be deleted');
      resetContextMenu();
      return;
    }

    dispatch('deleteentry', { bookingData: row });
    resetContextMenu();
  }

  function handleCancel(): void {
    const rowIndex = contextMenu.rowIndex;
    if (rowIndex === null) return;
    const row = displayRows?.[rowIndex] ?? null;
    if (!row) {
      toastStore.error('No booking selected');
      resetContextMenu();
      return;
    }

    const isLocked = Boolean(row?.Gesperrt ?? false);
    if (isLocked) {
      toastStore.error('Booking is locked and cannot be cancelled');
      resetContextMenu();
      return;
    }

    dialogState.cancelBooking = { visible: true, bookingData: row };
    resetContextMenu();
  }

  /**
   * Handle dialog events
   */
  async function handleCancelDialogConfirm(event: CustomEvent): Promise<void> {
    const originalBooking = event?.detail?.bookingData;
    if (!originalBooking) return;

    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalBooking })
      });

      const result = await response.json();

      if (result.ok) {
        selectionStore.clear();
        toastStore.success(`Booking cancelled. GU number: ${result.guNumber}`);
        dispatch('reload');
      } else {
        toastStore.error(result.error || 'Cancellation failed');
      }
    } catch (error) {
      toastStore.error(error instanceof Error ? error.message : 'Cancellation failed');
    } finally {
      dialogState.cancelBooking = { visible: false, bookingData: null };
      highlightedRow = null;
      highlightedRowIndex = -1;
    }
  }

  function handleReconcileClick(): void {
    if ($selectionStore.selectedIds.size < 2) {
      toastStore.info('Select at least 2 entries for reconciliation');
      return;
    }
    dialogState.reconcile = { visible: true, selectedEntries };
  }

  async function handleReconcileConfirm(event: CustomEvent): Promise<void> {
    const { idNrs } = event?.detail || {};
    if (!idNrs || idNrs.length < 2) return;

    try {
      const response = await fetch('/api/booking/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idNrs, type: 'manual' })
      });

      const result = await response.json();

      if (result.ok) {
        toastStore.success(`Reconciled ${idNrs.length} entries`);
        selectionStore.clear();
        dialogState.reconcile = { visible: false, selectedEntries: [] };
        dispatch('reload');
      } else {
        toastStore.error(result.error || 'Reconciliation failed');
      }
    } catch (err) {
      toastStore.error('Reconciliation request failed');
    }
  }

  /**
   * Handle event forwards from sub-components
   */
  function handleSortEvent(event: CustomEvent): void {
    if (stateRef) {
      stateRef.updateSort(event.detail.key, event.detail.direction, event.detail.userSelected);
    }
  }

  function handleModeChangeEvent(event: CustomEvent): void {
    if (stateRef) {
      stateRef.handleModeChange(event.detail.column, event.detail.mode);
    }
  }

  function handleValueInputEvent(event: CustomEvent): void {
    if (stateRef) {
      stateRef.handleValueInput(event.detail.column, event.detail.value);
    }
  }

  function handleRowClickEvent(event: CustomEvent): void {
    handleRowClick(event.detail.index, event.detail.originalEvent);
  }

  function handleRowDblClickEvent(event: CustomEvent): void {
    handleRowDblClick(event.detail.index);
  }

  function handleRowContextMenuEvent(event: CustomEvent): void {
    showContextMenu(event.detail.event, event.detail.index);
  }
</script>

<div class="primanota-wrapper" bind:this={wrapper}>
  <!-- OP View Toolbar -->
  {#if viewMode === 'op'}
    <div class="op-toolbar">
      <button
        type="button"
        class="btn-reconcile"
        disabled={$selectionStore.selectedIds.size < 2}
        on:click={handleReconcileClick}
        title={$selectionStore.selectedIds.size < 2
          ? 'Select at least 2 entries'
          : 'Reconcile selected entries'}
      >
        Reconcile ({$selectionStore.selectedIds.size})
      </button>
    </div>
  {/if}

  <!-- State Management Component (no visual output) -->
  <PrimanotaTableState
    bind:this={stateRef}
    bind:filterState
    bind:sortState
    bind:filterVersion
    {rows}
    {viewMode}
    {selectedAccount}
    {selectedCircle}
    {hideStornos}
    {opFilter}
    {filtersActive}
    {columns}
  />

  <!-- Fixed Header Table -->
  <div class="table-header-fixed">
    <table class="primanota-table">
      <colgroup>
        {#each columns as column}
          <col
            style={`width:${column.width}px; min-width:${column.width}px; max-width:${column.width}px;`}
          />
        {/each}
      </colgroup>
      <thead>
        <PrimanotaTableHeader {columns} {sortState} on:sort={handleSortEvent} />
        {#if filtersActive}
          <PrimanotaFilters
            {columns}
            {filterState}
            valueOptions={stateRef ? Object.fromEntries(columns.map(c => [c.key, stateRef.getValueOptions(c.key)])) : {}}
            {filterVersion}
            on:mode-change={handleModeChangeEvent}
            on:value-input={handleValueInputEvent}
          />
        {/if}
      </thead>
    </table>
  </div>

  <!-- Scrollable Body Table -->
  <div class="table-scroll" style={`max-height:${bodyMaxHeight};`}>
    <table class="primanota-table">
      <colgroup>
        {#each columns as column}
          <col
            style={`width:${column.width}px; min-width:${column.width}px; max-width:${column.width}px;`}
          />
        {/each}
      </colgroup>
      <PrimanotaTableBody
        {displayRows}
        {columns}
        {selectedCircle}
        {highlightedRow}
        on:row-click={handleRowClickEvent}
        on:row-dblclick={handleRowDblClickEvent}
        on:row-contextmenu={handleRowContextMenuEvent}
        on:open-pdf
      />
    </table>
  </div>
</div>

<!-- Context Menu -->
<PrimanotaContextMenu
  visible={contextMenu.visible}
  x={contextMenu.x}
  y={contextMenu.y}
  row={contextMenu.rowIndex !== null ? displayRows?.[contextMenu.rowIndex] : null}
  rowIndex={contextMenu.rowIndex}
  {viewMode}
  on:copytobooking={handleCopyToBooking}
  on:delete={handleDelete}
  on:cancel={handleCancel}
  on:undoreconcile
  on:splitkreditor
  on:splitdebitor
/>

<!-- Dialogs -->
<PrimanotaTableDialogs
  bind:dialogState
  {viewMode}
  on:confirm={handleCancelDialogConfirm}
  on:confirm={handleReconcileConfirm}
/>

<style>
  .primanota-wrapper {
    display: block;
    width: auto;
    isolation: isolate;
  }

  .table-header-fixed {
    background: #fff;
    border: 1px solid #ccc;
    border-bottom: none;
    overflow: hidden;
  }

  .table-scroll {
    overflow-y: auto;
    overflow-x: auto;
    background: #fff;
    border: 1px solid #ccc;
    border-top: none;
    height: 100%;
  }

  .primanota-table {
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 13px;
    background: #e5f0ea;
    color: #222;
    width: 1580px;
  }

  .op-toolbar {
    padding: 12px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .btn-reconcile {
    padding: 8px 16px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-reconcile:hover:not(:disabled) {
    background: #1976d2;
  }

  .btn-reconcile:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
