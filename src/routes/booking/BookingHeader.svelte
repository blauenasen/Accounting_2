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

<!-- PAGE HEADER -->
<div class="page-header">
  <h1 class="booking-h1">BOOKING</h1>
  <div class="status-box">{statusText}</div>
</div>

<!-- ICON CONTAINER -->
<div class="icon-container">
  <!-- B001: Primanota -->
  <button
    type="button"
    class="icon-button"
    class:active={currentView === 'primanota'}
    data-tip-key="B001"
    on:click={() => setView('primanota')}
    title="Primanota"
    aria-description="Primanota">
    <img src="/img/Primanota.png" alt="icon" />
  </button>

  <!-- B002: Konto -->
  <button
    type="button"
    class="icon-button"
    class:active={currentView === 'kontoansicht'}
    data-tip-key="B002"
    on:click={() => setView('kontoansicht')}
    title="Account"
    aria-description="Account">
    <img src="/img/Konto.png" alt="icon" />
  </button>

  <!-- B003: OP -->
  <button
    type="button"
    class="icon-button"
    class:active={currentView === 'op'}
    data-tip-key="B003"
    on:click={() => setView('op')}
    title="Open Items"
    aria-description="Open Items">
    <img src="/img/OP.png" alt="icon" />
  </button>

  <!-- B004: Lupe (Filter) -->
  <button
    type="button"
    class="icon-button"
    data-tip-key="B004"
    on:click={toggleFilter}
    title="Filter"
    aria-description="Turn filters on and off">
    <img src="/img/Lupe.png" alt="icon" />
  </button>

  <!-- B005-B010: Platzhalter -->
  {#each ['B005', 'B006', 'B007', 'B008', 'B009', 'B010'] as circle}
    <button
      type="button"
      class="icon-button"
      data-tip-key={circle}
      on:click={() => selectBookCircle(circle)}
      title={circle}
      aria-description={circle}>
      <img src="/img/Platzhalter.png" alt="icon" />
    </button>
  {/each}
</div>

<style>
  .page-header {
    display: flex;
    position: relative;
    width: calc(100vw - 16px);
    margin: 0px 0px 8px;
  }

  .booking-h1 {
    display: block;
    position: static;
    width: 1439.75px;
    height: 25px;
    margin: 0px 0px 0px 10px;
    padding: 0;

    font-family: Helvetica, Arial, sans-serif;
    font-size: 25px;
    font-weight: 700;
    line-height: 25px;
    color: rgb(0, 0, 0);

    background-color: rgb(200, 231, 141);
  }

  .status-box {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 11px;
    font-weight: 400;
    color: rgb(55, 48, 163);
  }

  .icon-container {
    display: flex;
    position: absolute;
    top: -2px;
    left: 200px;
    gap: 15px;
  }

  .icon-button {
    display: block;
    position: static;
    width: 28px;
    height: 28px;
    padding: 2px;

    background-color: transparent;
    border: 0px none;
    border-radius: 0px;

    cursor: pointer;
  }

  .icon-button img {
    width: 24px;
    height: 24px;
    display: block;
  }

  .icon-button.active {
    border: 2px solid rgb(6, 161, 58);
    padding: 0px;
  }
</style>
