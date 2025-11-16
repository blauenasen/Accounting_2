<!-- src/lib/components/booking/dialogs/DateMonthMismatchDialog.svelte -->
<script lang="ts">
  // Date-month mismatch dialog
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    close: void;
    changeMonth: { newMonth: number };
    correctDate: { targetMonth: number };
  }>();

  // Props
  export let visible = false;
  export let dateMonth: number | null = null;
  export let selectedMonth: number | null = null;
  export let currentDate = '';

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  /**
   * Close dialog
   */
  function close(): void {
    dispatch('close');
  }

  /**
   * Change month filter to match date
   */
  function changeMonth(): void {
    if (dateMonth !== null) {
      dispatch('changeMonth', { newMonth: dateMonth });
      close();
    }
  }

  /**
   * Correct date to match selected month
   */
  function correctDate(): void {
    if (selectedMonth !== null) {
      dispatch('correctDate', { targetMonth: selectedMonth });
      close();
    }
  }

  /**
   * Handle keyboard events
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      close();
    }
  }

  /**
   * Get month names
   */
  $: dateMonthName = dateMonth ? monthNames[dateMonth] : dateMonth;
  $: selectedMonthName = selectedMonth ? monthNames[selectedMonth] : selectedMonth;
</script>

{#if visible}
  <div class="dialog-overlay" on:click={close} on:keydown={handleKeydown} role="presentation">
    <div class="dialog" on:click|stopPropagation role="dialog" aria-labelledby="dialog-title">
      <h2 id="dialog-title">Date-Month Mismatch</h2>

      <div class="dialog-content">
        <p>The booking date <strong>{currentDate}</strong> is in <strong>{dateMonthName}</strong>,</p>
        <p>but the selected month is <strong>{selectedMonthName}</strong>.</p>
        <p>What would you like to do?</p>
      </div>

      <div class="dialog-buttons">
        <button type="button" class="btn-secondary" on:click={close}>Cancel</button>
        <button type="button" class="btn-primary" on:click={correctDate}>
          Correct Date to {selectedMonthName}
        </button>
        <button type="button" class="btn-primary" on:click={changeMonth}>
          Change Month to {dateMonthName}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    padding: 24px;
    min-width: 500px;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }

  .dialog-content {
    margin-bottom: 24px;
  }

  .dialog-content p {
    margin: 8px 0;
    color: #555;
    font-size: 14px;
  }

  .dialog-content strong {
    color: #ea580c;
    font-weight: 600;
  }

  .dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-secondary,
  .btn-primary {
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.15s ease-in-out;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover {
    background: #4b5563;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }
</style>
