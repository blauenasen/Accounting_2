<!-- BookingControlBar.svelte -->
<!-- Year/Month Selectors + Navigation + Book Circle / Account Selector + Hide Stornos -->
<!-- Measurements from Mess-Tabelle.md -->

<script lang="ts">
  import { bookingStore } from '$lib/stores/bookingStore';
  import { createEventDispatcher } from 'svelte';
  import { TABLE_EVENTS } from '$lib/components/primanota/config/tableColumns';

  const dispatch = createEventDispatcher();

  // Props
  export let availableYears: number[] = [];
  export let selectedBookCircle: { idcode: string; no: number; textcode: string } | null = null;

  let searchText = '';
  let allAccounts: Array<{ account: number; designation: string; filterNo: number | null }> = [];

  // Separate variables per view to avoid overwriting
  let accountInputValueKontoansicht = '';
  let accountNameValueKontoansicht = '';
  let accountInputValueOp = '';
  let accountNameValueOp = '';

  // Current display values - NORMAL variables (NOT computed!)
  let accountInputValue = '';
  let accountNameValue = '';

  // Display text for selected book circle
  $: bookCircleDisplay = selectedBookCircle
    ? `${selectedBookCircle.no} - ${selectedBookCircle.textcode}`
    : '-- no selection --';

  // Use local variables - initialized from store, updated by event handlers
  let currentView = $bookingStore.currentView;
  let selectedYear = $bookingStore.selectedYear;
  let selectedMonth = $bookingStore.selectedMonth;
  let hideStornos = $bookingStore.hideStornos;

  // Sync store values reactively (critical for initial year setting from load function)
  $: currentView = $bookingStore.currentView;
  $: selectedYear = $bookingStore.selectedYear;
  $: selectedMonth = $bookingStore.selectedMonth;

  // Track previous view to detect view changes
  let previousView = '';

  // Switch display values when view changes
  $: if (previousView !== currentView) {
    if (currentView === 'kontoansicht') {
      accountInputValue = accountInputValueKontoansicht;
      accountNameValue = accountNameValueKontoansicht;
    } else if (currentView === 'op') {
      accountInputValue = accountInputValueOp;
      accountNameValue = accountNameValueOp;
    } else {
      // primanota - clear
      accountInputValue = '';
      accountNameValue = '';
    }
    previousView = currentView;
  }

  // Sync from store ONLY on initial load (not continuously!)
  let initialSyncKontoansicht = false;
  $: if (currentView === 'kontoansicht' && allAccounts.length > 0 && !initialSyncKontoansicht) {
    const account = $bookingStore.selectedAccountKontoansicht;
    if (account) {
      const accountNum = parseInt(account);
      const foundAccount = allAccounts.find(a => a.account === accountNum);
      if (foundAccount) {
        accountInputValueKontoansicht = String(foundAccount.account);
        accountNameValueKontoansicht = foundAccount.designation;
        accountInputValue = accountInputValueKontoansicht;
        accountNameValue = accountNameValueKontoansicht;
      }
      initialSyncKontoansicht = true;
    }
  }

  let initialSyncOp = false;
  $: if (currentView === 'op' && allAccounts.length > 0 && !initialSyncOp) {
    const account = $bookingStore.selectedAccountOp;
    if (account) {
      const accountNum = parseInt(account);
      const foundAccount = allAccounts.find(a => a.account === accountNum);
      if (foundAccount) {
        accountInputValueOp = String(foundAccount.account);
        accountNameValueOp = foundAccount.designation;
        accountInputValue = accountInputValueOp;
        accountNameValue = accountNameValueOp;
      }
      initialSyncOp = true;
    }
  }

  // Filter accounts for OP-View (only debtors/creditors: 10000-99999)
  // Kontoansicht: all accounts (skr04_accounts + debtors + creditors)
  $: accountsToShow = currentView === 'op'
    ? allAccounts.filter(acc => acc.account >= 10000 && acc.account <= 99999)
    : allAccounts;

  // Filter accounts as user types
  $: filteredAccounts = accountsToShow.filter(acc => {
    if (!accountInputValue) return true;
    const input = accountInputValue.toLowerCase();
    return (
      acc.account.toString().includes(input) ||
      acc.designation.toLowerCase().includes(input)
    );
  });

  // Use available years from API, fallback to current year ± 5 if not loaded yet
  const currentYear = new Date().getFullYear();
  $: years = availableYears.length > 0
    ? availableYears
    : Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  function handleYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const year = parseInt(target.value);
    bookingStore.setYear(year);
    dispatch('periodchange', { year, month: selectedMonth });
  }

  function handleMonthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    const month = value === 'All' ? 'All' : parseInt(value);
    bookingStore.setMonth(month);
    dispatch('periodchange', { year: selectedYear, month });
  }

  function openBookCircleDialog() {
    dispatch('openbookcircledialog');
  }

  function handleAccountChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const account = target.value;

    if (currentView === 'op') {
      bookingStore.setAccountOp(account);
    } else {
      bookingStore.setAccountKontoansicht(account);
    }

    dispatch('accountchange', account);
  }

  function toggleHideStornos() {
    bookingStore.toggleHideStornos();

    // Dispatch event for PrimanotaTableContainer
    // Need to use $bookingStore to get the NEW state after toggle
    // Wait for next tick to ensure store is updated
    setTimeout(() => {
      const hideStornos = $bookingStore.hideStornos;
      window.dispatchEvent(
        new CustomEvent(TABLE_EVENTS.HIDE_STORNOS_CHANGE, {
          detail: { hide: hideStornos }
        })
      );
    }, 0);
  }

  // Load all accounts for navigation
  async function loadAllAccounts() {
    try {
      const response = await fetch('/api/booking/allaccounts');
      const data = await response.json();
      if (data?.ok && Array.isArray(data?.accounts)) {
        allAccounts = data.accounts.map((r: any) => ({
          account: r.account,
          designation: r.designation || '',
          filterNo: r.filterNo || null
        }));
        console.log('Loaded accounts:', allAccounts.length);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      allAccounts = [];
    }
  }

  // Helper: Set account based on current view
  function setAccountByView(account: string) {
    if (currentView === 'op') {
      bookingStore.setAccountOp(account);
    } else {
      bookingStore.setAccountKontoansicht(account);
    }
  }

  // Select account and update view-specific variables
  function selectAccount(acc: typeof allAccounts[0]) {
    setAccountByView(String(acc.account));

    if (currentView === 'op') {
      accountInputValueOp = String(acc.account);
      accountNameValueOp = acc.designation;
      accountInputValue = accountInputValueOp;
      accountNameValue = accountNameValueOp;
    } else {
      accountInputValueKontoansicht = String(acc.account);
      accountNameValueKontoansicht = acc.designation;
      accountInputValue = accountInputValueKontoansicht;
      accountNameValue = accountNameValueKontoansicht;
    }

    dispatch('accountchange', acc.account);
  }

  // Account input handler - parse nur Account-Nummer
  function handleAccountInput(event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();

    // Parse nur Ziffern (kein "- Description" mehr!)
    const accountNum = parseInt(input);

    if (Number.isFinite(accountNum) && accountNum > 0) {
      // Finde Account in accountsToShow
      const account = accountsToShow.find(a => a.account === accountNum);

      if (account) {
        selectAccount(account);
      } else {
        // Account nicht gefunden - nur Nummer setzen, Name leer
        setAccountByView(String(accountNum));
        if (currentView === 'op') {
          accountInputValueOp = String(accountNum);
          accountNameValueOp = '';
          accountInputValue = accountInputValueOp;
          accountNameValue = accountNameValueOp;
        } else {
          accountInputValueKontoansicht = String(accountNum);
          accountNameValueKontoansicht = '';
          accountInputValue = accountInputValueKontoansicht;
          accountNameValue = accountNameValueKontoansicht;
        }
        dispatch('accountchange', accountNum);
      }
    } else if (input === '') {
      // Leeres Input - alles zurücksetzen
      setAccountByView('');
      if (currentView === 'op') {
        accountInputValueOp = '';
        accountNameValueOp = '';
        accountInputValue = accountInputValueOp;
        accountNameValue = accountNameValueOp;
      } else {
        accountInputValueKontoansicht = '';
        accountNameValueKontoansicht = '';
        accountInputValue = accountInputValueKontoansicht;
        accountNameValue = accountNameValueKontoansicht;
      }
      dispatch('accountchange', null);
    }
  }

  // Navigation functions - use accountsToShow for OP-View filter
  function first() {
    if (accountsToShow.length > 0) {
      selectAccount(accountsToShow[0]);
    }
  }

  function previous() {
    const currentAccount = parseInt(accountInputValue);
    if (!Number.isFinite(currentAccount)) return;

    const currentIndex = accountsToShow.findIndex(a => a.account === currentAccount);
    if (currentIndex > 0) {
      selectAccount(accountsToShow[currentIndex - 1]);
    }
  }

  function next() {
    const currentAccount = parseInt(accountInputValue);
    if (!Number.isFinite(currentAccount)) return;

    const currentIndex = accountsToShow.findIndex(a => a.account === currentAccount);
    if (currentIndex >= 0 && currentIndex < accountsToShow.length - 1) {
      selectAccount(accountsToShow[currentIndex + 1]);
    }
  }

  function last() {
    if (accountsToShow.length > 0) {
      selectAccount(accountsToShow[accountsToShow.length - 1]);
    }
  }

  // Load accounts when component mounts and view changes to kontoansicht/op
  $: if (currentView === 'kontoansicht' || currentView === 'op') {
    if (allAccounts.length === 0) {
      loadAllAccounts();
    }
  }

  // Months 1-12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

<div class="control-bar-container">
  <!-- YEAR SELECT: X:18px, Y:115px, W:60px, H:30px -->
  <select
    class="year-select"
    bind:value={selectedYear}
    on:change={handleYearChange}>
    {#each years as year}
      <option value={year}>{year}</option>
    {/each}
  </select>

<!-- MONTH SELECT: X:86px, Y:115px, W:55px, H:30px -->
<select
  class="month-select"
  bind:value={selectedMonth}
  on:change={handleMonthChange}>
  <option value="All">All</option>
  {#each months as month}
    <option value={month}>{month}</option>
  {/each}
</select>

<!-- PRIMANOTA CONTROLS -->
{#if currentView === 'primanota'}
  <!-- BOOK CIRCLE BUTTON: X:149px, Y:105px (Primanota) -->
  <button
    class="book-circle-button"
    on:click={openBookCircleDialog}>
    Book Circle
  </button>

  <!-- SELECTED CIRCLE DISPLAY: X:307px, Y:105px, W:150px, H:30px -->
  <input
    type="text"
    readonly
    value={bookCircleDisplay}
    placeholder="No circle selected"
    class="selected-circle-display"
    class:no-selection={!selectedBookCircle} />
{/if}

<!-- KONTOANSICHT / OP-ANSICHT CONTROLS (Navigation + Account) -->
{#if currentView === 'kontoansicht' || currentView === 'op'}
  <!-- NAVIGATION BUTTONS: X:149px-351px, Y:115px, W:30px, H:30px -->
  <div class="navigation-buttons">
    <button class="nav-btn first" on:click={first} title="First">⏮</button>
    <button class="nav-btn prev" on:click={previous} title="Previous">◀</button>

    <!-- FELD 1: Account Input (80px) mit Datalist -->
    <input
      type="text"
      class="account-input"
      list="account-suggestions"
      bind:value={accountInputValue}
      on:input={handleAccountInput}
      placeholder="Account..." />

    <!-- Datalist für Account-Vorschläge -->
    <datalist id="account-suggestions">
      {#each filteredAccounts as acc}
        <option value="{acc.account}">
          {acc.account} - {acc.designation}
        </option>
      {/each}
    </datalist>

    <button class="nav-btn next" on:click={next} title="Next">▶</button>
    <button class="nav-btn last" on:click={last} title="Last">⏭</button>
  </div>

  <!-- FELD 2: Account Name Display (225px, Read-Only) -->
  <input
    type="text"
    class="account-name-display"
    bind:value={accountNameValue}
    readonly
    placeholder="Account name..." />
{/if}

<!-- HIDE STORNOS CHECKBOX - Position depends on view -->
<div class="hide-stornos" class:primanota-pos={currentView === 'primanota'} class:other-pos={currentView !== 'primanota'}>
  <input
    type="checkbox"
    id="hide-stornos"
    class="hide-stornos-checkbox"
    bind:checked={hideStornos}
    on:change={toggleHideStornos} />
  <label for="hide-stornos">Hide Stornos</label>
</div>
</div>

<style>
  /* ==================================================================
     CONTROL BAR CONTAINER
     ================================================================== */
  .control-bar-container {
    position: relative;
    height: 120px;
    margin-left: 10px;
    z-index: 10;
  }

  /* ==================================================================
     YEAR/MONTH SELECTORS - Mess-Tabelle.md: CONTROL BAR
     ================================================================== */

  .year-select {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 60px;
    height: 30px;

    border: 1px solid rgb(51, 51, 51);
    background-color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 4px;
    box-sizing: border-box;
  }

  .month-select {
    position: absolute;
    left: 70px;
    top: 0px;
    width: 55px;
    height: 30px;

    border: 1px solid rgb(51, 51, 51);
    background-color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 4px;
    box-sizing: border-box;
  }

  /* ==================================================================
     BOOK CIRCLE BUTTON & DISPLAY (Primanota/OP)
     ================================================================== */

  .book-circle-button {
    position: absolute;
    left: 135px;
    top: 0px;
    width: 150px;
    height: 30px;

    border: 1px solid rgb(51, 51, 51);
    background-color: rgb(76, 175, 80);
    color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 600;
    padding: 0px 10px;
    box-sizing: border-box;
    cursor: pointer;
  }

  .book-circle-button:hover {
    filter: brightness(0.95);
  }

  .selected-circle-display {
    position: absolute;
    left: 290px;
    top: 0px;
    width: 250px;
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
    box-sizing: border-box;
    color: rgb(85, 85, 85);
  }

  .selected-circle-display.no-selection {
    font-style: italic;
    color: #666;
    text-align: center;
  }

  /* ==================================================================
     NAVIGATION BUTTONS (Kontoansicht/OP)
     ================================================================== */

  .navigation-buttons {
    position: absolute;
    top: 0px;
    left: 125px;
  }

  .nav-btn {
    position: absolute;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(33, 150, 243);
    border: 1px solid rgb(51, 51, 51);
    color: rgb(255, 255, 255);
    font-size: 14px;

    cursor: pointer;
    box-sizing: border-box;
  }

  .nav-btn:hover {
    filter: brightness(0.9);
  }

  .nav-btn.first {
    left: 0px;
  }

  .nav-btn.prev {
    left: 38px;
  }

  .nav-btn.next {
    left: 164px;
  }

  .nav-btn.last {
    left: 202px;
  }

  /* FELD 1: Account Input (Datalist Autocomplete) */
  .account-input {
    position: absolute;
    left: 90px;   /* Relativ zu navigation-buttons */
    width: 80px;  /* NUR 80px für Account-Nummer! */
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
    box-sizing: border-box;
  }

  /* ==================================================================
     ACCOUNT NAME DISPLAY (Kontoansicht/OP) - Read-Only
     ================================================================== */

  /* FELD 2: Account Name Display (Read-Only) */
  .account-name-display {
    position: absolute;
    left: 389px;
    top: 1px;
    width: 225px;
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);  /* Helles Grau für Read-Only */
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
    box-sizing: border-box;
    color: rgb(85, 85, 85);
    cursor: not-allowed;  /* Zeigt "nicht editierbar" */
  }

  /* ==================================================================
     HIDE STORNOS CHECKBOX - Mess-Tabelle.md: HIDE STORNOS
     ================================================================== */

  .hide-stornos {
    position: absolute;
    left: 0px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* Primanota/OP: Y:151px */
  .hide-stornos.primanota-pos {
    top: 40px;
  }

  /* Kontoansicht: Y:181px */
  .hide-stornos.other-pos {
    top: 40px;
  }

  .hide-stornos-checkbox {
    width: 14px;
    height: 14px;
    margin: 0;
    cursor: pointer;
  }

  .hide-stornos label {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(34, 34, 34);
    cursor: pointer;
    user-select: none;
  }
</style>
