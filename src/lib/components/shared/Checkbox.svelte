<script lang="ts">
  // src/lib/components/shared/Checkbox.svelte
  // Reusable checkbox component

  /**
   * Checked state
   */
  export let checked: boolean = false;

  /**
   * Checkbox name
   */
  export let name: string | undefined = undefined;

  /**
   * Checkbox label
   */
  export let label: string | undefined = undefined;

  /**
   * Disabled state
   */
  export let disabled: boolean = false;

  /**
   * Indeterminate state (for "select all")
   */
  export let indeterminate: boolean = false;

  /**
   * Checkbox size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Error message
   */
  export let error: string | undefined = undefined;

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  /**
   * Unique ID for checkbox
   */
  let checkboxId = name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Computed checkbox classes
   */
  $: checkboxClasses = [
    'checkbox',
    `checkbox-${size}`,
    error ? 'checkbox-error' : '',
    disabled ? 'checkbox-disabled' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle checkbox change
   */
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
  }
</script>

<div class="checkbox-wrapper">
  <label class="checkbox-label" for={checkboxId}>
    <input
      id={checkboxId}
      type="checkbox"
      {name}
      {checked}
      {disabled}
      {indeterminate}
      class={checkboxClasses}
      on:change={handleChange}
      on:focus
      on:blur
      {...$$restProps}
    />

    {#if label}
      <span class="checkbox-text">{label}</span>
    {:else if $$slots.default}
      <span class="checkbox-text">
        <slot />
      </span>
    {/if}
  </label>

  {#if error}
    <div class="checkbox-error-message" role="alert">
      {error}
    </div>
  {/if}
</div>

<style>
  .checkbox-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }

  .checkbox {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    background-color: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    appearance: none;
    position: relative;
  }

  .checkbox:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }

  .checkbox:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.375rem;
    height: 0.625rem;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -60%) rotate(45deg);
  }

  .checkbox:indeterminate {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }

  .checkbox:indeterminate::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.5rem;
    height: 2px;
    background-color: #ffffff;
  }

  .checkbox:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .checkbox:hover:not(:disabled) {
    border-color: #3b82f6;
  }

  /* Sizes */
  .checkbox-small {
    width: 0.875rem;
    height: 0.875rem;
  }

  .checkbox-medium {
    width: 1rem;
    height: 1rem;
  }

  .checkbox-large {
    width: 1.25rem;
    height: 1.25rem;
  }

  /* States */
  .checkbox-error {
    border-color: #ef4444;
  }

  .checkbox-disabled,
  .checkbox:disabled {
    background-color: #f3f4f6;
    border-color: #d1d5db;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .checkbox-disabled:checked,
  .checkbox:disabled:checked {
    background-color: #9ca3af;
    border-color: #9ca3af;
  }

  /* Label text */
  .checkbox-text {
    font-size: 0.875rem;
    color: #374151;
  }

  .checkbox-disabled + .checkbox-text,
  .checkbox:disabled + .checkbox-text {
    color: #9ca3af;
    cursor: not-allowed;
  }

  /* Error message */
  .checkbox-error-message {
    font-size: 0.75rem;
    color: #ef4444;
    margin-left: 1.5rem;
  }
</style>
