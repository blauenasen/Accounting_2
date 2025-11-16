<!-- src/lib/components/invoice/InvoiceDialogs.svelte -->
<script lang="ts">
  // Invoice dialogs orchestrator - manages all dialog states
  import type { InvoiceDialogState } from '$lib/types/ui.js';

  // Props
  export let dialogState: InvoiceDialogState;

  // Dialog components (will be migrated in future)
  // For now, we'll use the existing components from the old project
  import InvoiceSendModal from '$lib/components/invoice/invoiceSendModal.svelte';

  /**
   * Handle dialog close events
   */
  function handleSendModalClose(): void {
    dialogState.sendModal.visible = false;
    dialogState.sendModal.invoiceRow = null;
  }
</script>

<!-- Send Modal -->
{#if dialogState.sendModal.visible}
  <InvoiceSendModal
    visible={dialogState.sendModal.visible}
    invoiceRow={dialogState.sendModal.invoiceRow}
    mailDefaults={dialogState.sendModal.mailDefaults}
    on:close={handleSendModalClose}
    on:success
  />
{/if}

<style>
  /* Dialog styles are component-specific */
</style>
