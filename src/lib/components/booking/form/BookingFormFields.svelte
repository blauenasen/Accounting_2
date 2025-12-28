<!-- src/lib/components/booking/form/BookingFormFields.svelte -->
<script lang="ts">
  // Booking form input fields component
  import { createEventDispatcher } from 'svelte';
  import type { BookingFormData, BookingFormKeepFlags } from '$lib/types/ui.js';
  import Input from '$lib/components/shared/Input.svelte';
  import Dropdown from '$lib/components/shared/Dropdown.svelte';
  import Button from '$lib/components/shared/Button.svelte';

  const dispatch = createEventDispatcher();

  // Props
  export let formData: BookingFormData;
  export let keepFlags: BookingFormKeepFlags;
  export let formLocked: boolean = true;
  export let hasPdf: boolean = false;
  export let pdfUploading: boolean = false;
  export let selectedBookCircle: { no: number; textcode?: string } | null = null;
  export let currentMonth: string | null = null;
  export let currentYear: string | null = null;

  // Internal state
  let availableTaxgroups: string[] = [];
  let taxLocked = false;
  let lastAccountForTax: string | null = null;

  // Input refs for focus management
  let turnoverInput: HTMLInputElement;
  let contraInput: HTMLInputElement;
  let referenceInput: HTMLInputElement;
  let accountInput: HTMLInputElement;
  let taxInput: HTMLSelectElement;
  let dueInput: HTMLInputElement;
  let descInput: HTMLInputElement;

  /**
   * Public API: Fill form with data
   */
  export function fillForm(data: Partial<BookingFormData>): void {
    Object.assign(formData, data);
    formData = { ...formData };
  }

  /**
   * Public API: Set account number
   */
  export function setAccount(accountNumber: string): void {
    formData.account = accountNumber;
    formData = { ...formData };
  }

  /**
   * Public API: Set contra account number
   */
  export function setContraAccount(accountNumber: string): void {
    formData.contra = accountNumber;
    formData = { ...formData };
  }

  /**
   * Public API: Get current booking data
   */
  export function getCurrentBookingData(): BookingFormData {
    return formData;
  }

  /**
   * Public API: Reset form
   */
  export function resetForm(): void {
    const defaults: BookingFormData = {
      bookCircle: formData.bookCircle,
      gu: '',
      turnover: '0.00',
      sh: 'S',
      contra: keepFlags.contra ? formData.contra : '',
      reference: '',
      date: keepFlags.date ? formData.date : '',
      account: keepFlags.account ? formData.account : '',
      tax: keepFlags.tax ? formData.tax : '',
      due: '',
      disc: '0.00 %',
      desc: keepFlags.desc ? formData.desc : '',
      idNr: null,
      jahr: null,
      monat: null,
      tag: null,
      lfdNr: null,
      id_invoice: null,
      nettoGes: null,
      steuer: null,
      VStUSt: null,
      bu: null
    };
    Object.assign(formData, defaults);
    formData = { ...formData };
  }

  /**
   * Auto-calculate due date (7 days after date)
   */
  $: if (formData.date) {
    const base = new Date(formData.date);
    if (!Number.isNaN(base.getTime())) {
      const dueDate = new Date(base);
      dueDate.setDate(dueDate.getDate() + 7);
      formData.due = dueDate.toISOString().split('T')[0];
    } else {
      formData.due = '';
    }
  } else {
    formData.due = '';
  }

  /**
   * Normalize turnover on blur
   */
  function normalizeTurnover(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.trim();

    const hasDecimalSeparator = value.includes('.') || value.includes(',');

    if (hasDecimalSeparator) {
      value = value.replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = Number.parseFloat(value);
      if (!Number.isNaN(num)) {
        if (num < 0) {
          formData.sh = 'H';
          formData.turnover = Math.abs(num).toFixed(2);
        } else {
          formData.turnover = num.toFixed(2);
        }
      }
    } else {
      const digitsOnly = value.replace(/[^\d]/g, '');
      if (digitsOnly.length === 0) {
        formData.turnover = '0.00';
      } else if (digitsOnly.length === 1) {
        formData.turnover = `0.0${digitsOnly}`;
      } else if (digitsOnly.length === 2) {
        formData.turnover = `0.${digitsOnly}`;
      } else {
        const integerPart = digitsOnly.slice(0, -2);
        const decimalPart = digitsOnly.slice(-2);
        const formattedInteger = Number.parseInt(integerPart, 10).toLocaleString('en-US');
        formData.turnover = `${formattedInteger}.${decimalPart}`;
      }
    }
  }

  /**
   * Normalize discount on blur
   */
  function normalizeDisc(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(',', '.').replace('%', '').trim();
    const num = Number.parseFloat(value);
    if (!Number.isNaN(num)) {
      formData.disc = `${num.toFixed(2)} %`;
    } else {
      formData.disc = '0.00 %';
    }
  }

  /**
   * Handle form submission
   */
  function handleSubmit(event: Event): void {
    event.preventDefault();
    dispatch('submit', formData);
  }

  /**
   * Handle form reset
   */
  function handleReset(): void {
    resetForm();
    dispatch('reset');
  }

  /**
   * Handle PDF attach/delete
   */
  function handlePdfClick(): void {
    if (hasPdf) {
      dispatch('pdfDelete');
    } else {
      dispatch('pdfAttach');
    }
  }

  /**
   * Helper function to focus a field by name
   */
  function focusField(fieldName: string): void {
    const fieldMap: Record<string, HTMLInputElement | HTMLSelectElement | null> = {
      'turnover': turnoverInput,
      'contra': contraInput,
      'reference': referenceInput,
      'date': document.getElementById('date') as HTMLInputElement,
      'account': accountInput,
      'tax': taxInput,
      'due': dueInput,
      'disc': document.getElementById('disc') as HTMLInputElement,
      'desc': descInput
    };

    const field = fieldMap[fieldName];
    if (field) {
      field.focus();
      if ('select' in field && typeof field.select === 'function') {
        field.select();
      }
    }
  }

  /**
   * Field navigation order (for Shift+Plus/Minus)
   */
  const fieldOrder = ['input-turnover', 'input-contra-account', 'input-reference', 'date', 'account', 'tax', 'due', 'disc', 'desc'];

  /**
   * Navigate to previous/next field with Shift+Minus/Plus
   */
  function navigateField(direction: 'forward' | 'backward', currentFieldId: string): void {
    const currentIndex = fieldOrder.indexOf(currentFieldId);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    const step = direction === 'forward' ? 1 : -1;

    // Find next non-disabled field
    for (let i = 0; i < fieldOrder.length; i++) {
      targetIndex = (targetIndex + step + fieldOrder.length) % fieldOrder.length;
      const targetField = document.getElementById(fieldOrder[targetIndex]) as HTMLInputElement | HTMLSelectElement;

      if (targetField && !targetField.disabled && !targetField.readOnly) {
        targetField.focus();
        if ('select' in targetField && typeof targetField.select === 'function') {
          targetField.select();
        }
        break;
      }
    }
  }

  /**
   * Focus management for Enter key navigation (fallback for fields without specific handlers)
   */
  function handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const currentId = target.id;

    // Shift+Minus: Navigate backward
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', currentId);
      return;
    }

    // Shift+Plus: Navigate forward
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', currentId);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const order = ['turnover', 'contra', 'reference', 'date', 'account', 'tax', 'due', 'disc', 'desc'];
      const currentIndex = order.indexOf(currentId);
      if (currentIndex >= 0) {
        const nextIndex = (currentIndex + 1) % order.length;
        const nextEl = document.getElementById(order[nextIndex]);
        if (nextEl instanceof HTMLElement) {
          nextEl.focus();
          if ('select' in nextEl && typeof nextEl.select === 'function') {
            nextEl.select();
          }
        }
      }
    }
  }

  /**
   * Handle turnover Enter/+ keys for SH toggle
   */
  function handleTurnoverKeyDown(event: KeyboardEvent): void {
    // Shift+Minus: Navigate backward
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'input-turnover');
      return;
    }
    // Shift+Plus: Navigate forward (check before normal Plus handling)
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'input-turnover');
      return;
    }

    // Sondertasten
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }

    // Enter und Plus
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValue = String(formData.turnover || '0').replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = Math.abs(Number.parseFloat(currentValue) || 0);
      formData.turnover = num.toFixed(2);
      formData.sh = 'S';
      contraInput?.focus();
    } else if (event.key === '+') {
      event.preventDefault();
      const currentValue = String(formData.turnover || '0').replace(/[^\d.,-]/g, '').replace(',', '.');
      const num = Math.abs(Number.parseFloat(currentValue) || 0);
      formData.turnover = num.toFixed(2);
      formData.sh = 'H';
      contraInput?.focus();
    }
  }

  /**
   * Handle contra account Enter key with validation
   */
  async function onContraKeyDown(event: KeyboardEvent): Promise<void> {
    // Shift-Navigation
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

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      await handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      const value = formData.contra?.toString().trim();

      // Empty field → open dialog
      if (!value || value === '') {
        await onOpenAccountDialog('CK');
        return;
      }

      // Non-numeric input → open dialog
      if (!/^\d+$/.test(value)) {
        await onOpenAccountDialog('CK');
        return;
      }

      // Validate account is allowed for this book circle
      const accountNum = Number.parseInt(value, 10);
      const bookCircle = selectedBookCircle?.no;
      const validation = await validateAccount(accountNum, bookCircle, 'CK');

      if (!validation.isValid) {
        console.log('CK validation failed:', validation.reason);
        // Invalid account → open dialog with pre-filled value
        await onOpenAccountDialog('CK');
        return;
      }

      // Valid account → move to next field
      referenceInput?.focus();
      referenceInput?.select();
    }
  }

  /**
   * Handle reference Enter key
   */
  function onReferenceKeyDown(event: KeyboardEvent): void {
    // Shift-Navigation
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

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      // Move focus to Date field
      focusField('date');
    }
  }

  // Date segment tracking for Enter navigation (mm → dd → yyyy → HK)
  let dateSegmentIndex = 0; // 0=month, 1=day, 2=year

  /**
   * Handle date Enter key with segment marking
   */
  function onDateKeyDown(event: KeyboardEvent): void {
    // Shift-Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      dateSegmentIndex = 0;
      navigateField('backward', 'date');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      dateSegmentIndex = 0;
      navigateField('forward', 'date');
      return;
    }

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      dateSegmentIndex = 0; // Reset segment
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      dateSegmentIndex = 0; // Reset segment
      focusField('desc');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      dateSegmentIndex = 0; // Reset segment
      handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      // Get the date input element
      const dateInput = document.getElementById('date') as HTMLInputElement;
      if (!dateInput) return;

      // Date format: YYYY-MM-DD (value) but displayed as localized (DD.MM.YYYY in Germany)
      // The browser's date input has spinbuttons for day, month, year
      // We need to select the appropriate segment based on dateSegmentIndex

      // Advance to next segment
      dateSegmentIndex++;

      if (dateSegmentIndex >= 3) {
        // After 3 Enters (month, day, year), move to Account field
        dateSegmentIndex = 0; // Reset for next time
        focusField('account');
      } else {
        // Keep focus on date field for next segment
        // The browser's native date input will handle segment focus automatically
        // We just need to keep the field focused
        dateInput.focus();
      }
    }
  }

  /**
   * Handle tax Enter key
   */
  function onTaxKeyDown(event: KeyboardEvent): void {
    // Shift-Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'tax');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'tax');
      return;
    }

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      // Move focus to Due Date field
      focusField('due');
    }
  }

  /**
   * Handle due date Enter key
   */
  function onDueDateKeyDown(event: KeyboardEvent): void {
    // Shift-Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'due');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'due');
      return;
    }

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      // Move focus to Disc field
      focusField('disc');
    }
  }

  /**
   * Handle disc Enter key
   */
  function onDiscKeyDown(event: KeyboardEvent): void {
    // Shift-Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'disc');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'disc');
      return;
    }

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      // Move focus to Description field
      focusField('desc');
    }
  }

  /**
   * Handle description Enter key
   */
  function onDescKeyDown(event: KeyboardEvent): void {
    // Shift-Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'desc');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'desc');
      return;
    }

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      // Cycle back to Turnover (or could submit form)
      focusField('turnover');
    }
  }

  /**
   * Handle account (HK) Enter key with validation
   */
  async function onAccountKeyDown(event: KeyboardEvent): Promise<void> {
    // Shift-Navigation
    if (event.shiftKey && event.key === '-') {
      event.preventDefault();
      navigateField('backward', 'account');
      return;
    }
    if (event.shiftKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      navigateField('forward', 'account');
      return;
    }

    // Sondertasten
    if (event.key === 'Home') {
      event.preventDefault();
      focusField('turnover');
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusField('desc');
      return;
    }
    if (event.key === '*') {
      event.preventDefault();
      focusField('date');
      return;
    }
    if (event.key === '+') {
      event.preventDefault();
      await handleSubmit(new Event('submit'));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      const value = formData.account?.toString().trim();

      // Empty field → open dialog
      if (!value || value === '') {
        await onOpenAccountDialog('HK');
        return;
      }

      // Non-numeric input → open dialog
      if (!/^\d+$/.test(value)) {
        await onOpenAccountDialog('HK');
        return;
      }

      // Validate account is allowed for this book circle
      const accountNum = Number.parseInt(value, 10);
      const bookCircle = selectedBookCircle?.no;
      const validation = await validateAccount(accountNum, bookCircle, 'HK');

      if (!validation.isValid) {
        console.log('HK validation failed:', validation.reason);
        // Invalid account → open dialog with pre-filled value
        await onOpenAccountDialog('HK');
        return;
      }

      // Valid account → check if Tax field is locked
      // If tax is locked/disabled, skip to description
      if (taxLocked || taxInput?.disabled) {
        descInput?.focus();
        descInput?.select();
      } else {
        taxInput?.focus();
      }
    }
  }

  /**
   * Validate account (CK or HK) against book circle rules
   * Checks both: 1) Account exists in allowed list, 2) Account is in range
   */
  async function validateAccount(
    account: number,
    bookCircle: number | null | undefined,
    side: 'CK' | 'HK'
  ): Promise<{ isValid: boolean; reason?: string }> {
    // Book Circle must be present
    if (!bookCircle) {
      return { isValid: false, reason: 'no_bookcircle' };
    }

    try {
      const response = await fetch(
        `/api/booking/allowed-accounts?bookCircle=${bookCircle}&side=${side}`
      );
      const data = await response.json();

      if (!data.ok) {
        return { isValid: false, reason: 'api_error' };
      }

      // Check if account exists in allowed accounts
      const accountExists = data.accounts.some((acc: any) => acc.account === account);

      if (!accountExists) {
        return { isValid: false, reason: 'not_exists' };
      }

      // Check range (if provided by API)
      if (data.meta?.range && data.meta.range.from != null && data.meta.range.to != null) {
        const inRange = account >= data.meta.range.from && account <= data.meta.range.to;
        if (!inRange) {
          return { isValid: false, reason: 'not_in_range' };
        }
      }

      // All checks passed
      return { isValid: true };

    } catch (error) {
      console.error('Account validation error:', error);
      return { isValid: false, reason: 'api_error' };
    }
  }

  /**
   * Validate contra account (wrapper for backward compatibility)
   */
  async function validateContraAccount(
    account: number,
    bookCircle: number | null | undefined
  ): Promise<boolean> {
    const result = await validateAccount(account, bookCircle, 'CK');
    return result.isValid;
  }

  /**
   * Open account selection dialog
   */
  async function onOpenAccountDialog(field: 'CK' | 'HK'): Promise<void> {
    // Dispatch event to parent component to open dialog
    const bookCircle = selectedBookCircle?.no || null;
    dispatch('open-account-dialog', { field, bookCircle });
  }
