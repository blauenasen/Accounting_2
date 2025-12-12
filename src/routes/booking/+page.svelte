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

  // Reference to BookingEntryForm component (for keyboard handlers)
  let bookingFormRef: BookingEntryForm;

  // Load journal entries on mount
  onMount(async () => {
    console.log('onMount called - loading journal entries');
    // Initial load without month parameter - let API determine highest month
    await loadJournalEntries({ useDefaults: true });

    // ESC key handler: Clear form fields only (BC remains unchanged)
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !showBookCircleDialog) {
        event.preventDefault();

        // Use Case 3: Clear form fields (BC remains unchanged)
        if (bookingFormRef?.clearForm) {
          bookingFormRef.clearForm();
        }
      }
    };
    window.addEventListener('keydown', keyHandler);

    // Use Case 4: F5 - Refresh table and clear fields
    const f5Handler = async (event: KeyboardEvent) => {
      if (event.key === 'F5') {
        event.preventDefault();
        console.log('F5 pressed - refreshing Primanota and clearing form');

        // Refresh table
        await loadJournalEntries();

        // Clear form
        if (bookingFormRef?.clearForm) {
          bookingFormRef.clearForm();
        }
      }
    };
    window.addEventListener('keydown', f5Handler);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('keydown', f5Handler);
    };
  });

  async function loadJournalEntries(options: { useDefaults?: boolean } = {}) {
    try {
      const params = new URLSearchParams();

      // Always use current store values for API call
      params.set('year', $bookingStore.selectedYear.toString());
      params.set('month', $bookingStore.selectedMonth.toString());

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

        // Update store with resolved values from API - BUT NOT on initial load
        // On initial load (F5), keep "All" as selected month
        if (!options.useDefaults) {
          if (data.year !== undefined) {
            bookingStore.setYear(data.year);
          }
          if (data.month !== undefined) {
            bookingStore.setMonth(data.month);
          }
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

  async function handleBookCircleSelect(event: CustomEvent<{ idcode: string | null; no: number | null; textcode: string }>) {
    const circle = event.detail;
    console.log('Book Circle selected:', circle);

    // Check if "-- no selection --" was selected
    if (circle.no === null) {
      selectedBookCircle = null;
      bookingStore.setBookCircle('');
    } else {
      selectedBookCircle = circle;
      bookingStore.setBookCircle(`${circle.no} - ${circle.textcode}`);
    }

    // Reload data with or without book circle filter
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
    const entry = event.detail;
    selectedEntry = entry;

    // Auto-select Book Circle from the double-clicked row
    if (entry && entry.BookCircle) {
      setBookCircleFromEntry(entry.BookCircle);
    }
  }

  async function handleSave(event: CustomEvent) {
    // FIXED: event.detail contains fields directly, NOT in formData
    const formData = event.detail;

    try {
      // Get BookCircle from store (format: "10 - Description" or "")
      const bookCircleStr = $bookingStore.selectedBookCircle;
      const bookCircle = bookCircleStr ? bookCircleStr.split(' - ')[0] : null;
      console.log('Using bookCircle from store:', bookCircle);

      if (!bookCircle || !bookCircleStr) {
        const errorMsg = 'Bitte wählen Sie einen Buchungskreis aus';
        console.error(errorMsg);
        alert(errorMsg); // TODO: Replace with toast notification
        return;
      }

      // Fetch account details (needed for JA fields in transformation)
      const [accountDetails, contraAccountDetails] = await Promise.all([
        fetch(`/api/booking/account-details?account=${formData.account}`).then((r) => r.json()),
        fetch(`/api/booking/account-details?account=${formData.contraAccount}`).then((r) =>
          r.json()
        )
      ]);

      // Send structured payload to API
      const payload = {
        formData,
        bookCircle,
        accountDetails,
        contraAccountDetails,
        idNr: selectedEntry?.IdNr // For updates
      };

      const response = await fetch('/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.ok) {
        // Refresh journal table
        await loadJournalEntries();

        // Clear form
        selectedEntry = null;

        // Show success message
        console.log('Booking saved successfully:', result);
      } else {
        console.error('Save failed:', result.error);
        // TODO: Show error to user
      }
    } catch (error) {
      console.error('API call failed:', error);
      // TODO: Show error to user
    }
  }

  function handleCancel() {
    selectedEntry = null;
  }

  function handleAddPDF() {
    console.log('Add PDF to booking entry');
    // TODO: Implement PDF upload functionality
  }

  // Helper function to set Book Circle from entry
  async function setBookCircleFromEntry(bookCircleNo: number) {
    if (!bookCircleNo) return;

    console.log('Auto-selecting Book Circle:', bookCircleNo);

    // Create temporary book circle object
    // The actual textcode will be fetched from database when dialog is opened
    selectedBookCircle = {
      idcode: bookCircleNo.toString(),
      no: bookCircleNo,
      textcode: `Circle ${bookCircleNo}` // Temporary label
    };

    bookingStore.setBookCircle(`${bookCircleNo} - Circle ${bookCircleNo}`);

    // Reload journal entries with new book circle filter
    await loadJournalEntries();
  }

  // Context menu event handlers
  async function handleFillForm(event: CustomEvent) {
    const { idNr } = event.detail;

    if (!idNr) {
      console.error('No IdNr provided for fillform');
      return;
    }

    // Fetch full entry from database using IdNr
    try {
      const response = await fetch(`/api/booking/entry?idNr=${idNr}`);
      const data = await response.json();

      if (data.ok && data.entry) {
        selectedEntry = data.entry;

        // Auto-select Book Circle from entry
        if (data.entry.BookCircle) {
          setBookCircleFromEntry(data.entry.BookCircle);
        }
      } else {
        console.error('Failed to load entry:', data.error);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  }

  async function handleDeleteEntry(event: CustomEvent) {
    const { bookingData } = event.detail;
    console.log('Delete entry:', bookingData);

    if (!bookingData || !bookingData.IdNr) {
      console.error('No IdNr found for deletion');
      return;
    }

    try {
      const response = await fetch(`/api/booking/delete?idNr=${bookingData.IdNr}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.ok) {
        console.log('Entry deleted successfully:', result.deletedIdNr);
        // Reload journal entries to reflect changes
        await loadJournalEntries();
      } else {
        console.error('Delete failed:', result.error);
        alert(`Failed to delete entry: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete request failed:', error);
      alert('Failed to delete entry');
    }
  }

  async function handleCancelEntry(event: CustomEvent) {
    const { bookingData } = event.detail;
    console.log('Cancel entry:', bookingData);

    if (!bookingData) {
      console.error('No booking data for cancellation');
      return;
    }

    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalBooking: bookingData })
      });

      const result = await response.json();

      if (result.ok) {
        console.log('Entry cancelled successfully. GU:', result.guNumber);
        // Reload journal entries to reflect changes
        await loadJournalEntries();
      } else {
        console.error('Cancel failed:', result.error);
        alert(`Failed to cancel entry: ${result.error}`);
      }
    } catch (error) {
      console.error('Cancel request failed:', error);
      alert('Failed to cancel entry');
    }
  }

  function handleMessage(event: CustomEvent) {
    const { text } = event.detail;
    console.log('Message:', text);
    // TODO: Show message to user (toast notification)
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
      filtersActive={$bookingStore.filterActive}
      on:rowselect={handleRowSelect}
      on:fillform={handleFillForm}
      on:deleteentry={handleDeleteEntry}
      on:cancelentry={handleCancelEntry}
      on:message={handleMessage} />
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
    bind:this={bookingFormRef}
    selectedEntry={selectedEntry}
    {selectedBookCircle}
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
