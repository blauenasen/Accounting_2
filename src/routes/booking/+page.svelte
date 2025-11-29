<!-- Booking Page - Main Entry Point -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { bookingStore } from '$lib/stores/bookingStore';
  import BookingHeader from './BookingHeader.svelte';
  import BookingControlBar from './BookingControlBar.svelte';
  import BookingBalanceFields from './BookingBalanceFields.svelte';
  import PrimanotaTable from './PrimanotaTable.svelte';
  import KontoansichtTable from './KontoansichtTable.svelte';
  import OPAnsichtTable from './OPAnsichtTable.svelte';
  import BookingEntryForm from './BookingEntryForm.svelte';
  import BookCircleSelectionDialog from '$lib/components/booking/dialogs/BookCircleSelectionDialog.svelte';

  // Status text
  $: statusText = `Month ${$bookingStore.selectedMonth === 'All' ? 'All' : $bookingStore.selectedMonth}: ${journalEntries.length} journal entries | Book Circle ${$bookingStore.selectedBookCircle}`;

  // Balance field values (dummy data for now)
  let balanceData = {
    openingBalance: 0.00,
    debitBalance: 0.00,
    creditBalance: 0.00,
    totalBalance: 0.00,
    closingBalance: 0.00,
    sumDebit: 0.00,
    sumCredit: 0.00,
    sumTotal: 0.00
  };

  // Journal entries
  let journalEntries: any[] = [];

  // Available years from database
  let availableYears: number[] = [];

  // Book Circle state
  let showBookCircleDialog = false;
  let selectedBookCircle: { idcode: string; no: number; textcode: string } | null = null;

  // Selected entry for form
  let selectedEntry: any = null;

  // Load journal entries on mount
  onMount(async () => {
    console.log('onMount called - loading journal entries');
    // Initial load without month parameter - let API determine highest month
    await loadJournalEntries({ useDefaults: true });

    // ESC key handler: Reset Book Circle
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !showBookCircleDialog) {
        event.preventDefault();
        if (selectedBookCircle !== null) {
          handleResetBookCircle();
        }
      }
    };
    window.addEventListener('keydown', keyHandler);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  });

  async function loadJournalEntries(options: { useDefaults?: boolean } = {}) {
    try {
      const params = new URLSearchParams();

      // On initial load (useDefaults=true), only pass year to let API determine highest month
      if (options.useDefaults) {
        params.set('year', $bookingStore.selectedYear.toString());
        // Don't set month - API will use highest available month as default
      } else {
        // Normal load - use current store values
        params.set('year', $bookingStore.selectedYear.toString());
        params.set('month', $bookingStore.selectedMonth.toString());
      }

      // Add book circle filter if selected (only in primanota view)
      if ($bookingStore.currentView === 'primanota' && selectedBookCircle) {
        params.set('bookCircle', selectedBookCircle.no.toString());
      }

      const url = `/api/booking/primanota?${params}`;
      console.log('Fetching from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', data);
      console.log('Rows count:', data.rows?.length || 0);

      if (data.ok) {
        journalEntries = data.rows || [];

        // Extract available years from API response
        if (Array.isArray(data.years) && data.years.length > 0) {
          availableYears = data.years;
          console.log('Available years:', availableYears);
        }

        // Update store with resolved values from API
        if (data.year !== undefined) {
          bookingStore.setYear(data.year);
        }
        if (data.month !== undefined) {
          bookingStore.setMonth(data.month);
        }

        console.log('Journal entries set:', journalEntries.length);
      } else {
        console.error('Failed to load journal entries:', data.error);
        journalEntries = [];
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      journalEntries = [];
    }
  }

  // Event handlers
  function handleViewChange(event: CustomEvent<'primanota' | 'kontoansicht' | 'op'>) {
    bookingStore.setView(event.detail);
  }

  function handleToggleFilter() {
    bookingStore.toggleFilter();
  }

  function handleSelectBookCircle(event: CustomEvent<string>) {
    bookingStore.setBookCircle(event.detail);
  }

  async function handleYearChange(event: CustomEvent<{ year: number; month: string | number }>) {
    const { year } = event.detail;
    console.log('Year changed to:', year);
    bookingStore.setYear(year);
    await loadJournalEntries();
  }

  async function handleMonthChange(event: CustomEvent<{ year: number; month: string | number }>) {
    const { month } = event.detail;
    console.log('Month changed to:', month);
    bookingStore.setMonth(month);
    await loadJournalEntries();
  }

  async function handlePeriodChange(event: CustomEvent<{ year: number; month: string | number }>) {
    console.log('Period changed:', event.detail);
    // This handles both year and month changes from BookingControlBar
    await loadJournalEntries();
  }

  function handleOpenBookCircleDialog() {
    console.log('Opening Book Circle dialog');
    showBookCircleDialog = true;
  }

  function handleCloseBookCircleDialog() {
    showBookCircleDialog = false;
  }

  async function handleBookCircleSelect(event: CustomEvent<{ idcode: string; no: number; textcode: string }>) {
    const circle = event.detail;
    console.log('Book Circle selected:', circle);

    selectedBookCircle = circle;
    bookingStore.setBookCircle(`${circle.no} - ${circle.textcode}`);

    // Reload data with book circle filter
    await loadJournalEntries();
  }

  async function handleResetBookCircle() {
    console.log('Resetting Book Circle');
    selectedBookCircle = null;
    bookingStore.setBookCircle('');

    // Reload data without book circle filter
    await loadJournalEntries();
  }

  function handleRowSelect(event: CustomEvent) {
    selectedEntry = event.detail;
  }

  function handleSave(event: CustomEvent) {
    console.log('Save booking entry:', event.detail);
    // TODO: Implement save functionality
  }

  function handleCancel() {
    selectedEntry = null;
  }

  function handleAddPDF() {
    console.log('Add PDF to booking entry');
    // TODO: Implement PDF upload functionality
  }
</script>

<svelte:head>
  <title>Booking - Accounting_2</title>
</svelte:head>

<div class="booking-page">
  <BookingHeader
    {statusText}
    currentView={$bookingStore.currentView}
    on:viewchange={handleViewChange}
    on:togglefilter={handleToggleFilter}
    on:selectbookcircle={handleSelectBookCircle} />

  <BookingControlBar
    {availableYears}
    {selectedBookCircle}
    on:periodchange={handlePeriodChange}
    on:openbookcircledialog={handleOpenBookCircleDialog} />

  <!-- Primanota Table (Primanota view only) -->
  {#if $bookingStore.currentView === 'primanota'}
    <PrimanotaTable
      entries={journalEntries}
      hideStornos={$bookingStore.hideStornos}
      on:rowselect={handleRowSelect} />
  {/if}

  <!-- Kontoansicht Table (Kontoansicht view only) -->
  {#if $bookingStore.currentView === 'kontoansicht'}
    <KontoansichtTable
      entries={journalEntries}
      hideStornos={$bookingStore.hideStornos}
      on:rowselect={handleRowSelect} />
  {/if}

  <!-- OP-Ansicht Table (OP view only) -->
  {#if $bookingStore.currentView === 'op'}
    <OPAnsichtTable
      entries={journalEntries}
      hideStornos={$bookingStore.hideStornos}
      on:rowselect={handleRowSelect} />
  {/if}

  <!-- Booking Entry Form (shown when entry is selected) -->
  <BookingEntryForm
    selectedEntry={selectedEntry}
    on:save={handleSave}
    on:cancel={handleCancel}
    on:addpdf={handleAddPDF} />
</div>

<!-- Book Circle Selection Dialog -->
<BookCircleSelectionDialog
  bind:visible={showBookCircleDialog}
  on:close={handleCloseBookCircleDialog}
  on:select={handleBookCircleSelect} />

<style>
  .booking-page {
    position: relative;
    min-height: 100vh;
    background-color: rgb(247, 244, 239);
  }
</style>
