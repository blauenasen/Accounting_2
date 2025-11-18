<!-- src/lib/components/booking/dialogs/ValidationErrorDialog.svelte -->
<script lang="ts">
  // Validation errors dialog
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  // Props
  export let visible = false;
  export let errors: string[] = [];

  /**
   * Close dialog
   */
  function close(): void {
    visible = false;
    dispatch('close');
  }
</script>

{#if visible}
  <div
    class="validation-overlay"
    on:click={close}
    on:keydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="-1"
  >
    <div
      class="validation-dialog"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-labelledby="validation-dialog-title"
      tabindex="-1"
    >
      <div class="validation-header">
        <h2 id="validation-dialog-title">Validation Failed</h2>
      </div>
      <div class="validation-body">
        <p>Please correct the following errors:</p>
        <ul class="validation-errors">
          {#each errors as error, i}
            <li>{i + 1}. {error}</li>
          {/each}
        </ul>
      </div>
      <div class="validation-footer">
        <button class="validation-close-btn" on:click={close}>
          OK
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .validation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  }

  .validation-dialog {
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    min-width: 400px;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .validation-header {
    margin-bottom: 16px;
  }

  .validation-header h2 {
    margin: 0;
    font-size: 18px;
    color: #dc2626;
  }

  .validation-body {
    margin-bottom: 16px;
  }

  .validation-body p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #374151;
  }

  .validation-errors {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .validation-errors li {
    padding: 8px 12px;
    margin-bottom: 8px;
    background-color: #fef2f2;
    border-left: 4px solid #dc2626;
    font-size: 13px;
    color: #991b1b;
  }

  .validation-footer {
    display: flex;
    justify-content: flex-end;
  }

  .validation-close-btn {
    padding: 8px 16px;
    background-color: #2196f3;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.15s ease-in-out;
  }

  .validation-close-btn:hover {
    background-color: #0b7dda;
  }
</style>
