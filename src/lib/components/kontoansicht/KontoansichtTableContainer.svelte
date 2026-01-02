<!-- KontoansichtTableContainer.svelte -->
<!-- Kontoansicht table orchestrator component - coordinates all sub-components -->

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import KontoansichtTableHeader from './KontoansichtTableHeader.svelte';
  import KontoansichtTableBody from './KontoansichtTableBody.svelte';
  import { accountColumns } from '$lib/components/primanota/config/tableColumns';
  import type { PrimanotaSortState } from '$lib/types/ui';
  import { viewModeStore } from '$lib/stores/viewModeStore.js';
  import { selectionStore } from '$lib/stores/selectionStore.js';

  // Define entry interface
  interface KontoansichtEntry {
    IdNr?: number;
    id?: number;
    GU?: string;
    gu?: string;
    [key: string]: any;
  }

  const dispatch = createEventDispatcher<{
    rowselect: { entry: KontoansichtEntry };
  }>();

  // Props
  export let entries: KontoansichtEntry[] = [];
  export let hideStornos: boolean = false;
  export let maxHeight: string = '900px';

  // State
  let sortState: PrimanotaSortState = {
    key: 'Datum',
    direction: 'asc',
    userSelected: false
  };

  // Filter entries based on hideStornos flag
  $: filteredEntries = hideStornos
    ? entries.filter(entry => {
        const gu = String(entry?.gu || entry?.GU || '').trim();
        return gu === '';
      })
    : entries;

  // Handle sorting
  function handleSort(event: CustomEvent<{ key: string; direction: 'asc' | 'desc'; userSelected: boolean }>) {
    sortState = {
      key: event.detail.key,
      direction: event.detail.direction,
      userSelected: event.detail.userSelected
    };
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

    // Multi-selection for Kontoansicht
    if ($viewModeStore.mode === 'account') {
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
    if ($viewModeStore.mode === 'account') {
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

<div class="kontoansicht-table-container" style="height: {maxHeight};">
  <table class="kontoansicht-table">
    <KontoansichtTableHeader
      columns={accountColumns}
      {sortState}
      on:sort={handleSort}
    />
    <KontoansichtTableBody
      entries={filteredEntries}
      on:row-dblclick={handleRowDblClick}
      on:row-click={handleRowClick}
      on:row-contextmenu={handleRowContextMenu}
    />
  </table>
</div>

<style>
  .kontoansicht-table-container {
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    top: 20px;  /* negativ = nach oben, positiv = nach unten */
  }

  .kontoansicht-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Helvetica, Arial, sans-serif;
    background-color: rgb(229, 240, 234);
  }
</style>
