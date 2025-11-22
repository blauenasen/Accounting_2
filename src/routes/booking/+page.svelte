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

  <!-- Balance Fields (Kontoansicht & OP-Ansicht only) -->
  {#if $bookingStore.currentView === 'kontoansicht' || $bookingStore.currentView === 'op'}
    <BookingBalanceFields
      openingBalance={balanceData.openingBalance}
      debitBalance={balanceData.debitBalance}
      creditBalance={balanceData.creditBalance}
      totalBalance={balanceData.totalBalance}
      closingBalance={balanceData.closingBalance}
      sumDebit={balanceData.sumDebit}
      sumCredit={balanceData.sumCredit}
      sumTotal={balanceData.sumTotal} />
  {/if}

  <!-- Primanota Table (Primanota view only) -->
  {#if $bookingStore.currentView === 'primanota'}
    <PrimanotaTable entries={journalEntries} />
  {/if}

  <!-- Kontoansicht Table (Kontoansicht view only) -->
  {#if $bookingStore.currentView === 'kontoansicht'}
    <KontoansichtTable entries={journalEntries} />
  {/if}

  <!-- OP-Ansicht Table (OP view only) -->
  {#if $bookingStore.currentView === 'op'}
    <OPAnsichtTable entries={journalEntries} />
  {/if}

  <!-- Temporary view indicator -->
  <div class="view-indicator">
    <h2>Current View: {$bookingStore.currentView}</h2>
    <p>Year: {$bookingStore.selectedYear}, Month: {$bookingStore.selectedMonth}</p>
  </div>
</div>

<style>
  .booking-page {
    position: relative;
    min-height: 100vh;
    background-color: rgb(247, 244, 239);
  }

  .view-indicator {
    position: absolute;
    top: 200px;
    left: 700px;
    padding: 20px;
    background: white;
    border: 1px solid #ddd;
  }
</style>
