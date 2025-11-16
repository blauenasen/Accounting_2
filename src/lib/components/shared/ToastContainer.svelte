<script lang="ts">
  // src/lib/components/shared/ToastContainer.svelte
  // Toast notification container

  import { toastStore } from '$lib/utils/toast.js';
  import type { Toast } from '$lib/utils/toast.js';

  /**
   * Toast position
   */
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'top-right';

  /**
   * Maximum number of toasts to display
   */
  export let maxToasts: number = 5;

  /**
   * Subscribe to toast store
   */
  $: toasts = $toastStore.slice(0, maxToasts);

  /**
   * Get toast icon based on type
   */
  function getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  }

  /**
   * Dismiss a toast
   */
  function dismiss(id: string) {
    toastStore.dismiss(id);
  }
</script>

<div class="toast-container toast-{position}">
  {#each toasts as toast (toast.id)}
    <div
      class="toast toast-{toast.type}"
      role="alert"
      aria-live="polite"
    >
      <div class="toast-icon">
        {getIcon(toast.type)}
      </div>

      <div class="toast-message">
        {toast.message}
      </div>

      <button
        type="button"
        class="toast-close"
        on:click={() => dismiss(toast.id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    pointer-events: none;
  }

  /* Positions */
  .toast-top-right {
    top: 0;
    right: 0;
  }

  .toast-top-left {
    top: 0;
    left: 0;
  }

  .toast-bottom-right {
    bottom: 0;
    right: 0;
  }

  .toast-bottom-left {
    bottom: 0;
    left: 0;
  }

  .toast-top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Toast */
  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 20rem;
    max-width: 28rem;
    padding: 1rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
  }

  .toast-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .toast-message {
    flex: 1;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #374151;
  }

  .toast-close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    background: none;
    border: none;
    border-radius: 0.25rem;
    font-size: 1.25rem;
    color: #9ca3af;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
  }

  .toast-close:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .toast-close:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  /* Types */
  .toast-success .toast-icon {
    background-color: #d1fae5;
    color: #059669;
  }

  .toast-error .toast-icon {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .toast-warning .toast-icon {
    background-color: #fef3c7;
    color: #d97706;
  }

  .toast-info .toast-icon {
    background-color: #dbeafe;
    color: #2563eb;
  }

  /* Animations */
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast-top-left @keyframes slideIn {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast-bottom-right @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .toast-bottom-left @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
