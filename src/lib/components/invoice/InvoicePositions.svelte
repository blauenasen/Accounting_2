<!-- src/lib/components/invoice/InvoicePositions.svelte -->
<script lang="ts">
  // Invoice positions component - manages invoice line items
  import { createEventDispatcher } from 'svelte';
  import type { InvoicePosition } from '$lib/types/ui.js';
  import Decimal from 'decimal.js';

  const dispatch = createEventDispatcher<{
    change: { positions: InvoicePosition[] };
    'recalculate': void;
  }>();

  // Props
  export let positions: InvoicePosition[] = [];
  export let disabled = false;
  export let defaultGstRate = 7;

  // Constants
  const MAX_POSITIONS = 20;

  /**
   * Add new position
   */
  function addPosition(): void {
    if (positions.length >= MAX_POSITIONS) {
      alert(`Maximum ${MAX_POSITIONS} positions allowed`);
      return;
    }

    const newPos: InvoicePosition = {
      id: null,
      id_invoice: null,
      pos: positions.length + 1,
      quantity: 1,
      description: '',
      unit_price: 0,
      gst_rate: defaultGstRate,
      subtotal: 0,
      gst: 0,
      total: 0
    };

    positions = [...positions, newPos];
    dispatch('change', { positions });
  }

  /**
   * Remove position
   */
  function removePosition(index: number): void {
    positions = positions.filter((_, i) => i !== index);
    // Renumber positions
    positions = positions.map((p, i) => ({ ...p, pos: i + 1 }));
    recalculateAll();
    dispatch('change', { positions });
  }

  /**
   * Move position up
   */
  function moveUp(index: number): void {
    if (index === 0) return;
    const temp = positions[index];
    positions[index] = positions[index - 1];
    positions[index - 1] = temp;
    // Renumber
    positions = positions.map((p, i) => ({ ...p, pos: i + 1 }));
    dispatch('change', { positions });
  }

  /**
   * Move position down
   */
  function moveDown(index: number): void {
    if (index === positions.length - 1) return;
    const temp = positions[index];
    positions[index] = positions[index + 1];
    positions[index + 1] = temp;
    // Renumber
    positions = positions.map((p, i) => ({ ...p, pos: i + 1 }));
    dispatch('change', { positions });
  }

  /**
   * Calculate position totals (subtotal, GST, total)
   */
  function calculatePositionTotals(pos: InvoicePosition) {
    const quantity = new Decimal(pos.quantity || 0);
    const unitPrice = new Decimal(pos.unit_price || 0);
    const gstRate = new Decimal(pos.gst_rate || 0).div(100);

    const subtotal = quantity.times(unitPrice);
    const gst = subtotal.times(gstRate);
    const total = subtotal.plus(gst);

    return {
      subtotal: subtotal.toDecimalPlaces(2).toNumber(),
      gst: gst.toDecimalPlaces(2).toNumber(),
      total: total.toDecimalPlaces(2).toNumber()
    };
  }

  /**
   * Recalculate single position
   */
  function recalculatePosition(index: number): void {
    const pos = positions[index];

    try {
      const totals = calculatePositionTotals(pos);
      positions[index] = { ...pos, ...totals };
      positions = [...positions]; // Trigger reactivity
      dispatch('change', { positions });
      dispatch('recalculate');
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }

  /**
   * Recalculate all positions
   */
  function recalculateAll(): void {
    positions = positions.map((pos) => {
      try {
        const totals = calculatePositionTotals(pos);
        return { ...pos, ...totals };
      } catch {
        return pos;
      }
    });

    dispatch('change', { positions });
    dispatch('recalculate');
  }

  /**
   * Handle field change
   */
  function handleChange(index: number, field: keyof InvoicePosition, value: any): void {
    positions[index] = {
      ...positions[index],
      [field]: value
    };
    recalculatePosition(index);
  }

  /**
   * Format currency for display
   */
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  // Initialize with one position if empty
  $: if (positions.length === 0 && !disabled) {
    addPosition();
  }
</script>

<div class="invoice-positions">
  <div class="positions-header">
    <h3>Positions</h3>
    <button
      type="button"
      class="btn-add"
      on:click={addPosition}
      disabled={disabled || positions.length >= MAX_POSITIONS}
    >
      + Add Position
    </button>
  </div>

  {#if positions.length === 0}
    <div class="empty-state">
      <p>No positions added yet</p>
      <button type="button" class="btn-secondary" on:click={addPosition} disabled={disabled}>
        Add first position
      </button>
    </div>
  {:else}
    <div class="positions-table-wrapper">
      <table class="positions-table">
        <thead>
          <tr>
            <th class="col-pos">#</th>
            <th class="col-desc">Description</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Unit Price</th>
            <th class="col-gst">GST %</th>
            <th class="col-subtotal">Subtotal</th>
            <th class="col-gst-amt">GST</th>
            <th class="col-total">Total</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each positions as position, index (position.id || index)}
            <tr>
              <td class="col-pos">{position.pos}</td>
              <td class="col-desc">
                <textarea
                  value={position.description}
                  on:input={(e) => handleChange(index, 'description', e.currentTarget.value)}
                  placeholder="Item description..."
                  rows="2"
                  disabled={disabled}
                />
              </td>
              <td class="col-qty">
                <input
                  type="number"
                  value={position.quantity}
                  on:input={(e) =>
                    handleChange(index, 'quantity', parseFloat(e.currentTarget.value) || 0)}
                  min="0"
                  step="0.01"
                  disabled={disabled}
                />
              </td>
              <td class="col-price">
                <input
                  type="number"
                  value={position.unit_price}
                  on:input={(e) =>
                    handleChange(index, 'unit_price', parseFloat(e.currentTarget.value) || 0)}
                  min="0"
                  step="0.01"
                  disabled={disabled}
                />
              </td>
              <td class="col-gst">
                <select
                  value={position.gst_rate}
                  on:change={(e) =>
                    handleChange(index, 'gst_rate', parseFloat(e.currentTarget.value) || 0)}
                  disabled={disabled}
                >
                  <option value="0">0%</option>
                  <option value="7">7%</option>
                  <option value="19">19%</option>
                </select>
              </td>
              <td class="col-subtotal">
                {formatCurrency(position.subtotal)}
              </td>
              <td class="col-gst-amt">
                {formatCurrency(position.gst)}
              </td>
              <td class="col-total">
                <strong>{formatCurrency(position.total)}</strong>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button
                    type="button"
                    class="btn-icon"
                    title="Move up"
                    on:click={() => moveUp(index)}
                    disabled={disabled || index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="btn-icon"
                    title="Move down"
                    on:click={() => moveDown(index)}
                    disabled={disabled || index === positions.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    class="btn-icon btn-danger"
                    title="Delete"
                    on:click={() => removePosition(index)}
                    disabled={disabled}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="positions-footer">
      <span class="position-count">
        {positions.length} / {MAX_POSITIONS} positions
      </span>
      <button type="button" class="btn-recalculate" on:click={recalculateAll} disabled={disabled}>
        Recalculate All
      </button>
    </div>
  {/if}
</div>

<style>
  .invoice-positions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .positions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .positions-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .btn-add {
    padding: 0.5rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .btn-add:hover:not(:disabled) {
    background: #059669;
  }

  .btn-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #6b7280;
    text-align: center;
  }

  .empty-state p {
    margin: 0 0 1rem 0;
    font-size: 1rem;
  }

  .btn-secondary {
    padding: 0.625rem 1.25rem;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .positions-table-wrapper {
    overflow-x: auto;
  }

  .positions-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .positions-table thead {
    background: #f9fafb;
  }

  .positions-table th {
    padding: 0.75rem 0.5rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  .positions-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: top;
  }

  .col-pos {
    width: 40px;
    text-align: center;
  }

  .col-desc {
    min-width: 250px;
  }

  .col-qty,
  .col-price,
  .col-gst {
    width: 100px;
  }

  .col-subtotal,
  .col-gst-amt,
  .col-total {
    width: 100px;
    text-align: right;
  }

  .col-actions {
    width: 100px;
    text-align: center;
  }

  .positions-table input,
  .positions-table select,
  .positions-table textarea {
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: inherit;
  }

  .positions-table input:focus,
  .positions-table select:focus,
  .positions-table textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .positions-table input:disabled,
  .positions-table select:disabled,
  .positions-table textarea:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .positions-table textarea {
    resize: vertical;
    min-height: 2.5rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
  }

  .btn-icon {
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-icon:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .btn-icon:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn-icon.btn-danger:hover:not(:disabled) {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #991b1b;
  }

  .positions-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .position-count {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .btn-recalculate {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .btn-recalculate:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-recalculate:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
