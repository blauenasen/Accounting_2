<!-- src/lib/components/invoice/InvoiceContainer.svelte -->
<!-- Invoice container with three-table layout matching Original -->
<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import type { InvoiceData, InvoiceDialogState } from '$lib/types/ui.js';
  import type { InvoiceLine, InvoiceRecord, EstimateRecord } from '$lib/types/database.js';
  import { toastStore } from '$lib/utils/toast.js';
  import { toISOAny, isoToUS, todayISO } from '$lib/logic/invoice/invoiceFormatting.js';

  // Sub-components
  import InvoiceState from './InvoiceState.svelte';
  import InvoiceStatusBar from './invoiceStatusBar.svelte';
  import InvoiceActionBar from './invoiceActionBar.svelte';
  import InvoiceHeaderFields from './invoiceHeaderFields.svelte';
  import InvoiceTotalsBox from './invoiceTotalsBox.svelte';
  import InvoiceEstimateNumbers from './invoiceEstimateNumbers.svelte';
  import InvoicePositionsTable from './InvoicePositionsTable.svelte';
  import InvoiceListTable from './InvoiceListTable.svelte';
  import InvoiceEstimatesTable from './InvoiceEstimatesTable.svelte';
  import InvoiceDialogs from './InvoiceDialogs.svelte';
    import type { Debtor } from '$lib/server/db/debtors';

  const dispatch = createEventDispatcher();

  // Layout constants (matching Original + 5px spacing adjustment)
  const FRAME_TOP = 145;
  const LEFT_WIDTH = 300;
  const FRAME_HEIGHT = 700;
  const MID_LEFT = 320;
  const MID_WIDTH = 915;
  const RIGHT_LEFT = MID_LEFT + MID_WIDTH + 10; // 1245
  const RIGHT_WIDTH = LEFT_WIDTH;

  // Component refs
  let stateRef: InvoiceState;
  let positionsRef: any;

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
  let positions: InvoiceLine[] = [];
  let totals = { subtotal: 0, gstSum: 0, gstPct: 0, total: 0 };
  let debtor = { account: null, name: '', salutation: '', adress1: '', adress2: '', adress3: '', email: '' };
  let debtors: Debtor[] = [];
  let invoices: InvoiceRecord[] = [];
  let estimates: EstimateRecord[] = [];
  let loading = false;
  let saving = false;
  let statusMsg = '';
  let statusType: 'info' | 'success' | 'error' = 'info';

  // Selection indices
  let selectedInvoiceIndex: number | null = null;
  let selectedEstimateIndex: number | null = null;

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
    console.log('Validation flags:', flags, 'invoiceData:', { id_invoice: invoiceData.id_invoice, dirty: invoiceData.dirty, linesCount: invoiceData.linesCount });
    canSave = flags.canSave;
    canUpdate = flags.canUpdate;
    canSend = flags.canSend;
    canHandover = flags.canHandover;
    canPrint = flags.canPrint;
  }

  /**
   * Filter estimates by current account
   */
  $: rightItems = Array.isArray(estimates) && invoiceData.account != null
    ? estimates.filter(r => Number(r?.account) === Number(invoiceData.account))
    : [];

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
    if (!canPrint) return;
    const q = new URLSearchParams({
      id: String(invoiceData.id_invoice ?? ''),
      year: String(invoiceData.year ?? ''),
      num: String(invoiceData.num ?? ''),
      date: String(invoiceData.date ?? '')
    }).toString();
    window.open(`/print-invoice?${q}`, '_blank', 'noopener,noreferrer');
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
   * Handle invoice selection from left table
   * Pattern copied from estimate/+page.svelte:256-282
   */
  async function handleInvoiceSelect(event: CustomEvent): Promise<void> {
    const { index, id_invoice: idFromEvent } = event.detail;
    if (typeof index !== 'number') return;

    selectedInvoiceIndex = index;
    const row = invoices[index];
    if (!row) return;

    // Set all invoice data from row
    invoiceData.id_invoice = row.id_invoice ?? idFromEvent ?? null;
    invoiceData.year = String(row.year ?? '');
    invoiceData.num = String(row.num ?? '');
    invoiceData.dateISO = toISOAny(row.date) || todayISO();
    invoiceData.date = isoToUS(invoiceData.dateISO);
    invoiceData.account = row.account ?? null;
    invoiceData.estimateNr1 = (row?.estimateNr ?? '').toString();
    invoiceData.blocked = !!(row.blocked);
    invoiceData.booked = !!(row.booked);

    // Reset dirty flags
    invoiceData.headerDirty = false;
    invoiceData.linesDirty = false;

    statusMsg = `Selected I-${invoiceData.year}-${invoiceData.num}`;

    await tick();
  }

  /**
   * Handle estimate selection from right table
   */
  function handleEstimateSelect(event: CustomEvent): void {
    const { index } = event.detail;
    selectedEstimateIndex = index;
  }

  /**
   * Handle estimate double-click (copy positions)
   */
  async function handleEstimateDblPick(event: CustomEvent): Promise<void> {
    const { id_estimate } = event.detail;
    if (!id_estimate || !positionsRef || !invoiceData.id_invoice) return;

    try {
      // Fetch estimate positions from RESTful API
      const res = await fetch(`/api/estimates/${encodeURIComponent(id_estimate)}/lines`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`/api/estimates/${id_estimate}/lines -> ${res.status}`);

  const payload = await res.json();
  const lines = ((Array.isArray(payload) ? payload : Array.isArray(payload?.rows) ? payload.rows : []) as any[])
    .map((r: any) => ({ id_rate: r?.id_rate ?? null, description: r?.description ?? '', qty: Number(r?.qty ?? 0) }))
    .filter((x: any) => x.id_rate != null);

      // Replace positions in middle table
      if (positionsRef?.replaceAllLines) {
        await positionsRef.replaceAllLines(lines, { markDirty: true });
      }

      // Set estimateNr2 from selected estimate
      const estimateRow = estimates.find((e: any) => Number(e?.id_estimate) === Number(id_estimate));
      if (estimateRow) {
        invoiceData.estimateNr2 = `E-${estimateRow.year}-${estimateRow.num}`;
      }

      invoiceData.linesDirty = true;
    } catch (err) {
      console.error(err);
      toastStore.error('Copy from estimate failed');
    }
  }

  /**
   * Handle estimate blocked
   */
  function handleEstimateBlocked(event: CustomEvent): void {
    const { reason } = event.detail;
    if (reason === 'invoice-locked') {
      toastStore.info('Invoice is locked – copying is disabled');
    } else if (reason === 'estimate-locked') {
      toastStore.info('Offer is locked – copying is disabled');
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
</script>

<div class="page-wrap">
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

  <!-- Status Bar -->
  <InvoiceStatusBar {statusMsg} />

  <!-- Action Bar -->
  <InvoiceActionBar
    id_invoice={invoiceData.id_invoice}
    canSaveBtn={canSave}
    canUpdateBtn={canUpdate}
    canLoadOld={false}
    canShowPrint={canPrint}
    canSendCommitBtn={canSend}
    canHandover={canHandover}
    hasSel={invoiceData.id_invoice !== null}
    isBlocked={invoiceData.blocked}
    booked={invoiceData.booked}
    {loading}
    {saving}
    on:save={handleSave}
    on:loadOld={() => {}}
    on:new={handleReset}
    on:refresh={() => window.location.reload()}
    on:print={handlePrint}
    on:delete={handleDelete}
    on:send={handleSend}
    on:handover={handleHandover}
  />

  <!-- Header Fields -->
  <InvoiceHeaderFields
    bind:year={invoiceData.year}
    bind:num={invoiceData.num}
    bind:date={invoiceData.date}
    bind:account={invoiceData.account}
    {debtor}
    {debtors}
  />

  <!-- Left Table: Invoice List -->
  <div style="position:absolute; top:{FRAME_TOP}px; left:10px; width:{LEFT_WIDTH}px; height:{FRAME_HEIGHT}px; box-sizing:border-box; overflow-y:auto; border:1px solid #ccc; background-color:#fff; z-index:2;">
    <InvoiceListTable
      items={invoices}
      bind:selectedIndex={selectedInvoiceIndex}
      on:select={handleInvoiceSelect}
    />
  </div>

  <!-- Middle Table: Positions -->
  <div style="position:absolute; top:{FRAME_TOP}px; left:{MID_LEFT}px; width:{MID_WIDTH}px; height:{FRAME_HEIGHT}px; box-sizing:border-box; overflow-y:auto; border:1px solid #ccc; background-color:#fff; z-index:2;">
    <InvoicePositionsTable
      bind:this={positionsRef}
      selectedIdInvoice={invoiceData.id_invoice}
      locked={invoiceData.blocked || invoiceData.booked || saving}
      on:totals={(e) => { totals = e.detail; }}
      on:dirty={(e) => { invoiceData.linesDirty = e.detail.value; }}
      on:stats={(e) => { invoiceData.linesCount = e.detail.count; }}
      on:snapshot={() => {}}
    />
  </div>

  <!-- Right Table: Estimates -->
  <div style="position:absolute; top:{FRAME_TOP}px; left:{RIGHT_LEFT}px; width:{RIGHT_WIDTH}px; height:{FRAME_HEIGHT}px; box-sizing:border-box; overflow-y:auto; border:1px solid #ccc; background-color:#fff; z-index:1;">
    <InvoiceEstimatesTable
      items={rightItems}
      bind:selectedIndex={selectedEstimateIndex}
      invoiceLocked={invoiceData.blocked}
      on:select={handleEstimateSelect}
      on:dblpick={handleEstimateDblPick}
      on:blocked={handleEstimateBlocked}
    />
  </div>

  <!-- Totals Box -->
  <div style="position:absolute; top:{FRAME_TOP + FRAME_HEIGHT + 6}px; left:{MID_LEFT + MID_WIDTH - 277}px; display:flex; justify-content:flex-end;">
    <InvoiceTotalsBox {totals} />
  </div>

  <!-- Estimate Numbers -->
  <InvoiceEstimateNumbers
    estimateNr1={invoiceData.estimateNr1}
    estimateNr2={invoiceData.estimateNr2}
    frameTop={FRAME_TOP}
    frameHeight={FRAME_HEIGHT}
    rightLeft={RIGHT_LEFT}
    rightWidth={RIGHT_WIDTH}
    leftWidth={LEFT_WIDTH}
  />

  <!-- Dialogs -->
  <InvoiceDialogs bind:dialogState on:success={handleSendSuccess} />
</div>

<style>
  .page-wrap {
    position: relative;
    width: 100%;
    min-height: 80vh;
    background: #f5f5f5;
  }
</style>
