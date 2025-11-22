<!-- BookingHeader.svelte -->
<!-- H1 Header + Status Text + View Mode Buttons + Book Circle Buttons -->
<!-- Measurements from Mess-Tabelle.md -->

<script lang="ts">
  export let statusText: string = '';
  export let currentView: 'primanota' | 'kontoansicht' | 'op' = 'primanota';

  // Event dispatchers for view changes
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function setView(view: 'primanota' | 'kontoansicht' | 'op') {
    dispatch('viewchange', view);
  }

  function toggleFilter() {
    dispatch('togglefilter');
  }

  function selectBookCircle(circle: string) {
    dispatch('selectbookcircle', circle);
  }
</script>

<!-- H1 HEADER: X:18px, Y:59px, W:1439.75px, H:25px -->
<h1 class="booking-h1">BOOKING</h1>

<!-- STATUS TEXT: X:1467.75px, Y:59px, W:242.25px, H:26px -->
<div class="booking-status">{statusText}</div>

<!-- VIEW MODE BUTTONS: Y:57px, gap:15px, W:28px, H:28px -->
<div class="view-mode-buttons">
  <!-- Primanota: X:208px -->
  <button
    class="view-btn primanota"
    class:active={currentView === 'primanota'}
    on:click={() => setView('primanota')}
    title="Primanota View"
    aria-label="Primanota View">
    📋
  </button>

  <!-- Kontoansicht: X:251px -->
  <button
    class="view-btn kontoansicht"
    class:active={currentView === 'kontoansicht'}
    on:click={() => setView('kontoansicht')}
    title="Account View"
    aria-label="Account View">
    📁
  </button>

  <!-- OP-Ansicht: X:294px -->
  <button
    class="view-btn op"
    class:active={currentView === 'op'}
    on:click={() => setView('op')}
    title="Open Items View"
    aria-label="Open Items View">
    ✓
  </button>

  <!-- Filter Toggle: X:337px -->
  <button
    class="view-btn filter"
    on:click={toggleFilter}
    title="Turn filters on and off"
    aria-label="Toggle filters">
    🔍
  </button>
</div>

<!-- BOOK CIRCLE BUTTONS: X:380px-595px, gap:15px -->
<div class="book-circle-buttons">
  {#each ['B005', 'B006', 'B007', 'B008', 'B009', 'B0010'] as circle, index}
    <button
      class="book-circle-btn"
      on:click={() => selectBookCircle(circle)}
      title={circle}
      aria-label={`Book Circle ${circle}`}
      style="left: {380 + index * 43}px;">
      {circle}
    </button>
  {/each}
</div>

<style>
  /* ==================================================================
     H1 HEADER - Mess-Tabelle.md: H1 HEADER SECTION
     ================================================================== */

  .booking-h1 {
    position: absolute;
    left: 18px;
    top: 59px;
    width: 1439.75px;
    height: 25px;
    margin: 0;
    margin-left: 10px;
    padding: 0;

    font-family: Helvetica, Arial, sans-serif;
    font-size: 25px;
    font-weight: 700;
    line-height: 25px;
    color: rgb(0, 0, 0);

    background-color: rgb(200, 231, 141);
  }

  /* ==================================================================
     STATUS TEXT - Mess-Tabelle.md: H1 HEADER SECTION
     ================================================================== */

  .booking-status {
    position: absolute;
    left: 1467.75px;
    top: 59px;
    width: 242.25px;
    height: 26px;

    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    font-weight: 400;
    color: rgb(55, 48, 163);
    background-color: transparent;
  }

  /* ==================================================================
     VIEW MODE BUTTONS - Mess-Tabelle.md: VIEW MODE BUTTONS
     ================================================================== */

  .view-mode-buttons {
    position: absolute;
    top: 57px;
    left: 208px;
    display: flex;
    gap: 15px;
  }

  .view-btn {
    width: 28px;
    height: 28px;
    padding: 2px;

    background-color: transparent;
    border: 0px none;
    border-radius: 0px;

    font-size: 16px;
    cursor: pointer;
    user-select: none;

    transition: border 0.15s ease, padding 0.15s ease;
  }

  .view-btn:hover {
    opacity: 0.8;
  }

  /* Active State: Green border, padding 0px */
  .view-btn.active {
    border: 2px solid rgb(6, 161, 58);
    padding: 0px;
  }

  /* ==================================================================
     BOOK CIRCLE BUTTONS - Mess-Tabelle.md: BOOK CIRCLE SELECTOR BUTTONS
     ================================================================== */

  .book-circle-buttons {
    position: absolute;
    top: 57px;
    /* left positions set inline per button */
  }

  .book-circle-btn {
    position: absolute;
    width: 28px;
    height: 28px;
    padding: 2px;

    background-color: transparent;
    border: 0px none;
    border-radius: 0px;

    font-family: Helvetica, Arial, sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: rgb(34, 34, 34);

    cursor: pointer;
    user-select: none;
  }

  .book-circle-btn:hover {
    background-color: rgba(6, 161, 58, 0.1);
  }

  .book-circle-btn:active {
    background-color: rgba(6, 161, 58, 0.2);
  }
</style>
