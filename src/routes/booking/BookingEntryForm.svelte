<!-- BookingEntryForm.svelte -->
<!-- Booking Entry Form - appears below Primanota table -->
<!-- Measurements from Mess-Tabelle.md: INPUT FORM (BOTTOM SECTION) -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

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

  // Account info (mock data for now - will come from API)
  $: contraAccountInfo = contraAccount ? {
    number: contraAccount,
    name: 'Cash in transit',
    saldo: '+775.20',
    currency: 'EUR',
    type: 'S'
  } : null;

  $: accountInfo = account ? {
    number: account,
    name: 'Bank 1',
    saldo: '+829.35',
    currency: 'EUR',
    type: 'S'
  } : null;

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
    <div class="field-group" style="left: 134px;">
      <label class="field-label" for="input-sh">SH</label>
      <input id="input-sh" type="text" readonly value={sh} class="field-input field-readonly" style="width: 35px; text-align: center;" />
    </div>

    <!-- Contra Account -->
    <div class="field-group" style="left: 198px;">
      <label class="field-label" for="input-contra-account">Contra Account</label>
      <input id="input-contra-account" type="text" bind:value={contraAccount} class="field-input" style="width: 100px; text-align: center;" />
    </div>

    <!-- Reference -->
    <div class="field-group" style="left: 310px;">
      <label class="field-label" for="input-reference">Reference</label>
      <input id="input-reference" type="text" bind:value={reference} class="field-input" style="width: 150px; text-align: left;" />
    </div>

    <!-- Date -->
    <div class="field-group" style="left: 472px;">
      <label class="field-label" for="input-date">Date</label>
      <input id="input-date" type="text" bind:value={date} placeholder="tt.mm.jjjj" class="field-input" style="width: 120px; text-align: center;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Account -->
    <div class="field-group" style="left: 604px;">
      <label class="field-label" for="input-account">Account</label>
      <input id="input-account" type="text" readonly value={account} class="field-input field-readonly-gray" style="width: 100px; text-align: center;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Tax -->
    <div class="field-group" style="left: 716px;">
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
    <div class="field-group" style="left: 800px;">
      <label class="field-label" for="input-due-date">Due Date</label>
      <input id="input-due-date" type="text" bind:value={dueDate} placeholder="tt.mm.jjjj" class="field-input" style="width: 120px; text-align: center;" />
    </div>

    <!-- Disc. -->
    <div class="field-group" style="left: 930px;">
      <label class="field-label" for="input-disc">Disc.</label>
      <input id="input-disc" type="text" bind:value={disc} class="field-input" style="width: 60px; text-align: right;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" />
        Keep
      </label>
    </div>

    <!-- Description -->
    <div class="field-group" style="left: 1002px;">
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
      <span class="info-value">{contraAccountInfo.number} {contraAccountInfo.name}</span>
      <span class="saldo-label">Saldo: {contraAccountInfo.currency}</span>
      <span class="saldo-amount">{contraAccountInfo.saldo} {contraAccountInfo.type}</span>
    </div>
  {/if}

  {#if accountInfo}
    <div class="account-info-row">
      <span class="info-label">Account:</span>
      <span class="info-value">{accountInfo.number} {accountInfo.name}</span>
      <span class="saldo-label">Saldo: {accountInfo.currency}</span>
      <span class="saldo-amount" class:negative={accountInfo.saldo.startsWith('-')}>
        {accountInfo.saldo} {accountInfo.type}
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
    top: 12px;
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
    width: 43.27px;
    background-color: rgb(76, 175, 80);
  }

  .btn-ok:hover {
    filter: brightness(0.95);
  }

  .btn-cancel {
    width: 65.5px;
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
    width: 1578px;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 14px;
  }

  .account-info-row {
    display: flex;
    align-items: center;
    height: 25px;
    margin-bottom: 5px;
  }

  .info-label {
    font-weight: 600;
    color: rgb(51, 51, 51);
    width: 200px;
  }

  .info-value {
    font-weight: 400;
    color: rgb(85, 85, 85);
    flex: 1;
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
