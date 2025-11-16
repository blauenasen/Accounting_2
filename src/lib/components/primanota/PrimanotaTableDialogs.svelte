<!-- src/lib/components/primanota/PrimanotaTableDialogs.svelte -->
<script lang="ts">
  // Primanota table dialogs orchestrator - manages all dialog states
  import type { PrimanotaDialogState, JournalRow } from '$lib/types/ui.js';
  import type { Account } from '$lib/types/database.js';

  // Props
  export let dialogState: PrimanotaDialogState;
  export let viewMode: 'primanota' | 'account' | 'op' = 'primanota';

  // Dialog components (these already exist in the old project, will be migrated to TypeScript later)
  import CancelBookingDialog from '$lib/components/booking/dialogs/CancelBookingDialog.svelte';
  import SplitKreditorDialog from '$lib/components/booking/dialogs/SplitKreditorDialog.svelte';
  import SplitDebitorDialog from '$lib/components/booking/dialogs/SplitDebitorDialog.svelte';
  import ReconcileDialog from '$lib/components/booking/dialogs/ReconcileDialog.svelte';
  import AccountSelectionDialog from '$lib/components/booking/dialogs/AccountSelectionDialog.svelte';

  /**
   * Handle dialog close events
   */
  function handleCancelDialogClose(): void {
    dialogState.cancelBooking.visible = false;
    dialogState.cancelBooking.bookingData = null;
  }

  function handleSplitKreditorClose(): void {
    dialogState.splitKreditor.visible = false;
    dialogState.splitKreditor.invoiceData = null;
  }

  function handleSplitDebitorClose(): void {
    dialogState.splitDebitor.visible = false;
    dialogState.splitDebitor.invoiceData = null;
  }

  function handleReconcileClose(): void {
    dialogState.reconcile.visible = false;
  }

  function handleAccountSelectionClose(): void {
    dialogState.accountSelection.visible = false;
    dialogState.accountSelection.field = '';
    dialogState.accountSelection.bookCircle = null;
    dialogState.accountSelection.accounts = [];
  }
</script>

<!-- Cancel Booking Dialog -->
{#if dialogState.cancelBooking.visible}
  <CancelBookingDialog
    visible={dialogState.cancelBooking.visible}
    bookingData={dialogState.cancelBooking.bookingData}
    on:close={handleCancelDialogClose}
    on:confirm
  />
{/if}

<!-- Split Kreditor Dialog -->
{#if dialogState.splitKreditor.visible}
  <SplitKreditorDialog
    bind:visible={dialogState.splitKreditor.visible}
    invoiceData={dialogState.splitKreditor.invoiceData}
    on:cancel={handleSplitKreditorClose}
    on:confirm
  />
{/if}

<!-- Split Debitor Dialog -->
{#if dialogState.splitDebitor.visible}
  <SplitDebitorDialog
    bind:visible={dialogState.splitDebitor.visible}
    invoiceData={dialogState.splitDebitor.invoiceData}
    on:cancel={handleSplitDebitorClose}
    on:confirm
  />
{/if}

<!-- Reconcile Dialog -->
{#if dialogState.reconcile.visible}
  <ReconcileDialog
    bind:visible={dialogState.reconcile.visible}
    selectedEntries={dialogState.reconcile.selectedEntries}
    on:cancel={handleReconcileClose}
    on:confirm
  />
{/if}

<!-- Account Selection Dialog -->
{#if dialogState.accountSelection.visible}
  <AccountSelectionDialog
    visible={dialogState.accountSelection.visible}
    field={dialogState.accountSelection.field}
    bookCircle={dialogState.accountSelection.bookCircle}
    accounts={dialogState.accountSelection.accounts}
    on:close={handleAccountSelectionClose}
    on:select
  />
{/if}

<style>
  /* Dialog styles are component-specific */
</style>