</script>

<form class="booking-form-fields" on:submit={handleSubmit}>
  <div class="form-row" class:locked={formLocked}>
    <!-- GU -->
    <div class="form-field">
      <label for="gu">GU</label>
      <input
        id="gu"
        type="text"
        bind:value={formData.gu}
        disabled={formLocked}
        readonly
        class="readonly-field"
        autocomplete="off"
      />
    </div>

    <!-- Turnover -->
    <div class="form-field">
      <label for="input-turnover">Turnover</label>
      <input
        id="input-turnover"
        type="text"
        bind:value={formData.turnover}
        bind:this={turnoverInput}
        on:blur={normalizeTurnover}
        on:keydown={handleTurnoverKeyDown}
        disabled={formLocked}
        autocomplete="off"
        class="text-right"
      />
    </div>

    <!-- SH (Soll/Haben) -->
    <div class="form-field">
      <label for="sh">SH</label>
      <input
        id="sh"
        type="text"
        bind:value={formData.sh}
        disabled={formLocked}
        readonly
        class="readonly-field text-center"
        class:sh-haben={formData.sh === 'H'}
        autocomplete="off"
      />
    </div>

    <!-- Contra Account -->
    <div class="form-field">
      <label for="input-contra-account">Contra Account</label>
      <input
        id="input-contra-account"
        type="text"
        bind:value={formData.contra}
        bind:this={contraInput}
        on:keydown={onContraKeyDown}
        disabled={formLocked}
        maxlength="5"
        autocomplete="off"
        class="text-center"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.contra} disabled />
        <span class="keep-label">Keep</span>
      </label>
    </div>

    <!-- Reference -->
    <div class="form-field">
      <label for="input-reference">Reference</label>
      <input
        id="input-reference"
        type="text"
        bind:value={formData.reference}
        bind:this={referenceInput}
        on:keydown={onReferenceKeyDown}
        disabled={formLocked}
        autocomplete="off"
      />
    </div>

    <!-- Date -->
    <div class="form-field">
      <label for="date">Date</label>
      <input
        id="date"
        type="date"
        bind:value={formData.date}
        on:keydown={onDateKeyDown}
        on:focus={() => dateSegmentIndex = 0}
        on:blur={() => dateSegmentIndex = 0}
        disabled={formLocked}
        autocomplete="off"
        class="text-center"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.date} disabled />
        <span class="keep-label">Keep</span>
      </label>
    </div>

    <!-- Account -->
    <div class="form-field">
      <label for="account">Account</label>
      <input
        id="account"
        type="text"
        bind:value={formData.account}
        bind:this={accountInput}
        on:keydown={onAccountKeyDown}
        disabled={formLocked}
        maxlength="5"
        autocomplete="off"
        class="text-center"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.account} disabled />
        <span class="keep-label">Keep</span>
      </label>
    </div>

    <!-- Tax -->
    <div class="form-field">
      <label for="tax">Tax</label>
      <select
        id="tax"
        bind:value={formData.tax}
        bind:this={taxInput}
        on:keydown={onTaxKeyDown}
        disabled={formLocked}
        class="text-center"
      >
        <option value="?" disabled>?</option>
        {#each availableTaxgroups as tg}
          <option value={tg}>{tg}</option>
        {/each}
      </select>
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.tax} disabled />
        <span class="keep-label">Keep</span>
      </label>
    </div>

    <!-- Due Date -->
    <div class="form-field">
      <label for="due">Due Date</label>
      <input
        id="due"
        type="date"
        bind:value={formData.due}
        bind:this={dueInput}
        on:keydown={onDueDateKeyDown}
        disabled={formLocked}
        readonly
        class="readonly-field text-center"
        autocomplete="off"
      />
    </div>

    <!-- Discount -->
    <div class="form-field">
      <label for="disc">Disc.</label>
      <input
        id="disc"
        type="text"
        bind:value={formData.disc}
        on:blur={normalizeDisc}
        on:keydown={onDiscKeyDown}
        disabled={formLocked}
        autocomplete="off"
        class="text-right"
      />
    </div>

    <!-- Description -->
    <div class="form-field description-field">
      <label for="desc">Description</label>
      <input
        id="desc"
        type="text"
        bind:value={formData.desc}
        bind:this={descInput}
        on:keydown={onDescKeyDown}
        disabled={formLocked}
        maxlength="41"
        autocomplete="off"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.desc} disabled />
        <span class="keep-label">Keep</span>
      </label>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <Button type="submit" variant="success" disabled={formLocked}>OK</Button>
      <Button type="button" variant="danger" disabled={formLocked} on:click={handleReset}>Cancel</Button>
      <Button
        type="button"
        variant={hasPdf ? 'danger' : 'primary'}
        disabled={formLocked || pdfUploading || !formData.idNr}
        on:click={handlePdfClick}
      >
        {pdfUploading ? 'Uploading...' : (hasPdf ? '-PDF' : '+PDF')}
      </Button>
    </div>
  </div>
