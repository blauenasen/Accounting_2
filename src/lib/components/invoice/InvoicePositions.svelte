<!-- src/lib/components/invoice/InvoicePositions.svelte -->
<script lang="ts">
  // Invoice positions component - manages invoice line items
  import { createEventDispatcher } from 'svelte';
  import type { InvoicePosition } from '$lib/types/ui.js';
  import { calculatePositionTotals, formatCurrency } from '$lib/services/invoice/positionCalculator.js';
  import {
    MAX_POSITIONS,
    addPosition as addPositionService,
    removePosition as removePositionService,
    movePosition as movePositionService
  } from '$lib/services/invoice/positionCrud.js';
  import '$lib/styles/invoice-positions.css';

  const dispatch = createEventDispatcher<{
    change: { positions: InvoicePosition[] };
    'recalculate': void;
  }>();

  // Props
  export let positions: InvoicePosition[] = [];
  export let disabled = false;
  export let defaultGstRate = 7;

  /**
   * Add new position
   */
  function addPosition(): void {
    const result = addPositionService(positions, defaultGstRate);
    if (!result.success) {
      alert(result.error);
      return;
    }
    positions = result.positions;
    dispatch('change', { positions });
  }

  /**
   * Remove position
   */
  function removePosition(index: number): void {
    positions = removePositionService(positions, index);
    dispatch('change', { positions });
  }

  /**
   * Move position up
   */
  function moveUp(index: number): void {
    positions = movePositionService(positions, index, 'up');
    dispatch('change', { positions });
  }

  /**
   * Move position down
   */
  function moveDown(index: number): void {
    positions = movePositionService(positions, index, 'down');
    dispatch('change', { positions });
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

