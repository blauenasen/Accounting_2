<!-- src/lib/components/primanota/PrimanotaContextMenu.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { canDeleteRow, canCancelRow } from '$lib/logic/primanota/validation';

  export let visible: boolean = false;
  export let x: number = 0;
  export let y: number = 0;
  export let row: any = null;
  export let rowIndex: number | null = null;
  export let viewMode: string = 'primanota';

  const dispatch = createEventDispatcher();

  $: canDelete = row ? canDeleteRow(row).canDelete : false;
  $: deleteTitle = row ? (canDelete ? 'Delete booking entry' : canDeleteRow(row).reason) : '';
  $: canCancel = row ? canCancelRow(row).canCancel : false;
  $: cancelTitle = row ? (canCancel ? 'Cancel booking entry' : canCancelRow(row).reason) : '';
  $: canUndoReconcile = viewMode === 'op' && row && row.AusziffNr;
  $: canCopy = row !== null; // Always enabled when row is selected (even for locked entries)
  $: canSplitKreditor = row && row.GegKto && row.GegKto >= 70000 && row.GegKto < 80000 && !row.split_group_id;
  $: canSplitDebitor = row && row.Konto && row.Konto >= 10000 && row.Konto < 20000 && !row.split_group_id;

  function handleDelete() {
    if (canDelete) {
      dispatch('delete', { row, rowIndex });
    }
  }

  function handleCancel() {
    if (canCancel) {
      dispatch('cancel', { row, rowIndex });
    }
  }

  function handleUndoReconciliation() {
    console.log('[PrimanotaContextMenu] handleUndoReconciliation called', {
      canUndoReconcile,
      row,
      AusziffNr: row?.AusziffNr
    });
    if (canUndoReconcile) {
      console.log('[PrimanotaContextMenu] Dispatching undoreconcile event with AusziffNr:', row.AusziffNr);
      dispatch('undoreconcile', { ausziffNr: row.AusziffNr });
    } else {
      console.warn('[PrimanotaContextMenu] Cannot undo reconcile - conditions not met');
    }
  }

  function handleCopyToBooking() {
    if (canCopy) {
      dispatch('copytobooking', { row, rowIndex });
    }
  }

  function handleSplitKreditor() {
    if (canSplitKreditor) {
      dispatch('splitkreditor', { row, rowIndex });
    }
  }

  function handleSplitDebitor() {
    if (canSplitDebitor) {
      dispatch('splitdebitor', { row, rowIndex });
    }
  }
</script>

{#if visible && row}
  <div
    class="context-menu"
    style={`top:${y}px; left:${x}px;`}
    role="menu"
    aria-label="Kontextmenue"
  >
    <button
      type="button"
      class="context-menu-item"
      class:disabled={!canCopy}
      disabled={!canCopy}
      on:click={handleCopyToBooking}
      title="Copy this entry to booking form as template for new entry"
    >
      Copy to booking
    </button>
    <button
      type="button"
      class="context-menu-item"
      class:disabled={!canDelete}
      disabled={!canDelete}
      on:click={handleDelete}
      title={deleteTitle}
    >
      Delete booking entry
    </button>
    <button
      type="button"
      class="context-menu-item"
      class:disabled={!canCancel}
      disabled={!canCancel}
      on:click={handleCancel}
      title={cancelTitle}
    >
      Cancel booking entry
    </button>
    {#if canSplitKreditor}
      <button
        type="button"
        class="context-menu-item"
        on:click={handleSplitKreditor}
        title="Split this kreditor invoice across multiple accounts"
      >
        Split Kreditor Invoice
      </button>
    {/if}
    {#if canSplitDebitor}
      <button
        type="button"
        class="context-menu-item"
        on:click={handleSplitDebitor}
        title="Split this debitor invoice across multiple revenue accounts"
      >
        Split Debitor Invoice
      </button>
    {/if}
    {#if viewMode === 'op' && row.AusziffNr}
      <button
        type="button"
        class="context-menu-item"
        on:click={handleUndoReconciliation}
        title="Remove reconciliation from all entries in this group"
      >
        Undo Reconciliation
      </button>
    {/if}
  </div>
{/if}

<style>
  .context-menu {
    position: fixed;
    background: #fff;
    border: 1px solid #999;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 200px;
  }

  .context-menu-item {
    display: block;
    padding: 6px 12px;
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 12px;
  }

  .context-menu-item:hover:not(:disabled) {
    background: #f0f0f0;
  }

  .context-menu-item:disabled,
  .context-menu-item.disabled {
    color: #999;
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
