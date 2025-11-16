<script lang="ts">
  // src/lib/components/shared/Button.svelte
  // Reusable button component with variants

  /**
   * Button variant
   */
  export let variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' = 'primary';

  /**
   * Button size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Button type
   */
  export let type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Disabled state
   */
  export let disabled: boolean = false;

  /**
   * Loading state
   */
  export let loading: boolean = false;

  /**
   * Icon (optional)
   */
  export let icon: string | undefined = undefined;

  /**
   * Full width button
   */
  export let fullWidth: boolean = false;

  /**
   * Click handler
   */
  export let onClick: (() => void) | undefined = undefined;

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  /**
   * Computed button classes
   */
  $: buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle button click
   */
  function handleClick(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }

    if (onClick) {
      onClick();
    }
  }
</script>

<button
  {type}
  class={buttonClasses}
  disabled={disabled || loading}
  on:click={handleClick}
  {...$$restProps}
>
  {#if loading}
    <span class="btn-spinner" aria-label="Loading">⟳</span>
  {:else if icon}
    <span class="btn-icon">{icon}</span>
  {/if}

  {#if $$slots.default}
    <span class="btn-text">
      <slot />
    </span>
  {/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    white-space: nowrap;
    text-decoration: none;
    user-select: none;
  }

  .btn:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }

  /* Sizes */
  .btn-small {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }

  .btn-medium {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  /* Variants */
  .btn-primary {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: #ffffff;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
    border-color: #2563eb;
  }

  .btn-secondary {
    background-color: #6b7280;
    border-color: #6b7280;
    color: #ffffff;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #4b5563;
    border-color: #4b5563;
  }

  .btn-danger {
    background-color: #ef4444;
    border-color: #ef4444;
    color: #ffffff;
  }

  .btn-danger:hover:not(:disabled) {
    background-color: #dc2626;
    border-color: #dc2626;
  }

  .btn-success {
    background-color: #10b981;
    border-color: #10b981;
    color: #ffffff;
  }

  .btn-success:hover:not(:disabled) {
    background-color: #059669;
    border-color: #059669;
  }

  .btn-warning {
    background-color: #f59e0b;
    border-color: #f59e0b;
    color: #ffffff;
  }

  .btn-warning:hover:not(:disabled) {
    background-color: #d97706;
    border-color: #d97706;
  }

  /* States */
  .btn-disabled,
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-loading {
    position: relative;
    pointer-events: none;
  }

  .btn-full-width {
    width: 100%;
  }

  /* Icon */
  .btn-icon {
    display: inline-flex;
    align-items: center;
    font-size: 1.25em;
  }

  /* Spinner */
  .btn-spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Text */
  .btn-text {
    display: inline-block;
  }
</style>
