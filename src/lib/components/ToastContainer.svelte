<script>
  import { toastStore } from '$lib/utils/toast';
  import { fade, fly } from 'svelte/transition';

  $: toasts = $toastStore;

  function getIcon(type) {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  }

  function getColor(type) {
    switch (type) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div
      class="toast toast-{toast.type}"
      style="--toast-color: {getColor(toast.type)}"
      transition:fly={{ y: -20, duration: 300 }}
    >
      <span class="toast-icon">{getIcon(toast.type)}</span>
      <span class="toast-message">{toast.message}</span>
      <button
        class="toast-close"
        on:click={() => toastStore.dismiss(toast.id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border-left: 4px solid var(--toast-color);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    line-height: 1.4;
    color: #1f2937;
  }

  .toast-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--toast-color);
    color: white;
    font-weight: bold;
    font-size: 16px;
  }

  .toast-message {
    flex: 1;
    word-break: break-word;
  }

  .toast-close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #6b7280;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }

  .toast-close:hover {
    color: #1f2937;
  }

  /* Typ-spezifische Styles */
  .toast-success {
    background: #f0fdf4;
  }

  .toast-error {
    background: #fef2f2;
  }

  .toast-warning {
    background: #fffbeb;
  }

  .toast-info {
    background: #eff6ff;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .toast-container {
      left: 10px;
      right: 10px;
      max-width: none;
    }

    .toast {
      font-size: 13px;
    }
  }
</style>
