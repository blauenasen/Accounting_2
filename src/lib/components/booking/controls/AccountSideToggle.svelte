<!-- AccountSideToggle.svelte -->
<!-- Toggle between Account and Contra Account view -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    toggle: { side: 'account' | 'contra' };
  }>();

  export let selectedSide: 'account' | 'contra' = 'account';
  export let hasBookingLoaded: boolean = false;

  /**
   * Handle side change
   */
  function handleSideChange(value: 'account' | 'contra') {
    selectedSide = value;
    dispatch('toggle', { side: value });
  }
</script>

<div class="toggle-container">
  <button
    type="button"
    class="toggle-button"
    class:active={selectedSide === 'account'}
    disabled={!hasBookingLoaded}
    on:click={() => handleSideChange('account')}
  >
    <span class="circle" class:filled={selectedSide === 'account'}></span>
    <span class="label">Account</span>
  </button>

  <button
    type="button"
    class="toggle-button"
    class:active={selectedSide === 'contra'}
    disabled={!hasBookingLoaded}
    on:click={() => handleSideChange('contra')}
  >
    <span class="circle" class:filled={selectedSide === 'contra'}></span>
    <span class="label">Contra Account</span>
  </button>
</div>

<style>
  .toggle-container {
    position: absolute;
    left: 1474px;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .toggle-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #333;
    user-select: none;
  }

  .toggle-button:hover:not(:disabled) {
    background-color: #f0f0f0;
  }

  .toggle-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .circle {
    width: 12px;
    height: 12px;
    border: 2px solid #333;
    border-radius: 50%;
    background-color: transparent;
    flex-shrink: 0;
  }

  .circle.filled {
    background-color: #333;
  }

  .label {
    font-weight: 400;
  }

  .toggle-button.active .label {
    font-weight: 500;
  }
</style>
