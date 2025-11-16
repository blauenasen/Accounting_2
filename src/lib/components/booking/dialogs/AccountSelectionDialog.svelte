<!-- src/lib/components/booking/dialogs/AccountSelectionDialog.svelte -->
<script lang="ts">
  // Account selection dialog for Contra/Account fields
  import { createEventDispatcher, tick } from 'svelte';
  import type { Account } from '$lib/types/database.js';

  const dispatch = createEventDispatcher<{
    close: void;
    select: { account: Account; field: string };
  }>();

  // Props
  export let visible = false;
  export let field = ''; // 'CK' or 'HK'
  export let bookCircle: number | null = null;
  export let accounts: Account[] = [];
  export let initialFilter = '';

  // State
  let selectedAccount: Account | null = null;
  let selectedIndex = -1;
  let filterText = '';
  let filterInput: HTMLInputElement;

  /**
   * Reset state when dialog closes
   */
  $: if (!visible) {
    filterText = '';
    selectedAccount = null;
    selectedIndex = -1;
  }

  /**
   * Set initial filter when dialog opens
   */
  $: if (visible && initialFilter) {
    filterText = initialFilter;
    focusFilterInput();
  }

  /**
   * Reset selection when filter changes
   */
  $: if (filterText !== undefined) {
    selectedIndex = -1;
    selectedAccount = null;
  }

  /**
   * Filter accounts by search text
   */
  $: filteredAccounts = accounts.filter(acc => {
    if (!filterText) return true;
    const search = filterText.toLowerCase();
    const accountStr = String(acc.account || '').toLowerCase();
    const designation = String(acc.designation || '').toLowerCase();
    return accountStr.includes(search) || designation.includes(search);
  });

  /**
   * Focus filter input
   */
  async function focusFilterInput(): Promise<void> {
    await tick();
    if (filterInput) {
      filterInput.focus();
    }
  }

  /**
   * Close dialog
   */
  function close(): void {
    dispatch('close');
  }

  /**
   * Handle cancel button
   */
  function handleCancel(): void {
    close();
  }

  /**
   * Handle select button
   */
  function handleSelect(): void {
    if (selectedAccount) {
      dispatch('select', { account: selectedAccount, field });
      close();
    }
  }

  /**
   * Handle account row click
   */
  function handleAccountClick(account: Account): void {
    selectedAccount = account;
  }

  /**
   * Handle account row double-click
   */
  function handleAccountDblClick(account: Account): void {
    selectedAccount = account;
    handleSelect();
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filteredAccounts.length === 0) return;

      if (selectedIndex < filteredAccounts.length - 1) {
        selectedIndex++;
      } else if (selectedIndex === -1) {
        selectedIndex = 0;
      }
      selectedAccount = filteredAccounts[selectedIndex];
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
        selectedAccount = filteredAccounts[selectedIndex];
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedAccount) {
        handleSelect();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={close} role="presentation">
    <div class="dialog" on:click|stopPropagation on:keydown={handleKeyDown} role="dialog" aria-labelledby="dialog-title">
      <h2 id="dialog-title">Select Account for {field}</h2>

      <div class="dialog-content">
        <div class="info-row">
          <span>Book Circle: {bookCircle !== null ? bookCircle : 'None'}</span>
          <span>Available Accounts: {filteredAccounts.length}</span>
        </div>

        <div class="filter-row">
          <input
            type="text"
            bind:value={filterText}
            bind:this={filterInput}
            placeholder="Filter accounts..."
            class="filter-input"
          />
        </div>

        <div class="accounts-list">
          {#each filteredAccounts as account (account.account)}
            <div
              class="account-row"
              class:selected={selectedAccount?.account === account.account}
              on:click={() => handleAccountClick(account)}
              on:dblclick={() => handleAccountDblClick(account)}
              on:keydown={(e) => e.key === 'Enter' && handleAccountClick(account)}
              role="button"
              tabindex="0"
            >
              <span class="account-number">{account.account}</span>
              <span class="account-designation">{account.designation || ''}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="dialog-buttons">
        <button type="button" class="btn-cancel" on:click={handleCancel}>Cancel</button>
        <button
          type="button"
          class="btn-ok"
          on:click={handleSelect}
          disabled={!selectedAccount}
        >
          Select
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    padding: 24px;
    width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }

  .dialog-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
    overflow: hidden;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
    color: #666;
  }

  .filter-row {
    margin-bottom: 12px;
  }

  .filter-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
  }

  .filter-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .accounts-list {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }

  .account-row {
    display: flex;
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f3f4f6;
  }

  .account-row:hover {
    background: #f9fafb;
  }

  .account-row.selected {
    background: #dbeafe;
  }

  .account-row:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  .account-number {
    flex: 0 0 100px;
    font-weight: 600;
    color: #333;
  }

  .account-designation {
    flex: 1;
    color: #666;
  }

  .dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .btn-cancel,
  .btn-ok {
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.15s ease-in-out;
  }

  .btn-cancel {
    background: #6b7280;
    color: white;
  }

  .btn-cancel:hover {
    background: #4b5563;
  }

  .btn-ok {
    background: #2563eb;
    color: white;
  }

  .btn-ok:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-ok:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
