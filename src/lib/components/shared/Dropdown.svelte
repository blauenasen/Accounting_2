<script lang="ts">
  // src/lib/components/shared/Dropdown.svelte
  // Reusable dropdown/select component

  import type { FormFieldOption } from '$lib/types/ui.js';

  /**
   * Selected value
   */
  export let value: string | number | undefined = undefined;

  /**
   * Dropdown options
   */
  export let options: FormFieldOption[] = [];

  /**
   * Dropdown name
   */
  export let name: string | undefined = undefined;

  /**
   * Dropdown label
   */
  export let label: string | undefined = undefined;

  /**
   * Placeholder text
   */
  export let placeholder: string | undefined = undefined;

  /**
   * Disabled state
   */
  export let disabled: boolean = false;

  /**
   * Required field
   */
  export let required: boolean = false;

  /**
   * Error message
   */
  export let error: string | undefined = undefined;

  /**
   * Help text
   */
  export let helpText: string | undefined = undefined;

  /**
   * Full width dropdown
   */
  export let fullWidth: boolean = false;

  /**
   * Dropdown size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  /**
   * Unique ID for dropdown
   */
  let dropdownId = name || `dropdown-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Computed dropdown classes
   */
  $: dropdownClasses = [
    'dropdown',
    `dropdown-${size}`,
    error ? 'dropdown-error' : '',
    disabled ? 'dropdown-disabled' : '',
    fullWidth ? 'dropdown-full-width' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle dropdown change
   */
  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedOption = options.find(opt => String(opt.value) === target.value);

    if (selectedOption) {
      value = selectedOption.value;
    } else {
      value = undefined;
    }
  }
</script>

<div class="dropdown-wrapper" class:dropdown-full-width={fullWidth}>
  {#if label}
    <label for={dropdownId} class="dropdown-label">
      {label}
      {#if required}
        <span class="dropdown-required" aria-label="Required">*</span>
      {/if}
    </label>
  {/if}

  <select
    id={dropdownId}
    {name}
    {disabled}
    {required}
    class={dropdownClasses}
    value={value}
    on:change={handleChange}
    on:focus
    on:blur
    {...$$restProps}
  >
    {#if placeholder}
      <option value="" disabled selected={value === undefined}>
        {placeholder}
      </option>
    {/if}

    {#each options as option}
      <option
        value={option.value}
        disabled={option.disabled}
        selected={value === option.value}
      >
        {option.label}
      </option>
    {/each}
  </select>

  {#if error}
    <div class="dropdown-error-message" role="alert">
      {error}
    </div>
  {/if}

  {#if helpText && !error}
    <div class="dropdown-help-text">
      {helpText}
    </div>
  {/if}
</div>

<style>
  .dropdown-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .dropdown-wrapper.dropdown-full-width {
    width: 100%;
  }

  .dropdown-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .dropdown-required {
    color: #ef4444;
    margin-left: 0.125rem;
  }

  .dropdown {
    display: block;
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #1f2937;
    background-color: #ffffff;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5rem 1.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .dropdown:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Sizes */
  .dropdown-small {
    padding: 0.25rem 1.75rem 0.25rem 0.5rem;
    font-size: 0.75rem;
    background-size: 1.25rem 1.25rem;
  }

  .dropdown-medium {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font-size: 0.875rem;
    background-size: 1.5rem 1.5rem;
  }

  .dropdown-large {
    padding: 0.75rem 2.25rem 0.75rem 1rem;
    font-size: 1rem;
    background-size: 1.75rem 1.75rem;
  }

  /* States */
  .dropdown-error {
    border-color: #ef4444;
  }

  .dropdown-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .dropdown-disabled,
  .dropdown:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  /* Messages */
  .dropdown-error-message {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
  }

  .dropdown-help-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  /* Option */
  option {
    color: #1f2937;
  }

  option:disabled {
    color: #9ca3af;
  }
</style>
