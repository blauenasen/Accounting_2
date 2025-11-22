<!-- BookingBalanceFields.svelte -->
<!-- 8 Balance Fields (User-Positioned!) for Kontoansicht & OP-Ansicht -->
<!-- Measurements from Mess-Tabelle.md: BALANCE FIELDS -->

<script lang="ts">
  // Balance values - will be computed from journal data
  export let openingBalance: number = 0.00;
  export let debitBalance: number = 0.00;
  export let creditBalance: number = 0.00;
  export let totalBalance: number = 0.00;
  export let closingBalance: number = 0.00;
  export let sumDebit: number = 0.00;
  export let sumCredit: number = 0.00;
  export let sumTotal: number = 0.00;

  // Format numbers to 2 decimal places
  function formatBalance(value: number): string {
    return value.toFixed(2);
  }
</script>

<!-- ROW 1: PRIMARY BALANCE FIELDS (5 fields) -->

<!-- Opening Balance: Label (649.08px, 105px), Input (630px, 115px) -->
<label class="balance-label opening-label" for="opening-balance">
  Opening-Balance
</label>
<input
  id="opening-balance"
  type="text"
  readonly
  class="balance-input opening-input"
  value={formatBalance(openingBalance)} />

<!-- Debit Balance: Label (770.88px, 105px), Input (746px, 115px) -->
<label class="balance-label debit-label" for="debit-balance">
  Debit-Balance
</label>
<input
  id="debit-balance"
  type="text"
  readonly
  class="balance-input debit-input"
  value={formatBalance(debitBalance)} />

<!-- Credit Balance: Label (885.53px, 105px), Input (862px, 115px) -->
<label class="balance-label credit-label" for="credit-balance">
  Credit-Balance
</label>
<input
  id="credit-balance"
  type="text"
  readonly
  class="balance-input credit-input"
  value={formatBalance(creditBalance)} />

<!-- Total Balance: Label (1003.75px, 105px), Input (978px, 115px) -->
<label class="balance-label total-label" for="total-balance">
  Total-Balance
</label>
<input
  id="total-balance"
  type="text"
  readonly
  class="balance-input total-input"
  value={formatBalance(totalBalance)} />

<!-- Closing Balance: Label (1114.86px, 105px), Input (1094px, 115px) -->
<label class="balance-label closing-label" for="closing-balance">
  Closing-Balance
</label>
<input
  id="closing-balance"
  type="text"
  readonly
  class="balance-input closing-input"
  value={formatBalance(closingBalance)} />

<!-- ROW 2: SUM FIELDS (3 fields) -->

<!-- Sum Debit: Label (777.31px, 163px), Input (746px, 173px) -->
<label class="balance-label sum-debit-label" for="sum-debit">
  Sum Debit
</label>
<input
  id="sum-debit"
  type="text"
  readonly
  class="balance-input sum-debit-input"
  value={formatBalance(sumDebit)} />

<!-- Sum Credit: Label (891.98px, 163px), Input (862px, 173px) -->
<label class="balance-label sum-credit-label" for="sum-credit">
  Sum Credit
</label>
<input
  id="sum-credit"
  type="text"
  readonly
  class="balance-input sum-credit-input"
  value={formatBalance(sumCredit)} />

<!-- Sum Total: Label (1010.28px, 163px), Input (978px, 173px) -->
<label class="balance-label sum-total-label" for="sum-total">
  Sum Total
</label>
<input
  id="sum-total"
  type="text"
  readonly
  class="balance-input sum-total-input"
  value={formatBalance(sumTotal)} />

<style>
  /* ==================================================================
     BALANCE FIELD LABELS - Mess-Tabelle.md: BALANCE FIELDS
     CRITICAL: Font-size 8px (very small!)
     ================================================================== */

  .balance-label {
    position: absolute;
    font-family: Arial;
    font-size: 8px;
    font-weight: 400;
    color: rgb(85, 85, 85);
    text-align: center;
  }

  /* Row 1 Labels (Y: 105px) */
  .opening-label {
    left: 649.08px;
    top: 105px;
    width: 61.83px;
  }

  .debit-label {
    left: 770.88px;
    top: 105px;
    width: 50.25px;
  }

  .credit-label {
    left: 885.53px;
    top: 105px;
    width: 52.92px;
  }

  .total-label {
    left: 1003.75px;
    top: 105px;
    width: 48.48px;
  }

  .closing-label {
    left: 1114.86px;
    top: 105px;
    width: 58.27px;
  }

  /* Row 2 Labels (Y: 163px) */
  .sum-debit-label {
    left: 777.31px;
    top: 163px;
    width: 37.36px;
  }

  .sum-credit-label {
    left: 891.98px;
    top: 163px;
    width: 40.02px;
  }

  .sum-total-label {
    left: 1010.28px;
    top: 163px;
    width: 35.44px;
  }

  /* ==================================================================
     BALANCE FIELD INPUTS - Mess-Tabelle.md: BALANCE FIELDS
     All inputs: 100px × 30px, readonly, right-aligned
     ================================================================== */

  .balance-input {
    position: absolute;
    width: 100px;
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);

    font-family: Arial;
    font-size: 14px;
    font-weight: 400;
    color: rgb(0, 0, 0);
    text-align: right;

    padding: 0px 6px;
    box-sizing: border-box;
  }

  /* Row 1 Inputs (Y: 115px) */
  .opening-input {
    left: 630px;
    top: 115px;
  }

  .debit-input {
    left: 746px;
    top: 115px;
  }

  .credit-input {
    left: 862px;
    top: 115px;
  }

  .total-input {
    left: 978px;
    top: 115px;
  }

  .closing-input {
    left: 1094px;
    top: 115px;
  }

  /* Row 2 Inputs (Y: 173px) */
  .sum-debit-input {
    left: 746px;
    top: 173px;
  }

  .sum-credit-input {
    left: 862px;
    top: 173px;
  }

  .sum-total-input {
    left: 978px;
    top: 173px;
  }
</style>
