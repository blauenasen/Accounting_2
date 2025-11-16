<!-- src/lib/components/booking/form/BookingFormDialogs.svelte -->
<script lang="ts">
  // Booking form dialogs orchestrator - manages all dialog states
  import type { BookingFormDialogState } from '$lib/types/ui.js';

  // Props
  export let dialogState: BookingFormDialogState;
  export let selectedBookCircle: { no: number; textcode?: string } | null = null;
  export let currentYear: string | null = null;

  // Dialog components will be imported as they are migrated
  // import AccountSelectionDialog from '../dialogs/AccountSelectionDialog.svelte';
  // import DuplicateWarningDialog from '../dialogs/DuplicateWarningDialog.svelte';
  // import DateMonthMismatchDialog from '../dialogs/DateMonthMismatchDialog.svelte';
  // import YearMismatchDialog from '../dialogs/YearMismatchDialog.svelte';
  // import PdfOverwriteDialog from '../dialogs/PdfOverwriteDialog.svelte';
  // import PdfDeleteDialog from '../dialogs/PdfDeleteDialog.svelte';
  // import ValidationErrorDialog from '../dialogs/ValidationErrorDialog.svelte';

  /**
   * Handle dialog close events
   */
  function handleAccountSelectionClose(): void {
    dialogState.accountSelection.visible = false;
  }

  function handleDuplicateWarningClose(): void {
    dialogState.duplicateWarning.visible = false;
  }

  function handleYearMismatchClose(): void {
    dialogState.yearMismatch.visible = false;
  }

  function handleDateMonthMismatchClose(): void {
    dialogState.dateMonthMismatch.visible = false;
  }

  function handleValidationClose(): void {
    dialogState.validation.visible = false;
  }

  function handlePdfOverwriteClose(): void {
    dialogState.pdfOverwrite.visible = false;
  }

  function handlePdfDeleteClose(): void {
    dialogState.pdfDelete.visible = false;
  }
</script>

<!-- Dialog components will be rendered here as they are migrated -->

<!-- Placeholder for future dialog components:

{#if dialogState.accountSelection.visible}
  <AccountSelectionDialog
    field={dialogState.accountSelection.field}
    bookCircle={selectedBookCircle?.no}
    accounts={dialogState.accountSelection.accounts}
    initialFilter={dialogState.accountSelection.filter}
    on:close={handleAccountSelectionClose}
    on:select
  />
{/if}

{#if dialogState.duplicateWarning.visible}
  <DuplicateWarningDialog
    duplicateInfo={dialogState.duplicateWarning.duplicateInfo}
    on:close={handleDuplicateWarningClose}
    on:confirm
    on:cancel
  />
{/if}

{#if dialogState.yearMismatch.visible}
  <YearMismatchDialog
    selectedYear={currentYear}
    bookingYear={dialogState.yearMismatch.bookingYear}
    confirmationStage={dialogState.yearMismatch.confirmationStage}
    on:close={handleYearMismatchClose}
    on:yes
    on:no
  />
{/if}

{#if dialogState.dateMonthMismatch.visible}
  <DateMonthMismatchDialog
    dateMonth={dialogState.dateMonthMismatch.dateMonth}
    selectedMonth={dialogState.dateMonthMismatch.selectedMonth}
    currentDate={dialogState.dateMonthMismatch.currentDate}
    on:close={handleDateMonthMismatchClose}
    on:changeMonth
    on:correctDate
  />
{/if}

{#if dialogState.validation.visible}
  <ValidationErrorDialog
    errors={dialogState.validation.errors}
    on:close={handleValidationClose}
  />
{/if}

{#if dialogState.pdfOverwrite.visible}
  <PdfOverwriteDialog
    on:close={handlePdfOverwriteClose}
    on:confirm
    on:cancel
  />
{/if}

{#if dialogState.pdfDelete.visible}
  <PdfDeleteDialog
    on:close={handlePdfDeleteClose}
    on:confirm
    on:cancel
  />
{/if}

-->

<style>
  /* Dialog styles will be component-specific */
</style>
