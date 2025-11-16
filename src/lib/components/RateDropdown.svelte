<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';

  interface RateItem {
    id_rate: string | number;
    service: string;
    rate: string | number;
    [key: string]: string | number;
  }

  // Bound value: id_rate (String or Number)
  export let value: string | number | null = null;

  // Items: [{ id_rate, service, rate, ... }]
  export let items: RateItem[] = [];

  // Optional: disable
  export let disabled = false;

  // Optional: DOM id (for <label for="...">)
  export let id: string | undefined = undefined;

  // Optional: placeholder when nothing selected
  export let placeholder = '–';

  // Optional: menu width/height
  export let menuWidth = 460;
  export let menuMaxHeight = 570;

  // Refocus button after selection. Set to false in parent component if needed.
  export let refocusAfterSelect = true;

  // Keys (fixed per requirement)
  const idKey = 'id_rate';
  const serviceKey = 'service';
  const rateKey = 'rate';

  const dispatch = createEventDispatcher<{ change: { value: string | number | null; item: RateItem } }>();

  let isOpen = false;
  let activeIndex = -1;
  let rootEl: HTMLDivElement | undefined;
  let btnEl: HTMLButtonElement | undefined;
  let listEl: HTMLUListElement | undefined;

  const nf = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const toNum = (v: unknown): number => {
    if (v === '' || v == null) return 0;
    const n = parseFloat(String(v).replace(',', '.').replace(/\s+/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // Display in closed field: only id_rate or placeholder
  $: displayText = value !== null && value !== '' ? String(value) : placeholder;

  function openDropdown() {
    if (disabled) return;
    isOpen = true;
    tick().then(() => {
      const idx = items.findIndex((it) => String(it[idKey]) === String(value));
      activeIndex = idx >= 0 ? idx : (items.length ? 0 : -1);
      scrollActiveIntoView();
      listEl?.focus();
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

  async function selectIndex(i: number) {
    if (i < 0 || i >= items.length) return;
    const it = items[i];
    value = it[idKey];
    dispatch('change', { value, item: it });
    await tick();
    closeDropdown();
    if (refocusAfterSelect) btnEl?.focus();
  }

  function onButtonKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
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
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) selectIndex(activeIndex);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      activeIndex = 0;
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      activeIndex = items.length - 1;
      scrollActiveIntoView();
      return;
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

  function handleClickOutside(e: MouseEvent) {
    if (!rootEl) return;
    if (!rootEl.contains(e.target as Node)) closeDropdown();
  }

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div class="rate-dd" bind:this={rootEl}>
  <button
    bind:this={btnEl}
    id={id}
    class="display"
    class:disabled={disabled}
    type="button"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls={id ? `${id}-listbox` : undefined}
    on:click={toggleDropdown}
    on:keydown={onButtonKeydown}
    disabled={disabled}>
    {displayText}
  </button>

  {#if isOpen}
    <ul
      bind:this={listEl}
      class="menu"
      role="listbox"
      id={id ? `${id}-listbox` : undefined}
      tabindex="0"
      style={`width:${menuWidth}px; max-height:${menuMaxHeight}px`}
      on:keydown={onListKeydown}>
      {#each items as it, i}
        <li
          role="option"
          aria-selected={String(it[idKey]) === String(value)}
          class:active={i===activeIndex}>
          <button type="button" class="item" on:click={() => selectIndex(i)}>
            <span class="id">{it[idKey]}</span>
            <span class="sep"> - </span>
            <span class="service">{it[serviceKey]}</span>
            <span class="sep"> - </span>
            <span class="rate">{nf.format(toNum(it[rateKey]))} $</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .rate-dd {
    position: relative;
    width: 20px;
    font-size: 14px;
  }
  .display {
    width: 100%;
    height: 22px;
    padding: 0 2px;
    border: 1px solid #d1d5db;
    background: #fff;
    text-align: center;
    line-height: 20px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .display.disabled { cursor: not-allowed; opacity: .6; }

  .menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin: 4px 0 0 0;
    padding: 0;
    list-style: none;
    border: 2px solid #1959b9;
    background: #fff8bf;
    overflow-y: auto;
    z-index: 20;
    border-radius: 2px;
    box-shadow: 0 6px 16px rgba(0,0,0,.08);
  }
  .menu:focus { outline: none; }

  .item {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 6px 10px;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    color: #0c0c0c;
  }

  .rate-dd li[aria-selected="true"] .item {
    background: #e6ece7;
    color: #0c0c0c;
  }

  .rate-dd li:not([aria-selected="true"]) .item:hover {
    background: #dbeafe;
    color: #0c0c0c;
  }

  li.active .item {
    outline: 1px solid #1959b9;
    outline-offset: -1px;
  }

  .id { min-width: 18px; text-align: right; }
  .sep { opacity: .6; }
  .service { flex: 1 1 auto; }
  .rate { min-width: 70px; text-align: right; }
</style>
