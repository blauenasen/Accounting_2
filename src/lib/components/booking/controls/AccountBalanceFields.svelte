<!-- AccountBalanceFields.svelte -->
<!-- 5 Balance fields for Kontoansicht: Opening, Debit, Credit, Total, Closing -->

<script lang="ts">
  export let balanceOpen: string = '0.00';
  export let atfDebit: string = '0.00';
  export let atfCredit: string = '0.00';
  export let atf: string = '0.00';
  export let balance: string = '0.00';

  /**
   * Determines if a value is negative
   */
  function isNegative(value: string): boolean {
    const num = parseFloat(value);
    return !isNaN(num) && num < 0;
  }
</script>

<div class="balance-fields-container">
  <div class="summary-field">
    <div class="summary-label">Opening-Balance</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(balanceOpen)}
      value={balanceOpen}
      readonly
    />
  </div>

  <div class="summary-field">
    <div class="summary-label">Debit-Balance</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(atfDebit)}
      value={atfDebit}
      readonly
    />
  </div>

  <div class="summary-field">
    <div class="summary-label">Credit-Balance</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(atfCredit)}
      value={atfCredit}
      readonly
    />
  </div>

  <div class="summary-field">
    <div class="summary-label">Total-Balance</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(atf)}
      value={atf}
      readonly
    />
  </div>

  <div class="summary-field">
    <div class="summary-label">Closing-Balance</div>
    <input
      type="text"
      class="summary-input"
      class:negative={isNegative(balance)}
      value={balance}
      readonly
    />
  </div>
</div>

<style>
  .balance-fields-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-top: -130px;
    margin-left: 745px;
  }

  .summary-field {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
  }

  .summary-field:first-child {
    margin-left: 0px;
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
