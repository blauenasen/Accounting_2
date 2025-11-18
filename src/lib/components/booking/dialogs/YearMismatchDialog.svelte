<!-- src/lib/components/booking/dialogs/YearMismatchDialog.svelte -->
<script lang="ts">
  // Year mismatch warning dialog (two-stage confirmation)
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    yes: void;
    no: void;
  }>();

  // Props
  export let visible = false;
  export let selectedYear: string | null = '';
  export let bookingYear: number | null = null;
  export let confirmationStage = 1; // 1 = first dialog, 2 = second dialog

  /**
   * Handle Yes button
   */
  function handleYes(): void {
    dispatch('yes');
  }

  /**
   * Handle No button
   */
  function handleNo(): void {
    dispatch('no');
  }

  /**
   * Handle keyboard events
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      handleNo();
    } else if (event.key === 'Enter') {
      // Default is No, so Enter should trigger No
      handleNo();
    }
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={handleNo} on:keydown={handleKeydown} role="button" tabindex="-1">
    <div class="dialog" on:click|stopPropagation role="dialog" aria-labelledby="dialog-title" tabindex="-1">
      {#if confirmationStage === 1}
        <h2 id="dialog-title">⚠️ Year Mismatch Warning</h2>

        <div class="dialog-content">
          <p class="warning-message">
            You have selected year <strong>{selectedYear}</strong> in the filter,
            but the booking date contains year <strong>{bookingYear}</strong>.
          </p>
          <p class="question">
            Do you want to save this booking with a different year?
          </p>
        </div>
      {:else}
        <h2 id="dialog-title">⚠️ Final Confirmation</h2>

        <div class="dialog-content">
          <p class="warning-message">
            Are you absolutely sure you want to save this booking with year <strong>{bookingYear}</strong>
            while the filter is set to year <strong>{selectedYear}</strong>?
          </p>
        </div>
      {/if}

      <div class="dialog-actions">
        <button
          type="button"
          class="btn-no"
          on:click={handleNo}
          autofocus
        >
          No
        </button>
        <button
          type="button"
          class="btn-yes"
          on:click={handleYes}
        >
          Yes
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    padding: 24px;
    min-width: 500px;
    max-width: 600px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    color: #d97706;
  }

  .dialog-content {
    margin-bottom: 24px;
  }

  .warning-message {
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 16px 0;
    color: #374151;
  }

  .question {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  strong {
    color: #dc2626;
    font-weight: 700;
  }

  .dialog-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-no,
  .btn-yes {
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-no {
    background: #059669;
    color: white;
  }

  .btn-no:hover {
    background: #047857;
  }

  .btn-no:focus {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }

  .btn-yes {
    background: #dc2626;
    color: white;
  }

  .btn-yes:hover {
    background: #b91c1c;
  }

  .btn-yes:focus {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }
</style>