</form>

<style>
  .booking-form-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .form-row {
    display: grid;
    grid-template-columns:
      37px 80px 35px 100px 150px 120px 100px 50px 120px 60px 350px 120px;
    gap: 12px;
    align-items: end;
  }

  .form-row.locked {
    opacity: 0.6;
  }

  .form-field {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .form-field label {
    font-weight: bold;
    font-size: 11px;
    text-align: center;
    display: block;
    width: 100%;
  }

  .form-field input,
  .form-field select {
    width: 100%;
    padding: 4px 6px;
    font-size: 0.9rem;
    height: 28px;
    box-sizing: border-box;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }

  .form-field input:disabled,
  .form-field select:disabled {
    background-color: #e5e7eb;
    color: #6b7280;
    cursor: not-allowed;
  }

  .readonly-field {
    background-color: #f3f4f6;
    color: #374151;
    pointer-events: none;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .sh-haben {
    background-color: #fee2e2;
    color: #dc2626;
    font-weight: bold;
  }

  .keep-toggle {
    position: absolute;
    bottom: -17px;
    left: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    user-select: none;
    font-size: 9px;
  }

  .keep-toggle input[type="checkbox"] {
    width: 12px;
    height: 12px;
    margin: 0;
    cursor: pointer;
  }

  .keep-label {
    font-size: 9px;
    color: #6b7280;
  }

  .form-actions {
    display: flex;
    justify-content: flex-start;
    gap: 6px;
    align-items: center;
  }

  .description-field {
    grid-column: span 2;
  }
</style>
