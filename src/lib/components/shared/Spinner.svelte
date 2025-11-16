<script lang="ts">
  // src/lib/components/shared/Spinner.svelte
  // Loading spinner component

  /**
   * Spinner size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Spinner color variant
   */
  export let variant: 'primary' | 'secondary' | 'white' = 'primary';

  /**
   * Loading text (optional)
   */
  export let text: string | undefined = undefined;

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  /**
   * Computed spinner classes
   */
  $: spinnerClasses = [
    'spinner',
    `spinner-${size}`,
    `spinner-${variant}`,
    className
  ]
    .filter(Boolean)
    .join(' ');
</script>

<div class="spinner-wrapper" {...$$restProps}>
  <div class={spinnerClasses} role="status" aria-label="Loading">
    <div class="spinner-circle"></div>
    <div class="spinner-circle"></div>
    <div class="spinner-circle"></div>
    <div class="spinner-circle"></div>
  </div>

  {#if text}
    <span class="spinner-text">{text}</span>
  {:else if $$slots.default}
    <span class="spinner-text">
      <slot />
    </span>
  {/if}
</div>

<style>
  .spinner-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
  }

  .spinner {
    position: relative;
    display: inline-block;
  }

  /* Sizes */
  .spinner-small {
    width: 1rem;
    height: 1rem;
  }

  .spinner-medium {
    width: 2rem;
    height: 2rem;
  }

  .spinner-large {
    width: 3rem;
    height: 3rem;
  }

  /* Spinner circles */
  .spinner-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .spinner-circle:nth-child(1) {
    animation-delay: -0.45s;
  }

  .spinner-circle:nth-child(2) {
    animation-delay: -0.3s;
  }

  .spinner-circle:nth-child(3) {
    animation-delay: -0.15s;
  }

  /* Variants */
  .spinner-primary .spinner-circle {
    border-top-color: #3b82f6;
    border-right-color: #3b82f6;
  }

  .spinner-secondary .spinner-circle {
    border-top-color: #6b7280;
    border-right-color: #6b7280;
  }

  .spinner-white .spinner-circle {
    border-top-color: #ffffff;
    border-right-color: #ffffff;
  }

  /* Text */
  .spinner-text {
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* Animation */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
