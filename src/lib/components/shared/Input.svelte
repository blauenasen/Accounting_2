<script lang="ts">
  // src/lib/components/shared/Input.svelte
  // Reusable input component with validation

  /**
   * Input value
   */
  export let value: string | number = '';

  /**
   * Input type
   */
  export let type: 'text' | 'number' | 'email' | 'tel' | 'url' | 'password' | 'date' = 'text';

  /**
   * Input name
   */
  export let name: string | undefined = undefined;

  /**
   * Input label
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
   * Readonly field
   */
  export let readonly: boolean = false;

  /**
   * Error message
   */
  export let error: string | undefined = undefined;

  /**
   * Help text
   */
  export let helpText: string | undefined = undefined;

  /**
   * Autocomplete attribute
   */
  export let autocomplete: string | undefined = undefined;

  /**
   * Min value (for number/date)
   */
  export let min: number | string | undefined = undefined;

  /**
   * Max value (for number/date)
   */
  export let max: number | string | undefined = undefined;

  /**
   * Step value (for number)
   */
  export let step: number | string | undefined = undefined;

  /**
   * Max length
   */
  export let maxlength: number | undefined = undefined;

  /**
   * Pattern for validation
   */
  export let pattern: string | undefined = undefined;

  /**
   * Full width input
   */
  export let fullWidth: boolean = false;

  /**
   * Input size
   */
  export let size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * CSS class names
   */
  let className: string = '';
  export { className as class };

  /**
   * Unique ID for input
   */
  let inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Computed input classes
   */
  $: inputClasses = [
    'input',
    `input-${size}`,
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    readonly ? 'input-readonly' : '',
    fullWidth ? 'input-full-width' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle input change
   */
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;

    if (type === 'number') {
      value = target.valueAsNumber || 0;
    } else {
      value = target.value;
    }
  }
</script>

<div class="input-wrapper" class:input-full-width={fullWidth}>
  {#if label}
    <label for={inputId} class="input-label">
      {label}
      {#if required}
        <span class="input-required" aria-label="Required">*</span>
      {/if}
    </label>
  {/if}

  <input
    id={inputId}
    {type}
    {name}
    {value}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {autocomplete}
    {min}
    {max}
    {step}
    {maxlength}
    {pattern}
    class={inputClasses}
    on:input={handleInput}
    on:change
    on:focus
    on:blur
    on:keydown
    on:keyup
    on:keypress
    {...$$restProps}
  />

  {#if error}
    <div class="input-error-message" role="alert">
      {error}
    </div>
  {/if}

  {#if helpText && !error}
    <div class="input-help-text">
      {helpText}
    </div>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .input-wrapper.input-full-width {
    width: 100%;
  }

  .input-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .input-required {
    color: #ef4444;
    margin-left: 0.125rem;
  }

  .input {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #1f2937;
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input::placeholder {
    color: #9ca3af;
  }

  /* Sizes */
  .input-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .input-medium {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .input-large {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  /* States */
  .input-error {
    border-color: #ef4444;
  }

  .input-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .input-disabled,
  .input:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .input-readonly,
  .input:read-only {
    background-color: #f9fafb;
    cursor: default;
  }

  /* Messages */
  .input-error-message {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
  }

  .input-help-text {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  /* Number input arrows */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    opacity: 1;
  }
</style>
