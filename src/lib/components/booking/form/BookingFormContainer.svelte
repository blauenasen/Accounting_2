<!-- src/lib/components/booking/form/BookingFormContainer.svelte -->
<script lang="ts">
  // Booking form orchestrator component - coordinates all sub-components
  import { onMount, onDestroy } from 'svelte';
  import { toastStore } from '$lib/utils/toast.js';
  import type { BookingFormData, BookingFormDialogState } from '$lib/types/ui.js';

  // Sub-components
  import BookingFormFields from './BookingFormFields.svelte';
  import BookingFormDialogs from './BookingFormDialogs.svelte';
  import BookingFormValidation from './BookingFormValidation.svelte';

  // Props
  export let selectedBookCircle: { no: number; textcode?: string } | null = null;
  export let currentMonth: string | null = null;
  export let currentYear: string | null = null;

  // Component refs for external access
  let formFieldsRef: BookingFormFields;
  let validationRef: BookingFormValidation;

  // Form state
  let formData: BookingFormData = {
    bookCircle: '',
    gu: '',
    turnover: '0.00',
    sh: 'S',
    contra: '',
    reference: '',
    date: '',
    account: '',
    tax: '',
    due: '',
    disc: '0.00 %',
    desc: '',
    // Additional fields
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

  // Form control state
  let formLocked = true;
  let manuallyUnlocked = false;
  let hasPdf = false;
  let pdfUploading = false;

  // Dialog states
  let dialogState: BookingFormDialogState = {
    accountSelection: {
      visible: false,
      field: '',
      accounts: [],
      filter: ''
    },
    duplicateWarning: {
      visible: false,
      duplicateInfo: {}
    },
    yearMismatch: {
      visible: false,
      confirmationStage: 1,
      bookingYear: null,
      pendingPayload: null
    },
    dateMonthMismatch: {
      visible: false,
      dateMonth: null,
      selectedMonth: null,
      currentDate: ''
    },
    validation: {
      visible: false,
      errors: []
    },
    pdfOverwrite: {
      visible: false
    },
    pdfDelete: {
      visible: false
    }
  };

  // Keep field toggles
  let keepFlags = {
    contra: false,
    date: false,
    account: false,
    tax: false,
    desc: false
  };

  /**
   * Check if form should be locked
   */
  $: hasValidBookCircle = selectedBookCircle && selectedBookCircle.no != null;
  $: formLocked = !hasValidBookCircle && !manuallyUnlocked;

  /**
   * Public API: Unlock form manually
   */
  export function unlockForm(): void {
    manuallyUnlocked = true;
  }

  /**
   * Public API: Fill form with data
   */
  export function fillForm(data: Partial<BookingFormData>): void {
    if (formFieldsRef) {
      formFieldsRef.fillForm(data);
    }
  }

  /**
   * Public API: Set account number
   */
  export function setAccount(accountNumber: string | number): void {
    if (formFieldsRef) {
      formFieldsRef.setAccount(String(accountNumber));
    }
  }

  /**
   * Public API: Set contra account number
   */
  export function setContraAccount(accountNumber: string | number): void {
    if (formFieldsRef) {
      formFieldsRef.setContraAccount(String(accountNumber));
    }
  }

  /**
   * Public API: Get current booking data
   */
  export function getCurrentBookingData(): BookingFormData {
    if (formFieldsRef) {
      return formFieldsRef.getCurrentBookingData();
    }
    return formData;
  }

  /**
   * Public API: Reset form
   */
  export function resetForm(): void {
    if (formFieldsRef) {
      formFieldsRef.resetForm();
    }
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(event: CustomEvent): Promise<void> {
    try {
      // Validate and build payload
      if (!validationRef) {
        throw new Error('Validation component not initialized');
      }

      const result = validationRef.validateAndBuild();

      if (!result.valid || !result.payload) {
        // Show validation errors
        dialogState.validation.visible = true;
        dialogState.validation.errors = result.errors;
        return;
      }

      // TODO: Save to database via API
      // const response = await fetch('/api/booking/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(result.payload)
      // });

      // Dispatch event to parent for now
      window.dispatchEvent(new CustomEvent('booking:submit', {
        detail: result.payload
      }));

      toastStore.success('Booking saved successfully');

      // Reset form after successful submission
      resetForm();

    } catch (error) {
      toastStore.error(error instanceof Error ? error.message : 'Failed to save booking');
    }
  }

  /**
   * Handle form reset
   */
  function handleReset(): void {
    resetForm();
  }

  /**
   * Handle PDF upload
   */
  function handlePdfUpload(event: CustomEvent): void {
    const { hasPdf: newHasPdf, uploading } = event.detail;
    hasPdf = newHasPdf;
    pdfUploading = uploading;
  }

  /**
   * Handle open account dialog request
   */
  async function handleOpenAccountDialog(event: CustomEvent): Promise<void> {
    const { field, bookCircle } = event.detail;

    if (!bookCircle) {
      toastStore.error('Please select a Book Circle first');
      return;
    }

    try {
      // Fetch allowed accounts from backend
      const response = await fetch(
        `/api/booking/allowed-accounts?bookCircle=${bookCircle}&side=${field}`
      );
      const data = await response.json();

      if (!data.ok) {
        toastStore.error(`Failed to load accounts: ${data.error}`);
        return;
      }

      // Open dialog with accounts
      dialogState.accountSelection = {
        visible: true,
        field,
        accounts: data.accounts || [],
        filter: ''
      };
    } catch (error) {
      toastStore.error('Failed to load accounts');
    }
  }

  /**
   * Handle account selection from dialog
   */
  function handleAccountSelect(event: CustomEvent): void {
    const { account, field } = event.detail;

    if (field === 'CK') {
      setContraAccount(account.account);
    } else if (field === 'HK') {
      setAccount(account.account);
    }

    // Close dialog
    dialogState.accountSelection.visible = false;
  }

  /**
   * Lifecycle: Setup event listeners
   */
  onMount(() => {
    if (typeof window === 'undefined') return;

    // Listen for unlock form event
    const unlockHandler = () => {
      manuallyUnlocked = true;
    };
    window.addEventListener('booking:unlock-form', unlockHandler);

    return () => {
      window.removeEventListener('booking:unlock-form', unlockHandler);
    };
  });

  onDestroy(() => {
    // Cleanup will be handled by onMount return
  });
</script>

<div class="booking-form-container">
  <BookingFormFields
    bind:this={formFieldsRef}
    bind:formData
    bind:keepFlags
    bind:hasPdf
    bind:pdfUploading
    {formLocked}
    {selectedBookCircle}
    {currentMonth}
    {currentYear}
    on:submit={handleSubmit}
    on:reset={handleReset}
    on:pdfUpload={handlePdfUpload}
    on:open-account-dialog={handleOpenAccountDialog}
  />

  <BookingFormValidation
    bind:this={validationRef}
    {formData}
    {selectedBookCircle}
    {currentMonth}
    {currentYear}
  />

  <BookingFormDialogs
    bind:dialogState
    {selectedBookCircle}
    {currentYear}
    on:select={handleAccountSelect}
  />
</div>

<style>
  .booking-form-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
</style>
