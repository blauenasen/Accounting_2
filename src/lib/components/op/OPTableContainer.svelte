<!-- OPTableContainer.svelte -->
<!-- OP table orchestrator component - coordinates all sub-components -->

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import OPTableHeader from './OPTableHeader.svelte';
  import OPTableBody from './OPTableBody.svelte';
  import { viewModeStore } from '$lib/stores/viewModeStore.js';
  import { selectionStore } from '$lib/stores/selectionStore.js';

  // Define entry interface
  interface OPEntry {
    IdNr?: number;
    id?: number;
    GU?: string;
    gu?: string;
    [key: string]: any;
  }

  const dispatch = createEventDispatcher<{
    rowselect: { entry: OPEntry };
  }>();

  // Props
  export let entries: OPEntry[] = [];
  export let hideStornos: boolean = false;
  export let maxHeight: string = '900px';

  // State
  let sortColumn: string = '';
  let sortDirection: 'asc' | 'desc' = 'asc';

  // Filter entries based on hideStornos flag
  $: filteredEntries = hideStornos
    ? entries.filter(entry => {
        const gu = String(entry?.gu || entry?.GU || '').trim();
        return gu === '';
      })
    : entries;

  // Handle sorting
  function handleSort(event: CustomEvent<{ column: string }>) {
    const column = event.detail.column;
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
    // TODO: Implement actual sorting logic
  }

  // Handle row double-click
  function handleRowDblClick(event: CustomEvent) {
    const { entry } = event.detail;
    if (!entry || !entry.IdNr) return;

    // Dispatch rowselect event to parent
    dispatch('rowselect', { entry });
  }

  // Handle row click with multi-selection support
  function handleRowClick(event: CustomEvent) {
    const { entry, index } = event.detail;
    const mouseEvent = event.detail.event || event.detail.originalEvent;

    if (!entry || !mouseEvent) return;

    // Multi-selection for OP View
    if ($viewModeStore.mode === 'op') {
      const rowId = entry?.IdNr || null;
      if (rowId) {
        if (mouseEvent.ctrlKey) {
          selectionStore.toggle(index, rowId);
          return;
        }
        if (mouseEvent.shiftKey && $selectionStore.lastSelectedIndex >= 0) {
          selectionStore.selectRange($selectionStore.lastSelectedIndex, index, filteredEntries);
          return;
        }
        selectionStore.selectSingle(index, rowId);
        return;
      }
    }
  }

  // Handle row context menu
  function handleRowContextMenu(event: CustomEvent) {
    // Optional: Handle right-click if needed
  }

  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent): void {
    if ($viewModeStore.mode === 'op') {
      if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        selectionStore.selectAll(filteredEntries);
        return;
      }
      if (event.key === 'Escape') {
        selectionStore.keepLastSelected(filteredEntries);
        return;
      }
    }
  }

  // Register keyboard event listener
  onMount(() => {
    const keyHandler = (event: KeyboardEvent) => handleKeydown(event);
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  });
</script>

<div class="op-table-container" style="height: {maxHeight};">
  <table class="op-table">
    <OPTableHeader
      {sortColumn}
      {sortDirection}
      on:sort={handleSort}
    />
    <OPTableBody
      entries={filteredEntries}
      on:row-dblclick={handleRowDblClick}
      on:row-click={handleRowClick}
      on:row-contextmenu={handleRowContextMenu}
    />
  </table>
</div>

<style>
  .op-table-container {
    overflow-y: auto;
    overflow-x: hidden;
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(204, 204, 204);
  }

  .op-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(229, 240, 234);
  }
</style>
