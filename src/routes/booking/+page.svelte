<!-- Booking Page - Main Entry Point -->
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { bookingStore } from '$lib/stores/bookingStore';
  import { transformRowsForAccountView, transformRowsForOpView } from '$lib/logic/transformations';
  import { fetchJournalData } from '$lib/logic/dataLoading';
  import { calculateBalanceForRows } from '$lib/logic/primanota/calculations';
  import { calculateAccountBalances, calculateBalanceFields } from '$lib/logic/balanceCalculations';
  import BookingHeader from './BookingHeader.svelte';
  import BookingControlBar from './BookingControlBar.svelte';
  import BookingBalanceFields from './BookingBalanceFields.svelte';
  import PrimanotaTableContainer from '$lib/components/primanota/PrimanotaTableContainer.svelte';
  import KontoansichtTableContainer from '$lib/components/kontoansicht/KontoansichtTableContainer.svelte';
  import OPTableContainer from '$lib/components/op/OPTableContainer.svelte';
  import BookingEntryForm from './BookingEntryForm.svelte';
  import BookCircleSelectionDialog from '$lib/components/booking/dialogs/BookCircleSelectionDialog.svelte';
  import AccountBalanceFields from '$lib/components/booking/controls/AccountBalanceFields.svelte';
  import AccountSumFields from '$lib/components/booking/controls/AccountSumFields.svelte';
  import AccountSideToggle from '$lib/components/booking/controls/AccountSideToggle.svelte';

  // Import action handlers (refactored into modules)
  import * as primanotaActions from '$lib/logic/booking/primanotaActions';
  import * as kontoansichtActions from '$lib/logic/booking/kontoansichtActions';
  import * as opActions from '$lib/logic/booking/opActions';
  import type { RowSelectionContext } from '$lib/logic/booking/shared/rowSelection';
  import type { FormActionsContext } from '$lib/logic/booking/shared/formActions';
  import { viewModeStore } from '$lib/stores/viewModeStore';
  import type { PageData } from './$types';

  // SvelteKit props - data from load function
  export let data: PageData;

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

  // PHASE 1: Separate data sources per view to prevent BookCircle contamination
  let primanotaEntries: any[] = [];        // WITH BookCircle filter
  let kontoansichtRawEntries: any[] = [];  // WITHOUT BookCircle filter
  let kontoansichtEntries: any[] = [];     // Transformed Kontoansicht data
  let opRawEntries: any[] = [];            // WITHOUT BookCircle filter

  // Account/Contra Account toggle state
  let selectedSide: 'account' | 'contra' = 'account';

  // Status text (uses Primanota entries)
  $: statusText = `Month ${$bookingStore.selectedMonth === 'All' ? 'All' : $bookingStore.selectedMonth}: ${primanotaEntries.length} journal entries | Book Circle ${$bookingStore.selectedBookCircle}`;

  // Saldenvortrag accounts (Opening-Balance accounts from ledgers.JAPos='Saldenvortrag')
  let saldenvortragAccounts: number[] = [];

  // Transform Kontoansicht data when raw entries or account changes
  $: {
    if ($bookingStore.selectedAccountKontoansicht && kontoansichtRawEntries.length > 0) {
      const account = parseInt($bookingStore.selectedAccountKontoansicht);

      // Transform ALL entries for table display (including Opening-Balance entries)
      const transformed = transformRowsForAccountView(kontoansichtRawEntries, account);
      kontoansichtEntries = calculateBalanceForRows(transformed, 'account');
    } else {
      kontoansichtEntries = [];
    }
  }

  // Calculate balance fields for Kontoansicht
  $: if ($bookingStore.currentView === 'kontoansicht' && kontoansichtRawEntries.length > 0 && saldenvortragAccounts.length > 0) {
    const account = parseInt($bookingStore.selectedAccountKontoansicht || '0');

    // Load Opening-Balance from API and calculate balance fields
    loadOpeningBalance(account).then((openingBalance) => {
      // Use calculateBalanceFields() to filter out Opening-Balance entries
      const balances = calculateBalanceFields(kontoansichtRawEntries, saldenvortragAccounts, openingBalance, account);
        balanceData = {
          openingBalance: balances.openingBalance,
          debitBalance: balances.debitBalance,
          creditBalance: balances.creditBalance,
          totalBalance: balances.totalBalance,
          closingBalance: balances.closingBalance,
          sumDebit: 0,
          sumCredit: 0,
          sumTotal: 0
        };
    });
  } else if ($bookingStore.currentView === 'kontoansicht') {
    // Reset balances when no data
      balanceData = {
        openingBalance: 0,
        debitBalance: 0,
        creditBalance: 0,
        totalBalance: 0,
        closingBalance: 0,
        sumDebit: 0,
        sumCredit: 0,
        sumTotal: 0
      };
  }

  // Load Opening-Balance from API
  async function loadOpeningBalance(account: number): Promise<number> {
    if (!account) return 0;

    try {
      const response = await fetch(`/api/booking/balance-open?account=${account}&year=${$bookingStore.selectedYear}`);
      const data = await response.json();
      if (data.ok) {
        return data.balanceOpen || 0;
      }
    } catch (error) {
      console.error('Failed to load opening balance:', error);
    }
    return 0;
  }

  // Note: Kontoansicht and OP containers now use raw entries
  // Transformation happens in PrimanotaTableState within each container

  // Available years from database (loaded from server via +page.ts)
  let availableYears: number[] = data.availableYears;

  // Book Circle state
  let showBookCircleDialog = false;
  let selectedBookCircle: { idcode: string; no: number; textcode: string } | null = null;

  // Selected entry for form
  let selectedEntry: any = null;

  // Reference to BookingEntryForm component (for keyboard handlers)
  let bookingFormRef: BookingEntryForm;

  // Flag to prevent clearing fields when loading entry programmatically
  let isLoadingEntry = false;

  // CRITICAL FIX: Synchronize viewModeStore.mode with bookingStore.currentView
  // This is essential for Multi-Selection to work in Kontoansicht and OP-Ansicht!
  $: {
    if ($bookingStore.currentView === 'kontoansicht') {
      viewModeStore.setMode('account');
      console.log('[+page] ViewMode set to: account (for Kontoansicht)');
    } else if ($bookingStore.currentView === 'op') {
      viewModeStore.setMode('op');
      console.log('[+page] ViewMode set to: op (for OP-Ansicht)');
    } else {
      viewModeStore.setMode('primanota');
      console.log('[+page] ViewMode set to: primanota');
    }
  }

  // Load journal entries on mount
  onMount(async () => {
    console.log('onMount called - loading initial data');

    // CRITICAL FIX: Set selectedYear from server load data BEFORE any rendering
    // This prevents flickering (2026 -> empty -> 2025)
    if (data.initialYear && data.initialYear !== $bookingStore.selectedYear) {
      console.log(`[+page.svelte] Setting initial year from server: ${data.initialYear}`);
      bookingStore.setYear(data.initialYear);
    }

    // Load Saldenvortrag accounts DYNAMICALLY from API (NO hardcoded values!)
    try {
      const response = await fetch('/api/booking/saldenvortrag-accounts');
      const responseData = await response.json();
      if (responseData.ok) {
        saldenvortragAccounts = responseData.accounts;
        console.log('Loaded Saldenvortrag accounts:', saldenvortragAccounts);
      }
    } catch (error) {
      console.error('Failed to load Saldenvortrag accounts:', error);
      saldenvortragAccounts = []; // Fallback to empty array
    }

    // Initial load: Load Primanota by default (initial view)
    await loadPrimanotaEntries({ useDefaults: true });

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
        console.log('F5 pressed - refreshing current view and clearing form');

        // Refresh current view's data
        await reloadCurrentView();

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

  // PRIMANOTA: Load with BookCircle filter
  async function loadPrimanotaEntries(options: { useDefaults?: boolean } = {}) {
    console.log('Loading Primanota entries...');

    try {
      // Build URL parameters
      const urlParams = new URLSearchParams();
      urlParams.set('year', $bookingStore.selectedYear.toString());
      urlParams.set('month', $bookingStore.selectedMonth.toString());
      if (selectedBookCircle?.no) {
        urlParams.set('bookCircle', selectedBookCircle.no.toString());
      }

      const url = `/api/booking/primanota?${urlParams}`;
      console.log('Fetching Primanota data from:', url);

      const response = await fetch(url);
      const apiData = await response.json();

      if (apiData.ok) {
        primanotaEntries = apiData.rows || [];

        // Update availableYears if API returns new data (edge case)
        // NOTE: availableYears is already initialized from server load (+page.ts)
        // This only updates if the API returns different years
        if (Array.isArray(apiData.years) && apiData.years.length > 0) {
          availableYears = apiData.years;
          console.log('Updated available years from API:', availableYears);
        }

        console.log(`Loaded ${primanotaEntries.length} Primanota entries`);
      } else {
        console.error('Failed to load Primanota data:', apiData.error);
        primanotaEntries = [];
      }
    } catch (error) {
      console.error('Error fetching Primanota data:', error);
      primanotaEntries = [];
    }
  }

  // KONTOANSICHT: Load WITHOUT BookCircle filter (Phase 2: dedicated endpoint)
  async function loadKontoansichtEntries() {
    console.log('Loading Kontoansicht entries (NO BookCircle filter)...');
    kontoansichtRawEntries = await fetchJournalData('/api/booking/kontoansicht', {
      year: $bookingStore.selectedYear,
      month: $bookingStore.selectedMonth,
      account: $bookingStore.selectedAccountKontoansicht ? parseInt($bookingStore.selectedAccountKontoansicht) : null
    });
    console.log(`Loaded ${kontoansichtRawEntries.length} Kontoansicht entries`);
  }

  // OP-ANSICHT: Load WITHOUT BookCircle filter (Phase 2: dedicated endpoint)
  async function loadOpEntries() {
    console.log('Loading OP entries (NO BookCircle filter)...');
    opRawEntries = await fetchJournalData('/api/booking/op-ansicht', {
      year: $bookingStore.selectedYear,
      month: $bookingStore.selectedMonth,
      account: $bookingStore.selectedAccountOp ? parseInt($bookingStore.selectedAccountOp) : null,
      filter: $bookingStore.opFilter
    });
    console.log(`Loaded ${opRawEntries.length} OP entries`);
  }

  // Helper: Reload current view's data
  async function reloadCurrentView() {
    if ($bookingStore.currentView === 'primanota') {
      await loadPrimanotaEntries();
    } else if ($bookingStore.currentView === 'kontoansicht') {
      await loadKontoansichtEntries();
    } else if ($bookingStore.currentView === 'op') {
      await loadOpEntries();
    }
  }

  // Event handlers
  async function handleViewChange(event: CustomEvent<'primanota' | 'kontoansicht' | 'op'>) {
    const newView = event.detail;
    bookingStore.setView(newView);

    // Load view-specific data
    if (newView === 'primanota') {
      await loadPrimanotaEntries();
    } else if (newView === 'kontoansicht') {
      await loadKontoansichtEntries();
    } else if (newView === 'op') {
      await loadOpEntries();
    }
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
    await reloadCurrentView();
  }

  async function handleMonthChange(event: CustomEvent<{ year: number; month: string | number }>) {
    const { month } = event.detail;
    console.log('Month changed to:', month);
    bookingStore.setMonth(month);
    await reloadCurrentView();
  }

  async function handlePeriodChange(event: CustomEvent<{ year: number; month: string | number }>) {
    console.log('Period changed:', event.detail);
    // This handles both year and month changes from BookingControlBar
    await reloadCurrentView();
  }

  async function handleAccountChangeKontoansicht(event: CustomEvent<string>) {
    const account = event.detail;

    // Set account for current view
    if ($bookingStore.currentView === 'op') {
      bookingStore.setAccountOp(account);
      await loadOpEntries();
    } else {
      bookingStore.setAccountKontoansicht(account);
      if ($bookingStore.currentView === 'kontoansicht') {
        await loadKontoansichtEntries();
      }
    }
  }

  function handleSideToggle(event: CustomEvent<{ side: 'account' | 'contra' }>) {
    selectedSide = event.detail.side;
    // TODO: Implement data transformation toggle between Account and Contra Account view
    console.log('Side toggle:', selectedSide);
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

    // Reload Primanota with or without book circle filter
    if ($bookingStore.currentView === 'primanota') {
      await loadPrimanotaEntries();
    }
  }

  async function handleResetBookCircle() {
    console.log('Resetting Book Circle');
    selectedBookCircle = null;
    bookingStore.setBookCircle('');

    // Reload Primanota without book circle filter
    if ($bookingStore.currentView === 'primanota') {
      await loadPrimanotaEntries();
    }
  }

  // Create context object for action handlers
  function createActionContext(): RowSelectionContext & FormActionsContext {
    return {
      // State getters/setters
      getIsLoadingEntry: () => isLoadingEntry,
      setIsLoadingEntry: (value: boolean) => { isLoadingEntry = value; },
      getSelectedEntry: () => selectedEntry,
      setSelectedEntry: (entry: any) => { selectedEntry = entry; },
      getSelectedBookCircle: () => selectedBookCircle,
      setSelectedBookCircle: (circle) => { selectedBookCircle = circle; },

      // Data loading functions
      loadPrimanotaEntries,
      loadKontoansichtEntries,
      loadOpEntries,
      reloadCurrentView
    };
  }

  // Event handler wrapper - delegates to action modules
  async function handleRowSelect(event: CustomEvent) {
    const context = createActionContext();
    await primanotaActions.handleRowSelect(event, context);
  }

  async function handleSave(event: CustomEvent) {
    const context = createActionContext();
    await primanotaActions.handleSave(event, context);
  }

  function handleCancel() {
    const context = createActionContext();
    primanotaActions.handleCancel(context);
  }

  function handleAddPDF() {
    const context = createActionContext();
    primanotaActions.handleAddPDF(context);
  }

  async function handleFillForm(event: CustomEvent) {
    const context = createActionContext();
    await primanotaActions.handleFillForm(event, context);
  }

  async function handleDeleteEntry(event: CustomEvent) {
    const context = createActionContext();
    await primanotaActions.handleDeleteEntry(event, context);
  }

  async function handleCancelEntry(event: CustomEvent) {
    const context = createActionContext();
    await primanotaActions.handleCancelEntry(event, context);
  }

  function handleMessage(event: CustomEvent) {
    primanotaActions.handleMessage(event);
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
    on:openbookcircledialog={handleOpenBookCircleDialog}
    on:accountchange={handleAccountChangeKontoansicht} />

  <!-- Kontoansicht Balance & Sum Fields (Kontoansicht view only) -->
  {#if $bookingStore.currentView === 'kontoansicht'}
    <div class="kontoansicht-controls">
      <AccountBalanceFields
        balanceOpen={balanceData.openingBalance.toFixed(2)}
        atfDebit={balanceData.debitBalance.toFixed(2)}
        atfCredit={balanceData.creditBalance.toFixed(2)}
        atf={balanceData.totalBalance.toFixed(2)}
        balance={balanceData.closingBalance.toFixed(2)}
      />

      <AccountSideToggle
        bind:selectedSide
        hasBookingLoaded={kontoansichtEntries.length > 0}
        on:toggle={handleSideToggle}
      />
    </div>

    <!-- Separate container for Sum Fields (Sum Debit, Sum Credit, Sum Total) -->
    <div class="kontoansicht-sum-controls">
      <AccountSumFields
        displayRows={kontoansichtEntries}
        viewMode="account"
      />
    </div>
  {/if}

  <!-- Primanota Sum Fields (Primanota view only) -->
  {#if $bookingStore.currentView === 'primanota'}
    <div class="primanota-sum-controls">
      <AccountSumFields
        displayRows={primanotaEntries}
        viewMode="primanota"
      />
    </div>
  {/if}

  <!-- Primanota Table (Primanota view only) -->
  {#if $bookingStore.currentView === 'primanota'}
    <PrimanotaTableContainer
      rows={primanotaEntries}
      filtersActive={$bookingStore.filterActive}
      selectedAccount={null}
      maxHeight="888px"
      on:rowselect={handleRowSelect}
      on:fillform={handleFillForm}
      on:deleteentry={handleDeleteEntry}
      on:message={handleMessage}
      on:reload={reloadCurrentView}
      on:account-selected={() => {}} />
  {/if}

  <!-- Kontoansicht Table (Kontoansicht view only) -->
  {#if $bookingStore.currentView === 'kontoansicht'}
    <KontoansichtTableContainer
      entries={kontoansichtEntries}
      hideStornos={$bookingStore.hideStornos}
      filtersActive={$bookingStore.filterActive}
      selectedAccount={$bookingStore.selectedAccountKontoansicht ? parseInt($bookingStore.selectedAccountKontoansicht) : null}
      maxHeight="800px"
      on:rowselect={handleRowSelect} />
  {/if}

  <!-- OP-Ansicht Sum Fields (OP view only) -->
  {#if $bookingStore.currentView === 'op'}
    <div class="op-sum-controls">
      <AccountSumFields
        displayRows={opRawEntries}
        viewMode="op"
      />
    </div>
  {/if}

  <!-- OP-Ansicht Table (OP view only) -->
  {#if $bookingStore.currentView === 'op'}
    <OPTableContainer
      entries={opRawEntries}
      hideStornos={$bookingStore.hideStornos}
      filtersActive={$bookingStore.filterActive}
      selectedAccount={$bookingStore.selectedAccountOp ? parseInt($bookingStore.selectedAccountOp) : null}
      opFilter={$bookingStore.opFilter}
      maxHeight="888px"
      on:rowselect={handleRowSelect} />
  {/if}

  <!-- Booking Entry Form (shown when entry is selected) -->
  <BookingEntryForm
    bind:this={bookingFormRef}
    selectedEntry={selectedEntry}
    {selectedBookCircle}
    {isLoadingEntry}
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
    min-height: 95vh;
    background-color: rgb(247, 244, 239);
  }

  .kontoansicht-controls {
    position: relative;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  /* Separate container for Sum Fields in Kontoansicht (Sum Debit, Sum Credit, Sum Total) */
  .kontoansicht-sum-controls {
    position: relative;
    /* Adjust LEFT position: negative = left, positive = right */
    left: -9px;
    /* Adjust TOP position: negative = up, positive = down */
    top: 12px;
  }

  .primanota-sum-controls {
    position: relative;
    margin-top: -100px;
    margin-bottom: 10px;
  }

  .op-sum-controls {
    position: relative;
    margin-top: -100px;
    margin-bottom: 10px;
  }
</style>
