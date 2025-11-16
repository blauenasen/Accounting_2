<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';

  interface DropdownItem {
    [key: string]: string | number;
  }

  // Bound value (e.g., account number)
  export let value: string | number | null = null;

  // Items list, e.g. [{ account, name1, ... }, ...]
  export let items: DropdownItem[] = [];

  // Keys
  export let valueKey = 'account';  // stored value
  export let labelKey = 'name1';    // label shown in the list

  // Placeholder when nothing is selected
  export let placeholder = '-- choose --';

  // Disabled state
  export let disabled = false;

  // Optional id to associate with <label for="...">
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: { value: string | number | null; item: DropdownItem } }>();

  let isOpen = false;
  let activeIndex = -1;         // for keyboard navigation
  let btnEl: HTMLButtonElement | undefined;
  let listEl: HTMLUListElement | undefined;
  let rootEl: HTMLDivElement | undefined;

  // Display text: after selection shows number (value)
  $: displayText = (value ?? '') !== '' && value !== null ? String(value) : placeholder;

  // Keep focused element centered
  function openDropdown() {
    if (disabled) return;
    isOpen = true;
    tick().then(() => {
      const idx = items.findIndex((it) => it[valueKey] === value);
      activeIndex = idx >= 0 ? idx : (items.length ? 0 : -1);
      scrollActiveIntoView();
    });
  }

  function closeDropdown() {
    isOpen = false;
    activeIndex = -1;
  }

  function toggleDropdown() {
    if (isOpen) closeDropdown();
    else openDropdown();
  }

  async function selectItemAt(index: number) {
    if (index < 0 || index >= items.length) return;
    const item = items[index];
    value = item[valueKey];
    dispatch('change', { value, item });
    await tick();
    isOpen = false;
    activeIndex = -1;
    // focus back button for accessibility
    btnEl?.focus();
  }

  async function selectItem(item: DropdownItem) {
    const idx = items.findIndex((it) => it[valueKey] === item[valueKey]);
    await selectItemAt(idx);
  }

  function onButtonKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
    }
  }

  function onListKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      btnEl?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length === 0) return;
      activeIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length === 0) return;
      activeIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectItemAt(activeIndex);
      }
    }
    if (e.key === 'Tab') {
      closeDropdown();
    }
  }

  function scrollActiveIntoView() {
    if (!listEl || activeIndex < 0) return;
    const li = listEl.querySelectorAll('li')[activeIndex];
    li?.scrollIntoView({ block: 'nearest' });
  }

  // Close when clicking outside
  function handleClickOutside(e: MouseEvent) {
    if (!rootEl) return;
    if (!rootEl.contains(e.target as Node)) {
      closeDropdown();
    }
  }

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });
</script>

<div class="dropdown" bind:this={rootEl}>
  <!-- Displayed value -->
  <button
    bind:this={btnEl}
    class="dropdown-display"
    class:disabled={disabled}
    type="button"
    id={id}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={id ? `${id}-listbox` : undefined}
    on:click={toggleDropdown}
    on:keydown={onButtonKeydown}
    disabled={disabled}
  >
    {displayText}
  </button>

  <!-- Options list -->
  {#if isOpen}
    <ul
      bind:this={listEl}
      class="dropdown-list"
      role="listbox"
      id={id ? `${id}-listbox` : undefined}
      aria-activedescendant={activeIndex >= 0 && id ? `${id}-opt-${activeIndex}` : undefined}
      tabindex="0"
      on:keydown={onListKeydown}
    >
      {#each items as item, i}
        <li
          id={id ? `${id}-opt-${i}` : undefined}
          role="option"
          aria-selected={item[valueKey] === value}
          class:active={i === activeIndex}
        >
          <button
            type="button"
            class="dropdown-item"
            on:mousedown={() => selectItem(item)}
          >
            {item[labelKey]}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* Container */
  .dropdown {
    position: relative;
    width: 95px;
    font-size: 13px;
  }

  /* Displayed value / button */
  .dropdown-display {
    padding: 4px 10px;
    height: 28px;
    border: 1px solid #d1d5db;
    background: #fff;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    display: block;
    text-align: left;
    font-size: 13px;
    line-height: 20px;
    color: #111827;
  }

  .dropdown-display.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Options list */
  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: 280px;
    min-width: unset;
    border: 1px solid #d1d5db;
    background: #fff;
    max-height: 220px;
    overflow-y: auto;
    z-index: 10;
    list-style: none;
    margin: 4px 0 0 0;
    padding: 0;
    white-space: normal;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  }

  .dropdown-list:focus {
    outline: none;
  }

  /* Option item */
  .dropdown-item {
    display: block;
    width: 100%;
    padding: 6px 10px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 13px;
    color: #111827;
  }

  li.active .dropdown-item,
  .dropdown-item:hover {
    background: #f3f4f6;
  }
</style>
