<!-- src/lib/components/booking/dialogs/DuplicateWarningDialog.svelte -->
<script lang="ts">
  // Duplicate booking warning dialog
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    cancel: void;
    confirm: void;
  }>();

  // Props
  export let visible = false;
  export let duplicateInfo: {
    ue?: number;
    kto?: number;
    gegKto?: number;
    sh?: string;
    belNr?: string;
  } = {};

  /**
   * Handle cancel (No button)
   */
  function handleNo(): void {
    visible = false;
    dispatch('cancel');
  }

  /**
   * Handle confirm (Yes button)
   */
  function handleYes(): void {
    visible = false;
    dispatch('confirm');
  }
</script>

{#if visible}
  <div class="modal-overlay" on:click={handleNo} role="presentation">
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-labelledby="dialog-title">
      <div class="modal-header">
        <h2 id="dialog-title">⚠️ Duplicate Booking Warning</h2>
        <button class="close-btn" on:click={handleNo} aria-label="Close dialog">&times;</button>
      </div>

      <div class="modal-body">
        <p class="warning-text">
          A booking with the following values already exists:
        </p>
        <table class="info-table">
          <tbody>
            <tr>
              <td class="label">UE:</td>
              <td class="value">{duplicateInfo.ue || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Account (HK):</td>
              <td class="value">{duplicateInfo.kto || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Contra Account (CK):</td>
              <td class="value">{duplicateInfo.gegKto || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">SH:</td>
              <td class="value">{duplicateInfo.sh || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Document Number:</td>
              <td class="value">{duplicateInfo.belNr || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        <p class="question-text">
          Do you want to create this booking anyway?
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-no" on:click={handleNo}>No (Cancel)</button>
        <button class="btn-yes" on:click={handleYes}>Yes (Continue)</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 3px solid #f59e0b;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #fef3c7;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #92400e;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #92400e;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.15s ease-in-out;
  }

  .close-btn:hover {
    background: #fde68a;
  }

  .modal-body {
    padding: 20px;
  }

  .warning-text {
    margin: 0 0 16px 0;
    font-weight: 600;
    color: #92400e;
  }

  .info-table {
    width: 100%;
    margin: 0 0 20px 0;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    border-collapse: collapse;
  }

  .info-table tr {
    border-bottom: 1px solid #e5e7eb;
  }

  .info-table tr:last-child {
    border-bottom: none;
  }

  .info-table td {
    padding: 8px 12px;
  }

  .info-table .label {
    font-weight: 600;
    color: #374151;
    width: 150px;
    background: #f9fafb;
  }

  .info-table .value {
    color: #1f2937;
    font-family: 'Courier New', monospace;
  }

  .question-text {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    background: #fef3c7;
  }

  .btn-no,
  .btn-yes {
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: background-color 0.15s ease-in-out;
  }

  .btn-no {
    background: #6b7280;
    color: white;
  }

  .btn-no:hover {
    background: #4b5563;
  }

  .btn-yes {
    background: #f59e0b;
    color: white;
  }

  .btn-yes:hover {
    background: #d97706;
  }
</style>
