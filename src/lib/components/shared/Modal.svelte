<script lang="ts">
  // src/lib/components/shared/Modal.svelte
  // Modal dialog component

  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  /**
   * Modal open state
   */
  export let isOpen: boolean = false;

  /**
   * Modal title
   */
  export let title: string | undefined = undefined;

  /**
   * Modal size
   */
  export let size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';

  /**
   * Closeable (show close button and allow escape/backdrop click)
   */
  export let closeable: boolean = true;

  /**
   * Show close button
   */
  export let showCloseButton: boolean = true;

  /**
   * Close on backdrop click
   */
  export let closeOnBackdrop: boolean = true;

  /**
   * Close on escape key
   */
  export let closeOnEscape: boolean = true;

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
  }>();

  /**
   * Computed modal classes
   */
  $: modalClasses = [
    'modal-content',
    `modal-${size}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Close the modal
   */
  export function close() {
    if (!closeable) return;

    isOpen = false;
    dispatch('close');
  }

  /**
   * Open the modal
   */
  export function open() {
    isOpen = true;
    dispatch('open');
  }

  /**
   * Handle backdrop click
   */
  function handleBackdropClick(event: MouseEvent) {
    if (!closeable || !closeOnBackdrop) return;

    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      close();
    }
  }

  /**
   * Handle escape key
   */
  function handleEscape(event: KeyboardEvent) {
    if (!closeable || !closeOnEscape) return;

    if (event.key === 'Escape') {
      close();
    }
  }

  /**
   * Add escape listener on mount
   */
  onMount(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
  });

  /**
   * Clean up on destroy
   */
  onDestroy(() => {
    document.removeEventListener('keydown', handleEscape);
  });

  /**
   * Watch isOpen changes
   */
  $: {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    }
  }
</script>

{#if isOpen}
  <div
    class="modal-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleEscape}
    role="presentation"
  >
    <div class={modalClasses} role="dialog" aria-modal="true">
      {#if title || showCloseButton}
        <div class="modal-header">
          {#if title}
            <h2 class="modal-title">{title}</h2>
          {/if}

          {#if closeable && showCloseButton}
            <button
              type="button"
              class="modal-close"
              on:click={close}
              aria-label="Close modal"
            >
              ✕
            </button>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        <slot />
      </div>

      {#if $$slots.footer}
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Sizes */
  .modal-small {
    width: 100%;
    max-width: 28rem;
  }

  .modal-medium {
    width: 100%;
    max-width: 42rem;
  }

  .modal-large {
    width: 100%;
    max-width: 56rem;
  }

  .modal-fullscreen {
    width: 100%;
    height: calc(100vh - 2rem);
    max-width: 100%;
  }

  /* Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    margin: -0.5rem -0.5rem -0.5rem 0;
    background: none;
    border: none;
    border-radius: 0.25rem;
    font-size: 1.5rem;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
  }

  .modal-close:hover {
    background-color: #f3f4f6;
    color: #111827;
  }

  .modal-close:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }

  /* Body */
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  /* Animations */
  .modal-backdrop {
    animation: fadeIn 0.2s ease-in-out;
  }

  .modal-content {
    animation: slideIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-1rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
