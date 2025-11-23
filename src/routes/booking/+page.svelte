<!-- Booking Page - Main Entry Point -->
<script lang="ts">
  import { bookingStore } from '$lib/stores/bookingStore';
  import BookingHeader from './BookingHeader.svelte';
  import BookingControlBar from './BookingControlBar.svelte';
  import BookingBalanceFields from './BookingBalanceFields.svelte';
  import PrimanotaTable from './PrimanotaTable.svelte';
  import KontoansichtTable from './KontoansichtTable.svelte';
  import OPAnsichtTable from './OPAnsichtTable.svelte';

  // Status text
  $: statusText = `Month All: 0 journal entries | Book Circle ${$bookingStore.selectedBookCircle}`;

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

  // Journal entries (dummy data for now)
  let journalEntries: any[] = [];

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
</div>

<style>
  .booking-page {
    position: relative;
    min-height: 100vh;
    background-color: rgb(247, 244, 239);
  }
</style>
