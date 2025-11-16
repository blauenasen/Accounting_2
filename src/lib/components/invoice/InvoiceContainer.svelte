<!-- src/lib/components/invoice/InvoiceContainer.svelte -->
<script lang="ts">
  // Invoice container orchestrator - coordinates all sub-components
  import { createEventDispatcher, onMount } from 'svelte';
  import type {
    InvoiceData,
    InvoiceDialogState,
    InvoiceViewMode
  } from '$lib/types/ui.js';
  import { toastStore } from '$lib/utils/toast.js';

  // Sub-components
  import InvoiceState from './InvoiceState.svelte';
  import InvoiceForm from './InvoiceForm.svelte';
  import InvoiceList from './InvoiceList.svelte';
  import InvoiceDialogs from './InvoiceDialogs.svelte';

  const dispatch = createEventDispatcher<{
    'view-change': { mode: InvoiceViewMode };
  }>();

  // Props
  export let viewMode: InvoiceViewMode = 'list';

  // Component refs
  let stateRef: InvoiceState;

  // State bindings (from InvoiceState)
  let invoiceData: InvoiceData = {
    id_invoice: null,
    year: '',
    num: '',
    date: '',
    dateISO: '',
    account: null,
    estimateNr1: '',
    estimateNr2: '',
    blocked: false,
    booked: false,
    isNew: true,
    dirty: false,
    headerDirty: false,
    linesDirty: false,
    linesCount: 0
  };
  let positions: unknown[] = [];
  let totals = { subtotal: 0, gstSum: 0, gstPct: 0, total: 0 };
  let debtor = { account: null, name: '', salutation: '', adress1: '', adress2: '', adress3: '', email: '' };
  let debtors: unknown[] = [];
  let invoices: unknown[] = [];
  let estimates: unknown[] = [];
  let loading = false;
  let saving = false;
  let statusMsg = '';
  let statusType: 'info' | 'success' | 'error' = 'info';

  // Dialog states
  let dialogState: InvoiceDialogState = {
    sendModal: {
      visible: false,
      invoiceRow: null,
      mailDefaults: {
        to: '',
        subject: '',
        body: ''
      }
    }
  };

  // Validation flags
  let canSave = false;
  let canUpdate = false;
  let canDelete = false;
  let canPrint = false;
  let canSend = false;
  let canHandover = false;

  /**
   * Lifecycle: Load initial data
   */
  onMount(async () => {
    if (stateRef) {
      await stateRef.loadAllData();
      stateRef.initNewForm();
    }
  });

  /**
   * Update validation flags
   */
  $: if (stateRef) {
    const flags = stateRef.getValidationFlags();
    canSave = flags.canSave;
    canUpdate = flags.canUpdate;
    canSend = flags.canSend;
    canHandover = flags.canHandover;
    canPrint = flags.canPrint;
  }

  /**
   * Handle save new invoice
   */
  async function handleSave(): Promise<void> {
    if (!stateRef) return;

    const validation = stateRef.validateHeaderNew();
    if (!validation.valid) {
      toastStore.error(validation.errors.join(', '));
      return;
    }

    saving = true;
    try {
      // TODO: API call to save invoice
      toastStore.success('Invoice saved successfully');
      stateRef.setStatus('Invoice saved', 'success');
    } catch (error) {
      toastStore.error(error instanceof Error ? error.message : 'Failed to save invoice');
    } finally {
      saving = false;
    }
  }

  /**
   * Handle update existing invoice
   */
  async function handleUpdate(): Promise<void> {
    if (!stateRef) return;

    const validation = stateRef.validateHeaderExisting();
    if (!validation.valid) {
      toastStore.error(validation.errors.join(', '));
      return;
    }

    saving = true;
    try {
      // TODO: API call to update invoice
      toastStore.success('Invoice updated successfully');
      stateRef.setStatus('Invoice updated', 'success');
    } catch (error) {
      toastStore.error(error instanceof Error ? error.message : 'Failed to update invoice');
    } finally {
      saving = false;
    }
  }

  /**
   * Handle delete invoice
   */
  async function handleDelete(): Promise<void> {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      // TODO: API call to delete invoice
      toastStore.success('Invoice deleted successfully');
      if (stateRef) {
        await stateRef.loadInvoices();
        stateRef.initNewForm();
      }
    } catch (error) {
      toastStore.error(error instanceof Error ? error.message : 'Failed to delete invoice');
    }
  }

  /**
   * Handle reset form
   */
  function handleReset(): void {
    if (stateRef) {
      stateRef.initNewForm();
      stateRef.setStatus('Form reset', 'info');
    }
  }

  /**
   * Handle print invoice
   */
  function handlePrint(): void {
    toastStore.info('Print functionality will be implemented');
  }

  /**
   * Handle send invoice
   */
  function handleSend(): void {
    dialogState.sendModal = {
      visible: true,
      invoiceRow: invoiceData,
      mailDefaults: {
        to: debtor.email || '',
        subject: `Invoice ${invoiceData.year}-${invoiceData.num}`,
        body: ''
      }
    };
  }

  /**
   * Handle handover to accounting
   */
  async function handleHandover(): Promise<void> {
    if (!confirm('Hand over this invoice to accounting?')) return;

    try {
      // TODO: API call to handover invoice
      toastStore.success('Invoice handed over to accounting');
      if (stateRef) {
        await stateRef.loadInvoices();
      }
    } catch (error) {
      toastStore.error(error instanceof Error ? error.message : 'Failed to handover invoice');
    }
  }

  /**
   * Handle header field changes
   */
  function handleHeaderChange(event: CustomEvent): void {
    const { field, value } = event.detail;
    invoiceData.headerDirty = true;
  }

  /**
   * Handle lines change
   */
  function handleLinesChange(event: CustomEvent): void {
    const { positions: newPositions } = event.detail;
    positions = newPositions;
    invoiceData.linesDirty = true;
    if (stateRef) {
      stateRef.updateTotals();
    }
  }

  /**
   * Handle send success
   */
  async function handleSendSuccess(): Promise<void> {
    dialogState.sendModal.visible = false;
    toastStore.success('Invoice sent successfully');
    if (stateRef) {
      await stateRef.loadInvoices();
    }
  }

  /**
   * Handle invoice selection from list
   */
  function handleInvoiceSelect(event: CustomEvent): void {
    const { invoice } = event.detail;
    // TODO: Load invoice data and switch to form view
    toastStore.info(`Invoice ${invoice.year}-${invoice.num} selected`);
    viewMode = 'form';
  }

  /**
   * Handle new invoice from list
   */
  function handleNewInvoice(): void {
    if (stateRef) {
      stateRef.initNewForm();
    }
    viewMode = 'form';
  }

  /**
   * Handle view PDF
   */
  function handleViewPdf(event: CustomEvent): void {
    const { invoiceId } = event.detail;
    toastStore.info(`View PDF for invoice ${invoiceId}`);
    // TODO: Open PDF in new window
  }

  /**
   * Handle send email from list
   */
  function handleSendEmailFromList(event: CustomEvent): void {
    const { invoiceId } = event.detail;
    // TODO: Load invoice and open send dialog
    toastStore.info(`Prepare to send invoice ${invoiceId}`);
  }

  /**
   * Handle delete invoice
   */
  async function handleDeleteInvoice(event: CustomEvent): Promise<void> {
    const { invoiceId } = event.detail;
    try {
      // TODO: API call to delete invoice
      toastStore.success(`Invoice ${invoiceId} deleted`);
      if (stateRef) {
        await stateRef.loadInvoices();
      }
    } catch (error) {
      toastStore.error('Failed to delete invoice');
    }
  }

  /**
   * Public API: Switch view mode
   */
  export function switchView(mode: InvoiceViewMode): void {
    viewMode = mode;
    dispatch('view-change', { mode });
  }
