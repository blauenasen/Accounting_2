<!-- src/lib/components/booking/dialogs/PdfOverwriteDialog.svelte -->
<script lang="ts">
  // PDF overwrite confirmation dialog
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  // Props
  export let visible = false;

  /**
   * Handle confirm button
   */
  function handleConfirm(): void {
    dispatch('confirm');
  }

  /**
   * Handle cancel button
   */
  function handleCancel(): void {
    dispatch('cancel');
  }

  /**
   * Handle keyboard events
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter') {
      // Default is Cancel (safe option)
      handleCancel();
    }
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={handleCancel} on:keydown={handleKeydown} role="button" tabindex="-1">
    <div class="dialog" on:click|stopPropagation role="dialog" aria-labelledby="dialog-title" tabindex="-1">
      <h2 id="dialog-title">⚠️ PDF already exists</h2>

      <div class="dialog-content">
        <p class="warning-message">
          A PDF file already exists for this booking.
        </p>
        <p class="question">
          Do you really want to overwrite the existing PDF?
        </p>
      </div>

      <div class="dialog-actions">
        <button
          type="button"
          class="btn-cancel"
          on:click={handleCancel}
          autofocus
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-confirm"
          on:click={handleConfirm}
        >
          Overwrite
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
    min-width: 450px;
    max-width: 550px;
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

  .dialog-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-cancel,
  .btn-confirm {
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-cancel {
    background: #059669;
    color: white;
  }

  .btn-cancel:hover {
    background: #047857;
  }

  .btn-cancel:focus {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }

  .btn-confirm {
    background: #dc2626;
    color: white;
  }

  .btn-confirm:hover {
    background: #b91c1c;
  }

  .btn-confirm:focus {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }
</style>
