<!-- AccountSumFields.svelte -->
<!-- 3 Sum fields for selected rows in Kontoansicht: Sum Debit, Sum Credit, Sum Total -->

<script lang="ts">
  import { selectionStore } from '$lib/stores/selectionStore';

  export let displayRows: any[] = [];
  export let viewMode: string = 'account';

  let sumDebit: string = '0.00';
  let sumCredit: string = '0.00';
  let sumTotal: string = '0.00';

  /**
   * Calculate sums for selected rows based on view mode
   */
  function calculateSelectionSums(rows: any[], selectedIds: Set<number>, mode: string) {
    if (!selectedIds || selectedIds.size === 0) {
      sumDebit = '0.00';
      sumCredit = '0.00';
      sumTotal = '0.00';
      return;
    }

    let debit = 0;
    let credit = 0;

    for (const row of rows) {
      const rowId = row?.IdNr ?? row?.idNr ?? row?.idnr;
      if (!rowId || !selectedIds.has(rowId)) continue;

      if (mode === 'account') {
        // Kontoansicht: SumSoll → Debit, SumHaben → Credit
        debit += Number(row.SumSoll) || 0;
        credit += Number(row.SumHaben) || 0;
      } else if (mode === 'primanota') {
        // Primanota: UE (Turnover) + SH (S/H indicator)
        const turnover = Number(row.UE) || 0;
        const sh = String(row.SH || '').trim().toUpperCase();

        if (sh === 'S') {
          debit += turnover;
        } else if (sh === 'H') {
          credit += turnover;
        }
      } else if (mode === 'op') {
        // OP-Ansicht: GrossPrice/Brutto/grossPrice (positive → Debit, negative → Credit)
        const grossPrice = Number(row.GrossPrice || row.Brutto || row.grossPrice) || 0;

        if (grossPrice > 0) {
          debit += grossPrice;
        } else if (grossPrice < 0) {
          credit += Math.abs(grossPrice);
        }
      }
    }

    sumDebit = debit.toFixed(2);
    sumCredit = credit.toFixed(2);
    sumTotal = (debit - credit).toFixed(2);
  }

  /**
   * Reactive: Recalculate when selection or rows change
   */
  $: selectedIds = $selectionStore.selectedIds;

  $: if (displayRows.length > 0) {
    calculateSelectionSums(displayRows, selectedIds, viewMode);
  } else {
    sumDebit = '0.00';
    sumCredit = '0.00';
    sumTotal = '0.00';
  }

  /**
   * Determines if a value is negative
   */
  function isNegative(value: string): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num < 0;
  }
</script>

<div class="sum-fields-container">
  <div class="empty-space"></div>

  <div class="summary-field">
    <div class="summary-label">Sum Debit</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(sumDebit)}
      value={sumDebit}
      readonly
    />
  </div>

  <div class="summary-field">
    <div class="summary-label">Sum Credit</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(sumCredit)}
      value={sumCredit}
      readonly
    />
  </div>

  <div class="summary-field">
    <div class="summary-label">Sum Total</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(sumTotal)}
      value={sumTotal}
      readonly
    />
  </div>
</div>

<style>
  .sum-fields-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-top: -20px;
  }

  .empty-space {
    width: 854px;
  }

  .summary-field {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
  }

  .summary-label {
    font-size: 8px;
    color: #555;
    text-align: center;
    margin-bottom: 2px;
    user-select: none;
  }

  .summary-input {
    height: 30px;
    width: 100px;
    font-size: 14px;
    text-align: right;
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    padding: 0 4px;
    color: #000;
    cursor: default;
  }

  .summary-input.negative {
    color: #dc2626;
  }

  .summary-input:focus {
    outline: none;
  }
</style>