</script>

<div class="invoice-container">
  <!-- State Management Component (no visual output) -->
  <InvoiceState
    bind:this={stateRef}
    bind:invoiceData
    bind:positions
    bind:totals
    bind:debtor
    bind:debtors
    bind:invoices
    bind:estimates
    bind:loading
    bind:saving
    bind:statusMsg
    bind:statusType
  />

  <!-- Main Form View -->
  {#if viewMode === 'form'}
    <InvoiceForm
      {invoiceData}
      {debtor}
      {debtors}
      {positions}
      {totals}
      {loading}
      {saving}
      {statusMsg}
      {statusType}
      {canSave}
      {canUpdate}
      {canDelete}
      {canPrint}
      {canSend}
      {canHandover}
      on:save={handleSave}
      on:update={handleUpdate}
      on:delete={handleDelete}
      on:reset={handleReset}
      on:print={handlePrint}
      on:send={handleSend}
      on:handover={handleHandover}
      on:header-change={handleHeaderChange}
      on:lines-change={handleLinesChange}
    />
  {:else}
    <!-- List View -->
    <InvoiceList
      {invoices}
      {loading}
      on:select={handleInvoiceSelect}
      on:new-invoice={handleNewInvoice}
      on:view-pdf={handleViewPdf}
      on:send-email={handleSendEmailFromList}
      on:delete={handleDeleteInvoice}
    />
  {/if}

  <!-- Dialogs -->
  <InvoiceDialogs bind:dialogState on:success={handleSendSuccess} />
</div>

<style>
  .invoice-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
  }

</style>
