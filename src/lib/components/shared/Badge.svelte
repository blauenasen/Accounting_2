<script lang="ts">
  // src/lib/components/shared/Badge.svelte
  // Status badge component

  /**
   * Badge variant/color
   */
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';

  /**
   * Badge size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Rounded badge (pill shape)
   */
  export let rounded: boolean = false;

  /**
   * Badge icon (optional)
   */
  export let icon: string | undefined = undefined;

  /**
   * Removable badge (shows close button)
   */
  export let removable: boolean = false;

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  /**
   * Computed badge classes
   */
  $: badgeClasses = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    rounded ? 'badge-rounded' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle remove click
   */
  function handleRemove(event: MouseEvent) {
    event.stopPropagation();
  }
</script>

<span class={badgeClasses} {...$$restProps}>
  {#if icon}
    <span class="badge-icon">{icon}</span>
  {/if}

  <span class="badge-text">
    <slot />
  </span>

  {#if removable}
    <button
      type="button"
      class="badge-remove"
      on:click={handleRemove}
      aria-label="Remove badge"
    >
      ✕
    </button>
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    border-radius: 0.25rem;
    white-space: nowrap;
  }

  /* Sizes */
  .badge-small {
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
  }

  .badge-medium {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .badge-large {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Rounded */
  .badge-rounded {
    border-radius: 9999px;
  }

  /* Variants */
  .badge-primary {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .badge-secondary {
    background-color: #f3f4f6;
    color: #4b5563;
  }

  .badge-success {
    background-color: #d1fae5;
    color: #065f46;
  }

  .badge-danger {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .badge-warning {
    background-color: #fef3c7;
    color: #92400e;
  }

  .badge-info {
    background-color: #e0e7ff;
    color: #3730a3;
  }

  /* Icon */
  .badge-icon {
    display: inline-flex;
    align-items: center;
    font-size: 1em;
  }

  /* Text */
  .badge-text {
    display: inline-block;
  }

  /* Remove button */
  .badge-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    padding: 0;
    margin-left: 0.125rem;
    background: none;
    border: none;
    border-radius: 0.125rem;
    font-size: 0.875em;
    color: currentColor;
    opacity: 0.7;
    cursor: pointer;
    transition: opacity 0.15s ease-in-out, background-color 0.15s ease-in-out;
  }

  .badge-remove:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .badge-remove:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
</style>
