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

  // Selected entry for form
  let selectedEntry: any = null;

  // Load journal entries on mount
  onMount(async () => {
    console.log('onMount called - loading journal entries');
    await loadJournalEntries();
  });

  async function loadJournalEntries() {
    try {
      const params = new URLSearchParams({
        year: $bookingStore.selectedYear.toString(),
        month: $bookingStore.selectedMonth.toString()
      });

      const url = `/api/booking/primanota?${params}`;
      console.log('Fetching from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', data);
      console.log('Rows count:', data.rows?.length || 0);

      if (data.ok) {
        journalEntries = data.rows || [];
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

  <BookingControlBar />

  <!-- Primanota Table (Primanota view only) -->
  {#if $bookingStore.currentView === 'primanota'}
    <PrimanotaTable entries={journalEntries} on:rowselect={handleRowSelect} />
  {/if}

  <!-- Kontoansicht Table (Kontoansicht view only) -->
  {#if $bookingStore.currentView === 'kontoansicht'}
    <KontoansichtTable entries={journalEntries} on:rowselect={handleRowSelect} />
  {/if}

  <!-- OP-Ansicht Table (OP view only) -->
  {#if $bookingStore.currentView === 'op'}
    <OPAnsichtTable entries={journalEntries} on:rowselect={handleRowSelect} />
  {/if}

  <!-- Booking Entry Form (shown when entry is selected) -->
  <BookingEntryForm
    selectedEntry={selectedEntry}
    on:save={handleSave}
    on:cancel={handleCancel}
    on:addpdf={handleAddPDF} />
</div>

<style>
  .booking-page {
    position: relative;
    min-height: 100vh;
    background-color: rgb(247, 244, 239);
  }
</style>
