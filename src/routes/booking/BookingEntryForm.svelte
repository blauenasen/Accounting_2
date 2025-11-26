<!-- BookingEntryForm.svelte -->
<!-- Booking Entry Form - appears below Primanota table -->
<!-- Measurements from Mess-Tabelle.md: INPUT FORM (BOTTOM SECTION) -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { bookingStore } from '$lib/stores/bookingStore';

  const dispatch = createEventDispatcher();

  // Props for selected journal entry
  export let selectedEntry: any = null;

  // Form fields (reactive based on selectedEntry)
  $: gu = selectedEntry?.GU || '';
  $: turnover = selectedEntry?.UE || 0;
  $: sh = selectedEntry?.SH || 'S';
  $: contraAccount = selectedEntry?.GegKto || '';
  $: reference = selectedEntry?.BelNr || '';
  $: date = selectedEntry?.Datum || '';
  $: account = selectedEntry?.Kto || '';
  $: tax = selectedEntry?.Steuer || '0.00%';
  $: dueDate = '';
  $: disc = '';
  $: description = selectedEntry?.Buchungstext || '';

  // Account info - loaded dynamically from API
  let contraAccountInfo: any = null;
  let accountInfo: any = null;

  // Reactive loading - trigger when account numbers change
  $: loadContraAccountInfo(contraAccount);
  $: loadMainAccountInfo(account);

  // Load contra account details
  async function loadContraAccountInfo(accNum: any) {
    if (!accNum) {
      contraAccountInfo = null;
      return;
    }
    const details = await loadAccountDetails(accNum);
    if (details) {
      const currency = details.currency || '$';
      const balance = await calculateBalance(accNum, $bookingStore.selectedYear, $bookingStore.selectedMonth);
      const saldo = formatCurrency(balance, currency);
      contraAccountInfo = {
        number: accNum,
        name: details.designation,
        saldo: saldo
      };
    }
  }

  // Load main account details
  async function loadMainAccountInfo(accNum: any) {
    if (!accNum) {
      accountInfo = null;
      return;
    }
    const details = await loadAccountDetails(accNum);
    if (details) {
      const currency = details.currency || '$';
      const balance = await calculateBalance(accNum, $bookingStore.selectedYear, $bookingStore.selectedMonth);
      const saldo = formatCurrency(balance, currency);
      accountInfo = {
        number: accNum,
        name: details.designation,
        saldo: saldo
      };
    }
  }

  // Fetch account details from API
  async function loadAccountDetails(accountNumber: number | string) {
    try {
      const response = await fetch(`/api/booking/account-details?account=${accountNumber}`);
      const data = await response.json();
      if (data.ok) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load account details:', error);
      return null;
    }
  }

  // Format currency with +/- prefix and currency symbol
  function formatCurrency(value: number, currency: string = '$'): string {
    const num = Number(value);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(num));
    const sign = num < 0 ? '-' : '+';
    return `${sign}${formatted} ${currency}`;
  }

  // Calculate balance using Original's formula
  async function calculateBalance(accountNumber: number | string, year: number, month: number | 'All'): Promise<number> {
    try {
      // Get opening balance
      const resOpen = await fetch(`/api/booking/balance-open?account=${accountNumber}&year=${year}`);
      const dataOpen = await resOpen.json();
      const openBalance = Number(dataOpen.balanceOpen) || 0;

      // Get totals for period
      const resTotals = await fetch(`/api/booking/account-totals?account=${accountNumber}&year=${year}&month=${month}`);
      const dataTotals = await resTotals.json();

      const totalDebit = Number(dataTotals.totalDebit) || 0;
      const totalCredit = Number(dataTotals.totalCredit) || 0;
      const nettoTotal = totalDebit + totalCredit;
      const closingBalance = openBalance + nettoTotal;

      return closingBalance;
    } catch (error) {
      console.error('Failed to calculate balance:', error);
      return 0;
    }
  }

  function handleOK() {
    dispatch('save', {
      gu, turnover, sh, contraAccount, reference, date,
      account, tax, dueDate, disc, description
    });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleAddPDF() {
    dispatch('addpdf');
  }
</script>

<div class="booking-form-container">
  <!-- FORM FIELDS -->
  <div class="form-fields">
    <!-- GU -->
    <div class="field-group" style="left: 10px;">
      <label class="field-label" for="input-gu">GU</label>
      <input id="input-gu" type="text" readonly value={gu} class="field-input field-readonly" style="width: 37px; text-align: center;" />
    </div>

    <!-- Turnover (highlighted with red border) -->
    <div class="field-group" style="left: 50px;">
      <label class="field-label" for="input-turnover">Turnover</label>
      <input id="input-turnover" type="number" step="0.01" bind:value={turnover} class="field-input field-turnover" style="width: 90px; text-align: right;" />
    </div>

    <!-- SH -->
    <div class="field-group" style="left: 143px;">
      <label class="field-label" for="input-sh">SH</label>
      <input id="input-sh" type="text" readonly value={sh} class="field-input field-readonly" style="width: 35px; text-align: center;" />
    </div>

    <!-- Contra Account -->
    <div class="field-group" style="left: 182px;">
      <label class="field-label" for="input-contra-account">Contra Account</label>
      <input id="input-contra-account" type="text" bind:value={contraAccount} class="field-input" style="width: 100px; text-align: center;" />
    </div>

    <!-- Reference -->
    <div class="field-group" style="left: 285px;">
      <label class="field-label" for="input-reference">Reference</label>
      <input id="input-reference" type="text" bind:value={reference} class="field-input" style="width: 150px; text-align: left;" />
    </div>

    <!-- Date -->
    <div class="field-group" style="left: 439px;">
      <label class="field-label" for="input-date">Date</label>
      <input id="input-date" type="text" bind:value={date} placeholder="tt.mm.jjjj" class="field-input" style="width: 120px; text-align: center;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Account -->
    <div class="field-group" style="left: 563px;">
      <label class="field-label" for="input-account">Account</label>
      <input id="input-account" type="text" readonly value={account} class="field-input field-readonly-gray" style="width: 100px; text-align: center;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Tax -->
    <div class="field-group" style="left: 665px;">
      <label class="field-label" for="input-tax">Tax</label>
      <select id="input-tax" bind:value={tax} class="field-select" style="width: 75px; text-align: center;">
        <option value="0.00%">0.00%</option>
        <option value="0.05">0.05</option>
        <option value="0.07">0.07</option>
        <option value="0.10">0.10</option>
      </select>
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Due Date -->
    <div class="field-group" style="left: 744px;">
      <label class="field-label" for="input-due-date">Due Date</label>
      <input id="input-due-date" type="text" bind:value={dueDate} placeholder="tt.mm.jjjj" class="field-input" style="width: 120px; text-align: center;" />
    </div>

    <!-- Disc. -->
    <div class="field-group" style="left: 867px;">
      <label class="field-label" for="input-disc">Disc.</label>
      <input id="input-disc" type="text" bind:value={disc} class="field-input" style="width: 60px; text-align: right;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Description -->
    <div class="field-group" style="left: 931px;">
      <label class="field-label" for="input-description">Description</label>
      <input id="input-description" type="text" bind:value={description} class="field-input" style="width: 350px; text-align: left;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>
  </div>

  <!-- ACTION BUTTONS -->
  <div class="action-buttons">
    <button class="btn btn-ok" on:click={handleOK}>OK</button>
    <button class="btn btn-cancel" on:click={handleCancel}>Cancel</button>
    <button class="btn btn-pdf" on:click={handleAddPDF}>+PDF</button>
  </div>
</div>

<!-- ACCOUNT INFO SECTION -->
<div class="account-info-container">
  {#if contraAccountInfo}
    <div class="account-info-row">
      <span class="info-label">Contra Account:</span>
      <span class="info-number">{contraAccountInfo.number}</span>
      <span class="info-name">{contraAccountInfo.name}</span>
      <span class="saldo-label">Saldo:</span>
      <span class="saldo-amount" class:negative={contraAccountInfo.saldo.startsWith('-')}>
        {contraAccountInfo.saldo}
      </span>
    </div>
  {/if}

  {#if accountInfo}
    <div class="account-info-row">
      <span class="info-label">Account:</span>
      <span class="info-number">{accountInfo.number}</span>
      <span class="info-name">{accountInfo.name}</span>
      <span class="saldo-label">Saldo:</span>
      <span class="saldo-amount" class:negative={accountInfo.saldo.startsWith('-')}>
        {accountInfo.saldo}
      </span>
    </div>
  {/if}
</div>

<style>
  /* ==================================================================
     BOOKING FORM CONTAINER - Mess-Tabelle.md: INPUT FORM
     ================================================================== */

  .booking-form-container {
    position: absolute;
    left: 0px;
    top: 940px; /* Below table (253px + 600px max-height + margin) */
    width: 1650px;
    height: 80px;
  }

  /* ==================================================================
     FORM FIELDS - Mess-Tabelle.md: Form Labels & Input Fields
     ================================================================== */

  .form-fields {
    position: relative;
    width: 100%;
    height: 60px;
  }

  .field-group {
    position: absolute;
    top: 0px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .field-label {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: rgb(152, 148, 147);
    margin-bottom: 2px;
  }

  .field-input,
  .field-select {
    height: 28px;
    border: 1px inset rgb(118, 118, 118);
    background-color: rgb(255, 255, 255);
    font-family: Arial;
    font-size: 14.4px;
    padding: 4px 6px;
    box-sizing: border-box;
  }

  /* ==================================================================
     REMOVE NUMBER INPUT SPINNERS
     ================================================================== */

  /* Chrome, Safari, Edge, Opera */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Turnover field - special styling (red border, yellow background) */
  .field-turnover {
    border-color: rgb(255, 0, 0) !important;
    background-color: rgb(255, 243, 205) !important;
  }

  /* Readonly fields */
  .field-readonly {
    background-color: rgb(249, 250, 251);
  }

  .field-readonly-gray {
    background-color: rgb(243, 244, 246);
  }

  /* Select styling */
  .field-select {
    border: 1px solid rgb(118, 118, 118);
  }

  /* Keep checkbox labels */
  .keep-label {
    font-size: 10px;
    color: rgb(85, 85, 85);
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .keep-checkbox {
    width: 12px;
    height: 12px;
    margin: 0;
  }

  /* ==================================================================
     ACTION BUTTONS - Mess-Tabelle.md: ACTION BUTTONS (BOTTOM RIGHT)
     ================================================================== */

  .action-buttons {
    position: absolute;
    top: 16px;
    right: 108px;
    display: flex;
    gap: 13.5px;
  }

  .btn {
    height: 28px;
    border: 0px none;
    border-radius: 4px;
    font-family: Arial;
    font-size: 13.33px;
    color: rgb(255, 255, 255);
    padding: 6px 12px;
    cursor: pointer;
    box-sizing: border-box;
  }

  .btn-ok {
    width: 70px;
    background-color: rgb(76, 175, 80);
  }

  .btn-ok:hover {
    filter: brightness(0.95);
  }

  .btn-cancel {
    width: 70px;
    background-color: rgb(244, 67, 54);
  }

  .btn-cancel:hover {
    filter: brightness(0.95);
  }

  .btn-pdf {
    width: 70px;
    background-color: rgb(33, 150, 243);
    padding: 6px 18px;
  }

  .btn-pdf:hover {
    filter: brightness(0.95);
  }

  /* ==================================================================
     ACCOUNT INFO SECTION - Mess-Tabelle.md: ACCOUNT INFO SECTION
     ================================================================== */

  .account-info-container {
    position: absolute;
    left: 10px;
    top: 1025px; /* Below form (880px + 80px + margin) */
    width: 900px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 14px;
    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    padding: 8px 10px;
    box-sizing: border-box;
    height: 68px
  }

  .account-info-row {
    display: flex;
    align-items: center;
    height: 25px;
    margin-bottom: 5px;
  }

  .account-info-row:first-child {
    border-bottom: 1px solid rgb(221, 221, 221);
    padding-bottom: 2px;
    margin-bottom: 2px;
  }

  .info-label {
    font-weight: 600;
    color: rgb(51, 51, 51);
    width: 140px;
  }

  .info-value {
    font-weight: 400;
    color: rgb(85, 85, 85);
    flex: 1;
  }

  /* Account Number - separate field for alignment */
  .info-number {
    font-weight: 600;
    color: rgb(51, 51, 51);
    display: flex;
    justify-content: flex-end;
    margin-left: 0px;
    width: 30px;
    padding-right: 5px;
    margin-right: 10px;
    box-sizing: border-box;
  }

  /* Account Name - separate field */
  .info-name {
    font-weight: 400;
    color: rgb(85, 85, 85);
    margin-left: 10px;
    width: 500px;
    margin-right: 20px;
  }

  .saldo-label {
    font-weight: 500;
    color: rgb(51, 51, 51);
    margin-right: 10px;
  }

  .saldo-amount {
    font-weight: 600;
    color: rgb(0, 0, 0);
    min-width: 100px;
    text-align: right;
  }

  .saldo-amount.negative {
    color: rgb(220, 38, 38);
  }
</style>
