<!-- BookingControlBar.svelte -->
<!-- Year/Month Selectors + Navigation + Book Circle / Account Selector + Hide Stornos -->
<!-- Measurements from Mess-Tabelle.md -->

<script lang="ts">
  import { bookingStore } from '$lib/stores/bookingStore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let selectedYear = 2024;
  let selectedMonth = 12;
  let selectedBookCircle = 'Bank 1';
  let selectedAccount = '';
  let hideStornos = false;
  let searchText = '';

  $: currentView = $bookingStore.currentView;

  // Subscribe to store
  bookingStore.subscribe(state => {
    selectedYear = state.selectedYear;
    selectedMonth = state.selectedMonth;
    selectedBookCircle = state.selectedBookCircle;
    selectedAccount = state.selectedAccount;
    hideStornos = state.hideStornos;
  });

  function handleYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedYear = parseInt(target.value);
    bookingStore.setYear(selectedYear);
    dispatch('periodchange', { year: selectedYear, month: selectedMonth });
  }

  function handleMonthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedMonth = parseInt(target.value);
    bookingStore.setMonth(selectedMonth);
    dispatch('periodchange', { year: selectedYear, month: selectedMonth });
  }

  function openBookCircleDialog() {
    dispatch('openbookcircledialog');
  }

  function handleAccountChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedAccount = target.value;
    bookingStore.setAccount(selectedAccount);
    dispatch('accountchange', selectedAccount);
  }

  function toggleHideStornos() {
    hideStornos = !hideStornos;
    bookingStore.toggleHideStornos();
    dispatch('togglehidestornos', hideStornos);
  }

  // Navigation functions
  function first() { dispatch('navfirst'); }
  function previous() { dispatch('navprevious'); }
  function next() { dispatch('navnext'); }
  function last() { dispatch('navlast'); }

  // Years for dropdown (current year ± 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Months 1-12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

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
  {#each months as month}
    <option value={month}>{month}</option>
  {/each}
</select>

<!-- PRIMANOTA / OP-ANSICHT CONTROLS -->
{#if currentView === 'primanota' || currentView === 'op'}
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
    value={selectedBookCircle}
    class="selected-circle-display" />
{/if}

<!-- KONTOANSICHT / OP-ANSICHT CONTROLS (Navigation + Account) -->
{#if currentView === 'kontoansicht' || currentView === 'op'}
  <!-- NAVIGATION BUTTONS: X:149px-351px, Y:115px, W:30px, H:30px -->
  <div class="navigation-buttons">
    <button class="nav-btn first" on:click={first} title="First">⏮</button>
    <button class="nav-btn prev" on:click={previous} title="Previous">◀</button>
    <input
      type="text"
      class="search-input"
      bind:value={searchText}
      placeholder="Search..." />
    <button class="nav-btn next" on:click={next} title="Next">▶</button>
    <button class="nav-btn last" on:click={last} title="Last">⏭</button>
  </div>

  <!-- ACCOUNT SELECTOR: X:389px, Y:115px, W:225px, H:30px -->
  <input
    type="text"
    readonly
    class="account-selector"
    value={selectedAccount || 'Suche...'}
    placeholder="Suche..." />
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

<style>
  /* ==================================================================
     YEAR/MONTH SELECTORS - Mess-Tabelle.md: CONTROL BAR
     ================================================================== */

  .year-select {
    position: absolute;
    left: 18px;
    top: 115px;
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
    left: 86px;
    top: 115px;
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
    left: 149px;
    top: 105px;
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
    left: 307px;
    top: 105px;
    width: 150px;
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
    box-sizing: border-box;
    color: rgb(85, 85, 85);
  }

  /* ==================================================================
     NAVIGATION BUTTONS (Kontoansicht/OP)
     ================================================================== */

  .navigation-buttons {
    position: absolute;
    top: 115px;
    left: 149px;
  }

  .nav-btn {
    position: absolute;
    width: 30px;
    height: 30px;

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

  .search-input {
    position: absolute;
    left: 76px;
    width: 80px;
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(255, 255, 255);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
    box-sizing: border-box;
  }

  /* ==================================================================
     ACCOUNT SELECTOR (Kontoansicht/OP)
     ================================================================== */

  .account-selector {
    position: absolute;
    left: 389px;
    top: 115px;
    width: 225px;
    height: 30px;

    border: 1px solid rgb(204, 204, 204);
    background-color: rgb(249, 249, 249);
    font-size: 12px;
    font-family: Arial;
    padding: 0px 6px;
    box-sizing: border-box;
    color: rgb(85, 85, 85);
  }

  /* ==================================================================
     HIDE STORNOS CHECKBOX - Mess-Tabelle.md: HIDE STORNOS
     ================================================================== */

  .hide-stornos {
    position: absolute;
    left: 30px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* Primanota/OP: Y:151px */
  .hide-stornos.primanota-pos {
    top: 151px;
  }

  /* Kontoansicht: Y:181px */
  .hide-stornos.other-pos {
    top: 181px;
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
