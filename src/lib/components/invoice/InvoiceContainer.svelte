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
    />
  {:else}
    <!-- List View (placeholder - will integrate InvoiceList component later) -->
    <div class="list-view-placeholder">
      <h2>Invoice List View</h2>
      <p>Will be integrated with InvoiceList.svelte component</p>
      <button type="button" on:click={() => switchView('form')}>New Invoice</button>
    </div>
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

  .list-view-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    padding: 2rem;
    background: #fff;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    margin: 2rem;
  }

  .list-view-placeholder h2 {
    margin: 0 0 1rem 0;
    color: #374151;
  }

  .list-view-placeholder p {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
  }

  .list-view-placeholder button {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .list-view-placeholder button:hover {
    background: #2563eb;
  }
</style>
