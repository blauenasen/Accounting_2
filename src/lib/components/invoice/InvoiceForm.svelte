<!-- src/lib/components/invoice/InvoiceForm.svelte -->
<script lang="ts">
  // Invoice form component - form fields and validation
  import { createEventDispatcher } from 'svelte';
  import type { InvoiceData, DebtorInfo } from '$lib/types/ui.js';

  // Sub-components (will use existing ones from old project for now)
  import InvoiceHeaderFields from '$lib/components/invoice/invoiceHeaderFields.svelte';
  import InvoiceActionBar from '$lib/components/invoice/invoiceActionBar.svelte';
  import InvoiceTotalsBox from '$lib/components/invoice/invoiceTotalsBox.svelte';
  import InvoiceStatusBar from '$lib/components/invoice/invoiceStatusBar.svelte';
  import InvoiceEstimateNumbers from '$lib/components/invoice/invoiceEstimateNumbers.svelte';
  import InvoicePositions from './InvoicePositions.svelte';

  const dispatch = createEventDispatcher<{
    save: void;
    update: void;
    delete: void;
    reset: void;
    print: void;
    send: void;
    handover: void;
    'header-change': { field: string; value: unknown };
    'lines-change': { positions: unknown[] };
  }>();

  // Props
  export let invoiceData: InvoiceData;
  export let debtor: DebtorInfo;
  export let debtors: DebtorInfo[] = [];
  export let positions: any[] = [];
  export let totals: { subtotal: number; gstSum: number; gstPct: number; total: number };
  export let loading: boolean = false;
  export let saving: boolean = false;
  export let statusMsg: string = '';
  export let statusType: 'info' | 'success' | 'error' = 'info';

  // Validation flags (from parent)
  export let canSave: boolean = false;
  export let canUpdate: boolean = false;
  export let canDelete: boolean = false;
  export let canPrint: boolean = false;
  export let canSend: boolean = false;
  export let canHandover: boolean = false;

  // Positions component ref
  let positionsRef: any;

  /**
   * Handle positions change
   */
  function handlePositionsChange(event: CustomEvent): void {
    const { positions: newPositions } = event.detail;
    dispatch('lines-change', { positions: newPositions });
  }

  /**
   * Handle recalculate
   */
  function handleRecalculate(): void {
    // Trigger recalculation in parent
    dispatch('lines-change', { positions });
  }

  /**
   * Handle header field changes
   */
  function handleHeaderChange(event: CustomEvent): void {
    const { field, value } = event.detail;
    dispatch('header-change', { field, value });
  }

  /**
   * Handle action bar events
   */
  function handleSave(): void {
    dispatch('save');
  }

  function handleUpdate(): void {
    dispatch('update');
  }

  function handleDelete(): void {
    dispatch('delete');
  }

  function handleReset(): void {
    dispatch('reset');
  }

  function handlePrint(): void {
    dispatch('print');
  }

  function handleSend(): void {
    dispatch('send');
  }

  function handleHandover(): void {
    dispatch('handover');
  }
</script>

<div class="invoice-form">
  <!-- Status Bar -->
  {#if statusMsg}
    <InvoiceStatusBar message={statusMsg} type={statusType} />
  {/if}

  <!-- Action Bar -->
  <InvoiceActionBar
    {canSave}
    {canUpdate}
    {canDelete}
    {canPrint}
    {canSend}
    {canHandover}
    {loading}
    {saving}
    on:save={handleSave}
    on:update={handleUpdate}
    on:delete={handleDelete}
    on:reset={handleReset}
    on:print={handlePrint}
    on:send={handleSend}
    on:handover={handleHandover}
  />

  <!-- Header Fields -->
  <div class="form-header">
    <InvoiceHeaderFields
      bind:id_invoice={invoiceData.id_invoice}
      bind:year={invoiceData.year}
      bind:num={invoiceData.num}
      bind:date={invoiceData.date}
      bind:dateISO={invoiceData.dateISO}
      bind:account={invoiceData.account}
      {debtors}
      {debtor}
      on:change={handleHeaderChange}
    />

    <!-- Estimate Numbers -->
    {#if invoiceData.estimateNr1 || invoiceData.estimateNr2}
      <InvoiceEstimateNumbers
        estimateNr1={invoiceData.estimateNr1}
        estimateNr2={invoiceData.estimateNr2}
      />
    {/if}
  </div>

  <!-- Positions Table -->
  <div class="form-positions">
    <InvoicePositions
      bind:this={positionsRef}
      bind:positions
      disabled={invoiceData.blocked || invoiceData.booked || saving}
      on:change={handlePositionsChange}
      on:recalculate={handleRecalculate}
    />
  </div>

  <!-- Totals Box -->
  <div class="form-totals">
    <InvoiceTotalsBox {totals} />
  </div>
</div>

<style>
  .invoice-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: #fff;
  }

  .form-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .form-positions {
    flex: 1;
    min-height: 300px;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .positions-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: #fff;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    color: #6b7280;
  }

  .positions-placeholder p {
    margin: 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 500;
  }

  .positions-placeholder .note {
    font-size: 0.875rem;
    font-style: italic;
    color: #9ca3af;
  }

  .form-totals {
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
</style>
