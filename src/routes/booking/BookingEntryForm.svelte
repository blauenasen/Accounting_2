<!-- BookingEntryForm.svelte -->
<!-- Booking Entry Form - appears below Primanota table -->
<!-- Measurements from Mess-Tabelle.md: INPUT FORM (BOTTOM SECTION) -->

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { bookingStore } from '$lib/stores/bookingStore';
  import { formatCurrencyDisplay, parseInputToNumber, unformatCurrency } from '$lib/utils/numberFormat';
  import { formatDateUS, parseUSDateToISO } from '$lib/utils/dateFormat';
  import { formatPercent } from '$lib/logic/primanota/formatting';
  import AccountSelectionDialog from '$lib/components/booking/dialogs/AccountSelectionDialog.svelte';

  const dispatch = createEventDispatcher();

  // Props for selected journal entry
  export let selectedEntry: any = null;
  // Props for selected book circle (null when no selection)
  export let selectedBookCircle: { idcode: string; no: number; textcode: string } | null = null;

  // Form fields - Storage variables with default values
  let gu = '';
  let turnover = 0;
  let sh = 'S';
  let contraAccount = '';
  let reference = '';
  let date = '';
  let account = '';
  let tax = '';
  let dueDate = '';
  let disc = '';
  let description = '';

  // Dialog state
  let dialogVisible = false;
  let dialogField = ''; // 'CK' or 'HK'
  let dialogAccounts: any[] = [];
  let dialogFilter = '';

  // Tax handling
  let accountTaxgroup: string | number | null = null; // Taxgroup from selected account
  let isTaxReadonly = false; // Whether tax field should be readonly
  let showTaxDropdown = true; // Whether to show dropdown or input
  let availableTaxRates: (string | number)[] = []; // Available tax rates when taxgroup = "?"

  // Keep flags for form fields
  // Keep flags: Purely local state (not synced with store)
  // User can check/uncheck these during data entry
  // On OK click, values are saved to store for next clear operation
  let keepContraAccount = false;
  let keepDate = false;
  let keepAccount = false;
  let keepTax = false;
  let keepDescription = false;

  // Display variables (normal let, NO $:)
  let turnoverDisplay = '';
  let dateDisplay = '';
  let dueDateDisplay = '';

  // Reactive: Compute whether fields should be disabled (turnover must be > 0)
  $: turnoverValue = parseInputToNumber(turnoverDisplay);
  $: isFieldsDisabled = !selectedBookCircle || (turnover === 0 && turnoverValue === 0);

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
    dueDate = entry.Fälligkeit || '';
    disc = 'SK';
    description = entry.Buchungstext || '';

    // Initialize Tax field based on loaded value
    if (entry.Steuer === '?') {
      // User must choose from dropdown
      showTaxDropdown = true;
      isTaxReadonly = false;
      loadAvailableTaxRates();
    } else if (entry.Steuer) {
      // Fixed tax value from DB → readonly
      showTaxDropdown = false;
      isTaxReadonly = true;
      availableTaxRates = [];
    }

    // Update Display-Variablen
    turnoverDisplay = formatCurrencyDisplay(turnover);
    dateDisplay = formatDateUS(date);
    dueDateDisplay = formatDateUS(dueDate);
  }

  // Load data when selectedEntry changes (ONLY reactive statement!)
  $: if (selectedEntry) {
    loadEntryToForm(selectedEntry);
  }

  // Paydate from stammdaten for due date calculation
  let paydate = 7; // Default fallback

  // Reactive: Calculate due date from date + paydate
  $: if (date && paydate) {
    const base = new Date(date);
    if (!isNaN(base.getTime())) {
      const due = new Date(base);
      due.setDate(due.getDate() + paydate);
      const dueStr = due.toISOString().split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(dueStr)) {
        dueDate = dueStr;
        dueDateDisplay = formatDateUS(dueStr);
      }
    } else {
      dueDate = '';
      dueDateDisplay = '';
    }
  } else {
    dueDate = '';
    dueDateDisplay = '';
  }

  // Check if HK should be readonly (only one account allowed for BC)
  let isAccountReadonly = false;
  let allowedAccountsForHK: any[] = [];

  // Track previous Book Circle to detect changes
  let previousBookCircle: typeof selectedBookCircle = null;

  // Handle Book Circle changes: clear fields and load allowed accounts
  $: handleBookCircleChange(selectedBookCircle);

  async function handleBookCircleChange(bc: typeof selectedBookCircle) {
    // Check if Book Circle actually changed
    const bcChanged = previousBookCircle?.no !== bc?.no;

    if (bcChanged && previousBookCircle !== null) {
      // Clear all fields when BC changes (but not on initial load)
      console.log('BC changed from', previousBookCircle?.no, 'to', bc?.no, '- clearing fields');
      clearFormFields();
      // Reset selectedEntry when BC changes
      dispatch('cancel');
    }

    // Update previous BC
    previousBookCircle = bc;

    // Load allowed accounts for new BC
    await loadAllowedAccountsForHK(bc);
  }

  function clearFormFields() {
    console.log('clearFormFields() called - applying keep-flag logic');

    // Clear fields respecting keep flags from store
    const keepFlags = $bookingStore.keepFlags || {};
    const keepValues = $bookingStore.keepValues || {};

    // GU and Turnover always reset
    gu = '';
    turnover = 0;
    turnoverDisplay = '';
    sh = 'S';

    // Contra Account - respect keep flag
    contraAccount = keepFlags.contraAccount ? (keepValues.contraAccount || '') : '';

    // Reference always resets
    reference = '';

    // Date - respect keep flag
    date = keepFlags.date ? (keepValues.date || '') : '';
    dateDisplay = keepFlags.date ? (keepValues.date || '') : '';

    // Account - respect keep flag
    account = keepFlags.account ? (keepValues.account || '') : '';

    // Tax - respect keep flag
    tax = keepFlags.tax ? (keepValues.tax || '') : '';

    // Due Date always resets
    dueDate = '';
    dueDateDisplay = '';

    // Disc always resets
    disc = '';

    // Description - respect keep flag
    description = keepFlags.description ? (keepValues.description || '') : '';

    console.log('clearFormFields() completed - description is now:', description);
  }

  // Public API for parent component
  // Clears form and dispatches event to parent to reset selectedEntry
  export function clearForm() {
    clearFormFields();
    // Notify parent to reset selectedEntry
    dispatch('cancel');
  }

  async function loadAllowedAccountsForHK(bc: typeof selectedBookCircle) {
    if (!bc || !bc.no) {
      isAccountReadonly = false;
      allowedAccountsForHK = [];
      return;
    }

    try {
      const response = await fetch(`/api/booking/allowed-accounts?bookCircle=${bc.no}&side=HK`);
      const data = await response.json();

      console.log('Allowed HK accounts for BC', bc.no, ':', data.accounts?.length, 'accounts');
      console.log('Current account value:', account);

      if (data.ok && Array.isArray(data.accounts)) {
        allowedAccountsForHK = data.accounts;

        // If only one account allowed, set it and make field readonly
        // ONLY if account field is currently empty (was just cleared)
        if (data.accounts.length === 1 && !selectedEntry && account === '') {
          console.log('Setting HK to single allowed account:', data.accounts[0].account);
          account = String(data.accounts[0].account);
          isAccountReadonly = true;
        } else if (data.accounts.length === 1) {
          console.log('Single account but HK already has value, making readonly');
          isAccountReadonly = true;
        } else {
          console.log('Multiple accounts allowed, HK is editable');
          isAccountReadonly = false;
        }
      }
    } catch (error) {
      console.error('Failed to load allowed accounts for HK:', error);
      isAccountReadonly = false;
      allowedAccountsForHK = [];
    }
  }

  // Auto-calculate Due Date from Date (Date + paydate from stammdaten)
  let paymentDays = 30; // Default fallback

  async function loadPaymentDays() {
    try {
      const response = await fetch('/api/stammdaten');
      const data = await response.json();
      if (data && data.paydate !== undefined) {
        paymentDays = Number(data.paydate) || 30;
      }
    } catch (error) {
      console.error('Failed to load payment days:', error);
    }
  }

  // Calculate due date: Date + paymentDays
  $: if (date && !selectedEntry) {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      dateObj.setDate(dateObj.getDate() + paymentDays);
      dueDate = dateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }
  }

  // Account info - loaded dynamically from API
  let contraAccountInfo: any = null;
  let accountInfo: any = null;

  // Reactive loading - trigger when account numbers change
  $: loadContraAccountInfo(contraAccount);
  $: loadMainAccountInfo(account);

  /**
   * ANFORDERUNG 8: Global keyboard handler for special keys
   * Pos1 → Turnover, Ende → Description, * → Date
   */
  function handleGlobalKeyDown(event: KeyboardEvent): void {
    // Pos1 (Home) → Focus on Turnover
    if (event.key === 'Home') {
      event.preventDefault();
      const turnoverInput = document.getElementById('input-turnover') as HTMLInputElement;
      if (turnoverInput) {
        turnoverInput.focus();
        turnoverInput.select();
      }
      return;
    }

    // Ende (End) → Focus on Description
    if (event.key === 'End') {
      event.preventDefault();
      const descInput = document.getElementById('input-description') as HTMLInputElement;
      if (descInput) {
        descInput.focus();
        descInput.select();
      }
      return;
    }

    // * (Asterisk) → Focus on Date
    if (event.key === '*') {
      event.preventDefault();
      const dateInput = document.getElementById('input-date') as HTMLInputElement;
      if (dateInput) {
        dateInput.focus();
      }
      return;
    }
  }

  onMount(async () => {
    // Load paydate from stammdaten API
    try {
      const res = await fetch('/api/stammdaten');
      const data = await res.json();
      if (data && typeof data.paydate === 'number') {
        paydate = data.paydate;
        console.log('[BookingEntryForm] Loaded paydate from stammdaten:', paydate);
      }
    } catch (error) {
      console.error('[BookingEntryForm] Failed to load paydate:', error);
      // Keep default fallback value
    }

    await loadPaymentDays();

    // Add global keyboard listener
    window.addEventListener('keydown', handleGlobalKeyDown);
  });

  onDestroy(() => {
    // Remove global keyboard listener (only in browser)
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  });

  // Handle tax based on selected account's taxgroup
  $: handleTaxFromAccount(account);

  async function handleTaxFromAccount(accountNumber: string) {
    if (!accountNumber || selectedEntry) {
      // Reset to default state
      accountTaxgroup = null;
      showTaxDropdown = true;
      isTaxReadonly = false;
      availableTaxRates = [];
      return;
    }

    try {
      const response = await fetch(`/api/booking/account-taxgroup?account=${accountNumber}`);
      const data = await response.json();

      if (data.ok && data.taxgroup !== undefined) {
        accountTaxgroup = data.taxgroup;

        // Case 1: Taxgroup = "?" → User must choose from ALL available tax rates
        if (data.taxgroup === '?') {
          showTaxDropdown = true;
          isTaxReadonly = false;
          tax = '?'; // Keep "?" until user selects

          // Load all available tax rates from database
          await loadAvailableTaxRates();
        }
        // Case 2: Taxgroup has a specific value → Set tax to that value (readonly)
        else {
          showTaxDropdown = false;
          isTaxReadonly = true;
          tax = String(data.taxgroup);
          availableTaxRates = [];
        }
      }
    } catch (error) {
      console.error('Failed to load account taxgroup:', error);
    }
  }

  async function loadAvailableTaxRates() {
    try {
      const response = await fetch('/api/booking/taxgroups');
      const data = await response.json();
      if (data.ok) {
        // All tax rates from DB (excluding "?")
        availableTaxRates = data.taxgroups;
      }
    } catch (error) {
      console.error('Failed to load available tax rates:', error);
      availableTaxRates = [];
    }
  }

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
    // Save keep flags and values to store
    const keepFlags = {
      contraAccount: keepContraAccount,
      date: keepDate,
      account: keepAccount,
      tax: keepTax,
      description: keepDescription
    };

    const currentValues = {
      contraAccount,
      date,
      account,
      tax,
      description
    };

    bookingStore.saveKeepValues(currentValues, keepFlags);

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

    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-turnover');
      return;
    }
    if (event.shiftKey && (key === '+' || key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-turnover');
      return;
    }

    // Enter key: Set SH to "S" and move focus to Contra Account
    if (key === 'Enter') {
      event.preventDefault();

      // Apply formatting before checking value
      const target = event.target as HTMLInputElement;
      console.log('[TURNOVER DEBUG] Enter pressed, target.value:', target.value);
      turnover = parseInputToNumber(target.value);
      console.log('[TURNOVER DEBUG] After parseInputToNumber, turnover:', turnover);
      console.log('[TURNOVER DEBUG] Type of turnover:', typeof turnover);
      console.log('[TURNOVER DEBUG] turnover === 0:', turnover === 0);
      console.log('[TURNOVER DEBUG] turnover == 0:', turnover == 0);
      turnoverDisplay = formatCurrencyDisplay(turnover);

      // WICHTIG: Wenn Turnover = 0, dann KEINE Navigation!
      if (turnover === 0) {
        console.log('[TURNOVER DEBUG] Turnover is 0, staying in field');
        return; // Bleibe im Feld, keine Navigation
      }

      console.log('[TURNOVER DEBUG] Turnover is NOT 0, navigating to CK');
      sh = 'S';

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

      // Apply formatting before checking value
      const target = event.target as HTMLInputElement;
      turnover = parseInputToNumber(target.value);
      turnoverDisplay = formatCurrencyDisplay(turnover);

      // WICHTIG: Wenn Turnover = 0, dann KEINE Navigation!
      if (turnover === 0) {
        return; // Bleibe im Feld, keine Navigation
      }

      sh = 'H';

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
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-contra-account');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-contra-account');
      return;
    }

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
   * Handle Account (HK) double-click - always open dialog
   */
  async function handleAccountDblClick(): Promise<void> {
    await openAccountSelectionDialog('account');
  }

  /**
   * FEATURE 2: Enter in HK Navigation
   * Handle Account (HK) keydown - Enter moves to Tax or Description
   */
  async function handleAccountKeyDown(event: KeyboardEvent): Promise<void> {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-account');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-account');
      return;
    }

    // Handle Enter, Tab, and Space
    if (event.key === 'Enter' || event.key === 'Tab' || event.key === ' ') {
      event.preventDefault();

      const value = (event.target as HTMLInputElement).value?.trim() || '';

      // Empty field → open dialog
      if (!value || value === '') {
        await openAccountSelectionDialog('account');
        return;
      }

      // Non-numeric input → open dialog
      if (!/^\d+$/.test(value)) {
        await openAccountSelectionDialog('account', value);
        return;
      }

      // Validate account is allowed for this book circle
      const accountNum = Number.parseInt(value, 10);
      const isValid = await validateMainAccount(accountNum, selectedBookCircle?.no || null);

      if (!isValid) {
        // Invalid account → open dialog
        await openAccountSelectionDialog('account', value);
        return;
      }

      // Valid account → check if Tax is readonly/locked
      // If Tax is dropdown (showTaxDropdown=true) → focus Tax
      // If Tax is readonly (showTaxDropdown=false) → focus Description
      if (showTaxDropdown && !isTaxReadonly) {
        const taxInput = document.getElementById('input-tax') as HTMLInputElement;
        if (taxInput) {
          taxInput.focus();
        }
      } else {
        const descInput = document.getElementById('input-description') as HTMLInputElement;
        if (descInput) {
          descInput.focus();
        }
      }
    }

    // Handle letter input (non-numeric characters)
    if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
      await openAccountSelectionDialog('account', event.key);
    }
  }

  /**
   * FEATURE 5: Date-Segment-Markierung
   * Handle Date keydown - 3x Enter navigates mm → dd → yyyy → HK
   */
  let dateSegmentIndex = 0; // 0=month, 1=day, 2=year

  /**
   * Select date segment (mm, dd, or yyyy) in MM/DD/YYYY format
   */
  function selectDateSegment(index: number): void {
    const dateInput = document.getElementById('input-date') as HTMLInputElement;
    if (!dateInput) return;

    const value = dateInput.value; // "MM/DD/YYYY"
    if (!value) return;

    if (index === 0) {
      // Select MM (0-2)
      dateInput.setSelectionRange(0, 2);
    } else if (index === 1) {
      // Select DD (3-5)
      dateInput.setSelectionRange(3, 5);
    } else if (index === 2) {
      // Select YYYY (6-10)
      dateInput.setSelectionRange(6, 10);
    }
  }

  function handleDateKeyDown(event: KeyboardEvent): void {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-date');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-date');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      dateSegmentIndex++;

      // After 3 segments (mm, dd, yyyy) → move to HK
      if (dateSegmentIndex >= 3) {
        dateSegmentIndex = 0;
        const accountInput = document.getElementById('input-account') as HTMLInputElement;
        if (accountInput) {
          accountInput.focus();
        }
      } else {
        // Stay in date field and select next segment
        selectDateSegment(dateSegmentIndex);
      }
      return;
    }

    // Other keys (except Tab) reset segment index
    if (event.key !== 'Tab') {
      dateSegmentIndex = 0;
    }
  }

  function handleDateFocus(): void {
    dateSegmentIndex = 0;
    // Auto-select first segment (month) on focus
    setTimeout(() => selectDateSegment(0), 0);
  }

  function handleDateBlurReset(): void {
    dateSegmentIndex = 0;
  }

  /**
   * Handle Reference keydown - Enter moves to Date
   */
  function handleReferenceKeyDown(event: KeyboardEvent): void {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-reference');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-reference');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const dateInput = document.getElementById('input-date') as HTMLInputElement;
      if (dateInput) {
        dateInput.focus();
      }
    }
  }

  /**
   * Handle Due Date keydown - Enter moves to Disc
   */
  function handleDueDateKeyDown(event: KeyboardEvent): void {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-due-date');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-due-date');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const discInput = document.getElementById('input-disc') as HTMLInputElement;
      if (discInput) {
        discInput.focus();
      }
    }
  }

  /**
   * Handle Disc keydown - Enter moves to Description
   */
  function handleDiscKeyDown(event: KeyboardEvent): void {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-disc');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-disc');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const descInput = document.getElementById('input-description') as HTMLInputElement;
      if (descInput) {
        descInput.focus();
      }
    }
  }

  /**
   * Handle Description keydown - Enter does nothing (end of form)
   */
  function handleDescriptionKeyDown(event: KeyboardEvent): void {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-description');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-description');
      return;
    }

    // Enter in Description field does nothing (end of form)
  }

  /**
   * Handle Tax keydown - Enter moves to Due Date
   */
  function handleTaxKeyDown(event: KeyboardEvent): void {
    // Feature 6: Shift+Plus/Minus Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-tax');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-tax');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const dueInput = document.getElementById('input-due-date') as HTMLInputElement;
      if (dueInput) {
        dueInput.focus();
      }
    }
  }

  /**
   * FEATURE 6: Shift+Plus/Minus Navigation
   * Navigate forward/backward through form fields, skipping disabled/readonly
   */
  const fieldOrder = [
    'input-turnover',
    'input-contra-account',
    'input-reference',
    'input-date',
    'input-account',
    'input-tax',
    'input-due-date',
    'input-disc',
    'input-description'
  ];

  function navigateField(direction: 'forward' | 'backward', currentFieldId: string): void {
    const currentIndex = fieldOrder.indexOf(currentFieldId);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    const step = direction === 'forward' ? 1 : -1;

    // Try to find next non-disabled, non-readonly field
    for (let i = 0; i < fieldOrder.length; i++) {
      targetIndex = (targetIndex + step + fieldOrder.length) % fieldOrder.length;
      const targetField = document.getElementById(fieldOrder[targetIndex]) as HTMLInputElement | HTMLSelectElement;

      // Check disabled for all elements, readOnly only for input elements
      const isDisabled = targetField && targetField.disabled;
      const isReadOnly = targetField && 'readOnly' in targetField && (targetField as HTMLInputElement).readOnly;

      if (targetField && !isDisabled && !isReadOnly) {
        targetField.focus();
        if ('select' in targetField && typeof targetField.select === 'function') {
          targetField.select();
        }
        break;
      }
    }
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
   * Validate main account (HK) against book circle rules
   */
  async function validateMainAccount(
    account: number,
    bookCircle: number | null
  ): Promise<boolean> {
    if (!bookCircle) return false;

    try {
      const response = await fetch(
        `/api/booking/allowed-accounts?bookCircle=${bookCircle}&side=HK`
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
        autocomplete="off"
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
        disabled={isFieldsDisabled}
        autocomplete="off"
        class="field-input"
        style="width: 100px; text-align: center;" />
      <label class="keep-label">
        <input
          type="checkbox"
          class="keep-checkbox"
          bind:checked={keepContraAccount} />
        Keep
      </label>
    </div>

    <!-- Reference -->
    <div class="field-group" style="left: 285px;">
      <label class="field-label" for="input-reference">Reference</label>
      <input
        id="input-reference"
        type="text"
        bind:value={reference}
        on:keydown={handleReferenceKeyDown}
        disabled={isFieldsDisabled}
        autocomplete="off"
        class="field-input"
        style="width: 150px; text-align: left;" />
    </div>

    <!-- Date -->
    <div class="field-group" style="left: 439px;">
      <label class="field-label" for="input-date">Date</label>
      <input
        id="input-date"
        type="date"
        bind:value={date}
        on:keydown={handleDateKeyDown}
        on:focus={handleDateFocus}
        on:blur={handleDateBlurReset}
        disabled={isFieldsDisabled}
        autocomplete="off"
        class="field-input"
        style="width: 120px; text-align: center;" />
      <label class="keep-label">
        <input
          type="checkbox"
          class="keep-checkbox"
          bind:checked={keepDate} />
        Keep
      </label>
    </div>

    <!-- Account -->
    <div class="field-group" style="left: 563px;">
      <label class="field-label" for="input-account">Account</label>
      <input
        id="input-account"
        type="text"
        bind:value={account}
        on:keydown={handleAccountKeyDown}
        on:dblclick={handleAccountDblClick}
        disabled={isFieldsDisabled}
        readonly={isAccountReadonly}
        autocomplete="off"
        class="field-input"
        class:field-readonly-gray={isAccountReadonly}
        style="width: 100px; text-align: center;" />
      <label class="keep-label">
        <input
          type="checkbox"
          class="keep-checkbox"
          bind:checked={keepAccount} />
        Keep
      </label>
    </div>

    <!-- Tax -->
    <div class="field-group" style="left: 665px;">
      <label class="field-label" for="input-tax">Tax</label>
      {#if showTaxDropdown}
        <!-- Dropdown when taxgroup = "?" - User must choose -->
        <select
          id="input-tax"
          bind:value={tax}
          on:keydown={handleTaxKeyDown}
          disabled={isFieldsDisabled}
          class="field-select"
          style="width: 75px; text-align: center;">
          <option value="?" disabled selected hidden>Select tax rate</option>
          {#each availableTaxRates as taxRate}
            <option value={taxRate}>{formatPercent(taxRate)}</option>
          {/each}
        </select>
      {:else}
        <!-- Readonly input when taxgroup has specific value -->
        <input
          id="input-tax"
          type="text"
          value={formatPercent(tax)}
          on:keydown={handleTaxKeyDown}
          readonly
          disabled={isFieldsDisabled}
          class="field-input field-readonly-gray"
          style="width: 75px; text-align: center;" />
      {/if}
      <label class="keep-label">
        <input
          type="checkbox"
          class="keep-checkbox"
          bind:checked={keepTax} />
        Keep
      </label>
    </div>

    <!-- Due Date -->
    <div class="field-group" style="left: 744px;">
      <label class="field-label" for="input-due-date">Due Date</label>
      <input
        id="input-due-date"
        type="date"
        bind:value={dueDate}
        on:keydown={handleDueDateKeyDown}
        disabled={isFieldsDisabled}
        autocomplete="off"
        class="field-input"
        style="width: 120px; text-align: center;" />
    </div>

    <!-- Disc. -->
    <div class="field-group" style="left: 867px;">
      <label class="field-label" for="input-disc">Disc.</label>
      <input
        id="input-disc"
        type="text"
        bind:value={disc}
        on:keydown={handleDiscKeyDown}
        disabled={isFieldsDisabled}
        autocomplete="off"
        class="field-input"
        style="width: 60px; text-align: right;" />
    </div>

    <!-- Description -->
    <div class="field-group" style="left: 931px;">
      <label class="field-label" for="input-description">Description</label>
      <input
        id="input-description"
        type="text"
        bind:value={description}
        on:keydown={handleDescriptionKeyDown}
        disabled={isFieldsDisabled}
        autocomplete="off"
        class="field-input"
        style="width: 350px; text-align: left;" />
      <label class="keep-label">
        <input
          type="checkbox"
          class="keep-checkbox"
          bind:checked={keepDescription} />
        Keep
      </label>
    </div>
  </div>

  <!-- ACTION BUTTONS -->
  <div class="action-buttons">
    <button class="btn btn-ok" disabled={!selectedBookCircle || tax === '?'} on:click={handleOK}>OK</button>
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
    font-size: 12px;
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
