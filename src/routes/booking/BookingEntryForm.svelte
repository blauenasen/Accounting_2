<!-- BookingEntryForm.svelte -->
<!-- Booking Entry Form - appears below Primanota table -->
<!-- Measurements from Mess-Tabelle.md: INPUT FORM (BOTTOM SECTION) -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { bookingStore } from '$lib/stores/bookingStore';
  import { formatCurrencyDisplay, parseInputToNumber, unformatCurrency } from '$lib/utils/numberFormat';
  import { formatDateUS, parseUSDateToISO } from '$lib/utils/dateFormat';
  import AccountSelectionDialog from '$lib/components/booking/dialogs/AccountSelectionDialog.svelte';

  const dispatch = createEventDispatcher();

  // Props for selected journal entry
  export let selectedEntry: any = null;
  // Props for selected book circle (null when no selection)
  export let selectedBookCircle: { idcode: string; no: number; textcode: string } | null = null;

  // Form fields - Storage variables (normal let, NO $:)
  let gu = '';
  let turnover = 0;
  let sh = 'S';
  let contraAccount = '';
  let reference = '';
  let date = '';
  let account = '';
  let tax = '0.00%';
  let dueDate = '';
  let disc = '';
  let description = '';

  // Dialog state
  let dialogVisible = false;
  let dialogField = ''; // 'CK' or 'HK'
  let dialogAccounts: any[] = [];
  let dialogFilter = '';

  // Display variables (normal let, NO $:)
  let turnoverDisplay = '';
  let dateDisplay = '';
  let dueDateDisplay = '';

  // Function to load entry data into form (called ONLY on demand)
  function loadEntryToForm(entry: any) {
    if (!entry) return;

    gu = entry.GU || '';
    turnover = entry.UE || 0;
    sh = entry.SH || 'S';
    contraAccount = entry.GegKto || '';
    reference = entry.BelNr || '';
    date = entry.Datum || '';
    account = entry.Kto || '';
    tax = entry.Steuer || '0.00%';
    dueDate = '';
    disc = '';
    description = entry.Buchungstext || '';

    // Update Display-Variablen
    turnoverDisplay = formatCurrencyDisplay(turnover);
    dateDisplay = formatDateUS(date);
    dueDateDisplay = formatDateUS(dueDate);
  }

  // Load data when selectedEntry changes (ONLY reactive statement!)
  $: if (selectedEntry) {
    loadEntryToForm(selectedEntry);
  }

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

  // Turnover field event handlers
  function handleTurnoverFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    // Select all content when field gains focus
    target.select();
  }

  function handleTurnoverBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const input = target.value;

    // Parse input and update turnover
    turnover = parseInputToNumber(input);

    // Update display with formatted value
    turnoverDisplay = formatCurrencyDisplay(turnover);
  }

  function handleTurnoverKeyDown(event: KeyboardEvent) {
    const key = event.key;

    // Enter key: Set SH to "S" and move focus to Contra Account
    if (key === 'Enter') {
      event.preventDefault();
      sh = 'S';

      // Apply formatting before moving focus
      const target = event.target as HTMLInputElement;
      turnover = parseInputToNumber(target.value);
      turnoverDisplay = formatCurrencyDisplay(turnover);

      // Move focus to Contra Account
      const contraAccountInput = document.getElementById('input-contra-account') as HTMLInputElement;
      if (contraAccountInput) {
        contraAccountInput.focus();
      }
      return; // Exit function after handling
    }

    // Plus key: Set SH to "H" and move focus to Contra Account
    if (key === '+') {
      event.preventDefault();
      sh = 'H';

      // Apply formatting before moving focus
      const target = event.target as HTMLInputElement;
      turnover = parseInputToNumber(target.value);
      turnoverDisplay = formatCurrencyDisplay(turnover);

      // Move focus to Contra Account
      const contraAccountInput = document.getElementById('input-contra-account') as HTMLInputElement;
      if (contraAccountInput) {
        contraAccountInput.focus();
      }
      return; // Exit function after handling
    }

    // Minus key: Allow input for negative numbers but DON'T change SH
    // IMPORTANT: SH must remain unchanged when user types minus
    if (key === '-') {
      // Allow normal input behavior (don't preventDefault)
      // SH stays unchanged (either 'S' or 'H' depending on previous state)
      return; // Exit without modifying SH
    }

    // All other keys: Normal input behavior, SH remains unchanged
  }

  // Date field event handlers
  function handleDateBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const input = target.value;

    // Parse US format input and convert to ISO for storage
    date = parseUSDateToISO(input);

    // Update display with formatted value
    dateDisplay = formatDateUS(date);
  }

  function handleDueDateBlur(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const input = target.value;

    // Parse US format input and convert to ISO for storage
    dueDate = parseUSDateToISO(input);

    // Update display with formatted value
    dueDateDisplay = formatDateUS(dueDate);
  }

  /**
   * Handle Contra Account keydown with validation
   */
  async function handleContraKeyDown(event: KeyboardEvent): Promise<void> {
    // Handle Enter, Tab, and Space
    if (event.key === 'Enter' || event.key === 'Tab' || event.key === ' ') {
      event.preventDefault();

      // Use event.target.value instead of bound variable (more reliable)
      const value = (event.target as HTMLInputElement).value?.trim() || '';

      // Empty field → open dialog
      if (!value || value === '') {
        await openAccountSelectionDialog('contra');
        return;
      }

      // Non-numeric input → open dialog
      if (!/^\d+$/.test(value)) {
        await openAccountSelectionDialog('contra', value);
        return;
      }

      // Validate account is allowed for this book circle
      const accountNum = Number.parseInt(value, 10);
      const isValid = await validateContraAccount(accountNum, selectedBookCircle?.no || null);

      if (!isValid) {
        // Invalid account → open dialog
        await openAccountSelectionDialog('contra', value);
        return;
      }

      // Valid account → move to next field (Reference)
      const referenceInput = document.getElementById('input-reference') as HTMLInputElement;
      if (referenceInput) {
        referenceInput.focus();
      }
    }

    // Handle letter input (non-numeric characters)
    if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
      await openAccountSelectionDialog('contra', event.key);
    }
  }

  /**
   * Handle Contra Account blur - open dialog if empty
   */
  async function handleContraBlur(event: FocusEvent): Promise<void> {
    const value = (event.target as HTMLInputElement).value?.trim() || '';

    // Only open dialog if field is empty
    if (!value || value === '') {
      await openAccountSelectionDialog('contra');
    }
  }

  /**
   * Handle Contra Account double-click - always open dialog
   */
  async function handleContraDblClick(): Promise<void> {
    await openAccountSelectionDialog('contra');
  }

  /**
   * Validate contra account against book circle rules
   */
  async function validateContraAccount(
    account: number,
    bookCircle: number | null
  ): Promise<boolean> {
    if (!bookCircle) return false;

    try {
      const response = await fetch(
        `/api/booking/allowed-accounts?bookCircle=${bookCircle}&side=CK`
      );
      const data = await response.json();

      if (!data.ok) return false;

      // Check if account exists in allowed accounts
      return data.accounts.some((acc: any) => acc.account === account);
    } catch {
      return false;
    }
  }

  /**
   * Open account selection dialog
   */
  async function openAccountSelectionDialog(field: 'contra' | 'account', initialFilter = ''): Promise<void> {
    if (!selectedBookCircle || !selectedBookCircle.no) {
      return;
    }

    // Convert field: 'contra' → 'CK', 'account' → 'HK'
    const side = field === 'contra' ? 'CK' : 'HK';

    try {
      const url = `/api/booking/allowed-accounts?bookCircle=${selectedBookCircle.no}&side=${side}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.ok && Array.isArray(data.accounts)) {
        dialogAccounts = data.accounts;
        dialogField = side;
        dialogFilter = initialFilter;
        dialogVisible = true;
      }
    } catch (error) {
      console.error('Failed to load accounts for dialog:', error);
    }
  }

  /**
   * Handle dialog close
   */
  function handleDialogClose(): void {
    dialogVisible = false;
    dialogAccounts = [];
    dialogField = '';
    dialogFilter = '';
  }

  /**
   * Handle dialog select
   */
  function handleDialogSelect(event: CustomEvent): void {
    const { account: selectedAccount, field } = event.detail;

    if (field === 'CK') {
      contraAccount = String(selectedAccount.account || '');
    } else if (field === 'HK') {
      account = String(selectedAccount.account || '');
    }

    handleDialogClose();

    // Set focus to next field after selection
    setTimeout(() => {
      if (field === 'CK') {
        const referenceInput = document.getElementById('input-reference') as HTMLInputElement;
        referenceInput?.focus();
        referenceInput?.select();
      }
    }, 100);
  }
</script>

<div class="booking-form-container">
  <!-- FORM FIELDS -->
  <div class="form-fields">
    <!-- GU -->
    <div class="field-group" style="left: 10px;">
      <label class="field-label" for="input-gu">GU</label>
      <input id="input-gu" type="text" readonly value={gu} tabindex="-1" class="field-input field-readonly" style="width: 37px; text-align: center;" />
    </div>

    <!-- Turnover (highlighted with red border) -->
    <div class="field-group" style="left: 50px;">
      <label class="field-label" for="input-turnover">Turnover</label>
      <input
        id="input-turnover"
        type="text"
        bind:value={turnoverDisplay}
        disabled={!selectedBookCircle}
        on:focus={handleTurnoverFocus}
        on:blur={handleTurnoverBlur}
        on:keydown={handleTurnoverKeyDown}
        class="field-input field-turnover"
        style="width: 90px; text-align: right;" />
    </div>

    <!-- SH -->
    <div class="field-group" style="left: 143px;">
      <label class="field-label" for="input-sh">SH</label>
      <input
        id="input-sh"
        type="text"
        readonly
        bind:value={sh}
        tabindex="-1"
        class="field-input field-readonly"
        class:sh-haben={sh === 'H'}
        style="width: 35px; text-align: center;" />
    </div>

    <!-- Contra Account -->
    <div class="field-group" style="left: 182px;">
      <label class="field-label" for="input-contra-account">Contra Account</label>
      <input
        id="input-contra-account"
        type="text"
        bind:value={contraAccount}
        on:keydown={handleContraKeyDown}
        on:blur={handleContraBlur}
        on:dblclick={handleContraDblClick}
        disabled={!selectedBookCircle}
        autocomplete="off"
        class="field-input"
        style="width: 100px; text-align: center;" />
    </div>

    <!-- Reference -->
    <div class="field-group" style="left: 285px;">
      <label class="field-label" for="input-reference">Reference</label>
      <input id="input-reference" type="text" bind:value={reference} disabled={!selectedBookCircle} class="field-input" style="width: 150px; text-align: left;" />
    </div>

    <!-- Date -->
    <div class="field-group" style="left: 439px;">
      <label class="field-label" for="input-date">Date</label>
      <input
        id="input-date"
        type="text"
        bind:value={dateDisplay}
        disabled={!selectedBookCircle}
        on:blur={handleDateBlur}
        placeholder="mm-dd-yyyy"
        class="field-input"
        style="width: 120px; text-align: center;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" disabled={!selectedBookCircle} />
        Keep
      </label>
    </div>

    <!-- Account -->
    <div class="field-group" style="left: 563px;">
      <label class="field-label" for="input-account">Account</label>
      <input id="input-account" type="text" readonly value={account} class="field-input field-readonly-gray" style="width: 100px; text-align: center;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" disabled={!selectedBookCircle} />
        Keep
      </label>
    </div>

    <!-- Tax -->
    <div class="field-group" style="left: 665px;">
      <label class="field-label" for="input-tax">Tax</label>
      <select id="input-tax" bind:value={tax} disabled={!selectedBookCircle} class="field-select" style="width: 75px; text-align: center;">
        <option value="0.00%">0.00%</option>
        <option value="0.05">0.05</option>
        <option value="0.07">0.07</option>
        <option value="0.10">0.10</option>
      </select>
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" disabled={!selectedBookCircle} />
        Keep
      </label>
    </div>

    <!-- Due Date -->
    <div class="field-group" style="left: 744px;">
      <label class="field-label" for="input-due-date">Due Date</label>
      <input
        id="input-due-date"
        type="text"
        bind:value={dueDateDisplay}
        disabled={!selectedBookCircle}
        on:blur={handleDueDateBlur}
        placeholder="mm-dd-yyyy"
        class="field-input"
        style="width: 120px; text-align: center;" />
    </div>

    <!-- Disc. -->
    <div class="field-group" style="left: 867px;">
      <label class="field-label" for="input-disc">Disc.</label>
      <input id="input-disc" type="text" bind:value={disc} disabled={!selectedBookCircle} class="field-input" style="width: 60px; text-align: right;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" disabled={!selectedBookCircle} />
        Keep
      </label>
    </div>

    <!-- Description -->
    <div class="field-group" style="left: 931px;">
      <label class="field-label" for="input-description">Description</label>
      <input id="input-description" type="text" bind:value={description} disabled={!selectedBookCircle} class="field-input" style="width: 350px; text-align: left;" />
      <label class="keep-label">
        <input type="checkbox" class="keep-checkbox" disabled={!selectedBookCircle} />
        Keep
      </label>
    </div>
  </div>

  <!-- ACTION BUTTONS -->
  <div class="action-buttons">
    <button class="btn btn-ok" disabled={!selectedBookCircle} on:click={handleOK}>OK</button>
    <button class="btn btn-cancel" disabled={!selectedBookCircle} on:click={handleCancel}>Cancel</button>
    <button class="btn btn-pdf" disabled={!selectedBookCircle} on:click={handleAddPDF}>+PDF</button>
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

<!-- Account Selection Dialog -->
{#if dialogVisible}
  <AccountSelectionDialog
    visible={dialogVisible}
    field={dialogField}
    bookCircle={selectedBookCircle?.no}
    accounts={dialogAccounts}
    initialFilter={dialogFilter}
    on:close={handleDialogClose}
    on:select={handleDialogSelect}
  />
{/if}

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

  /* Disabled fields - gray background */
  .field-input:disabled,
  .field-select:disabled {
    background-color: rgb(240, 240, 240);
    color: rgb(120, 120, 120);
    cursor: not-allowed;
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

  /* SH field: Red text when value is "H" (Haben) */
  .sh-haben {
    color: rgb(220, 38, 38) !important;
    font-weight: 700;
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

  /* Disabled buttons */
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(50%);
  }

  .btn:disabled:hover {
    filter: grayscale(50%);
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
