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
      vStUSt: null,
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
   * Focus management for Enter key navigation
   */
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const order = ['turnover', 'contra', 'reference', 'date', 'account', 'tax', 'due', 'disc', 'desc'];
      const currentId = (event.target as HTMLElement).id;
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
      <label for="turnover">Turnover</label>
      <input
        id="turnover"
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
      <label for="contra">Contra Account</label>
      <input
        id="contra"
        type="text"
        bind:value={formData.contra}
        bind:this={contraInput}
        on:keydown={handleKeyDown}
        disabled={formLocked}
        maxlength="5"
        autocomplete="off"
        class="text-center"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.contra} />
        <span class="keep-label">Keep</span>
      </label>
    </div>

    <!-- Reference -->
    <div class="form-field">
      <label for="reference">Reference</label>
      <input
        id="reference"
        type="text"
        bind:value={formData.reference}
        bind:this={referenceInput}
        on:keydown={handleKeyDown}
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
        on:keydown={handleKeyDown}
        disabled={formLocked}
        autocomplete="off"
        class="text-center"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.date} />
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
        on:keydown={handleKeyDown}
        disabled={formLocked}
        maxlength="5"
        autocomplete="off"
        class="text-center"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.account} />
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
        on:keydown={handleKeyDown}
        disabled={formLocked}
        class="text-center"
      >
        <option value="?" disabled>?</option>
        {#each availableTaxgroups as tg}
          <option value={tg}>{tg}</option>
        {/each}
      </select>
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.tax} />
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
        on:keydown={handleKeyDown}
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
        on:keydown={handleKeyDown}
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
        on:keydown={handleKeyDown}
        disabled={formLocked}
        maxlength="41"
        autocomplete="off"
      />
      <label class="keep-toggle">
        <input type="checkbox" bind:checked={keepFlags.desc} />
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
