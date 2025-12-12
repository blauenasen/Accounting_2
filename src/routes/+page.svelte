<!-- Homepage - Primanota Table View -->
<script lang="ts">
  import { onMount } from 'svelte';
  import PrimanotaTableContainer from '$lib/components/primanota/PrimanotaTableContainer.svelte';
  import type { JournalRow } from '$lib/types/ui.js';

  // State
  let filtersActive = false;
  let selectedAccount: number | null = null;
  let rows: JournalRow[] = [];
  let loading = true;
  let error: string | null = null;

  /**
   * Load journal entries from API
   */
  async function loadJournalEntries(): Promise<void> {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/booking/primanota');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok && Array.isArray(data.rows)) {
        rows = data.rows;
      } else {
        throw new Error(data.error || 'Failed to load journal entries');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to load journal entries:', err);
    } finally {
      loading = false;
    }
  }

  /**
   * Handle row selection
   */
  function handleRowSelect(event: CustomEvent): void {
    const { rowIndex, row } = event.detail;
    console.log('Row selected:', { rowIndex, row });
  }

  /**
   * Handle fill form event
   */
  function handleFillForm(event: CustomEvent): void {
    const { formData, originalRow } = event.detail;
    console.log('Fill form requested:', { formData, originalRow });
    // Navigate to booking page or open form dialog
    window.location.href = '/booking';
  }

  /**
   * Handle delete entry event
   */
  function handleDeleteEntry(event: CustomEvent): void {
    const { bookingData } = event.detail;
    console.log('Delete entry requested:', bookingData);
    // Reload data after deletion
    loadJournalEntries();
  }

  /**
   * Handle message event
   */
  function handleMessage(event: CustomEvent): void {
    const { text, rowIndex } = event.detail;
    console.log('Message:', { text, rowIndex });
  }

  /**
   * Handle reload event
   */
  function handleReload(): void {
    loadJournalEntries();
  }

  /**
   * Handle account selected event (from CK dialog)
   */
  function handleAccountSelected(event: CustomEvent): void {
    const { field, accountNumber, designation } = event.detail;
    console.log('Account selected:', { field, accountNumber, designation });
  }

  // Load data on mount
  onMount(() => {
    loadJournalEntries();
  });
</script>

<div class="primanota-page">
  {#if loading}
    <div class="loading-state">
      <p>Loading journal entries...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <h2>Error Loading Data</h2>
      <p>{error}</p>
      <button type="button" on:click={loadJournalEntries}>Retry</button>
    </div>
  {:else}
    <header class="page-header">
      <h1>Primanota - Journal Entries</h1>
      <div class="header-actions">
        <button type="button" on:click={() => (filtersActive = !filtersActive)}>
          {filtersActive ? 'Disable' : 'Enable'} Filters
        </button>
        <button type="button" on:click={loadJournalEntries}>Reload</button>
        <a href="/booking" class="button-link">New Booking</a>
      </div>
    </header>

    <PrimanotaTableContainer
      {rows}
      bind:filtersActive
      {selectedAccount}
      maxHeight="calc(100vh - 200px)"
      on:rowselect={handleRowSelect}
      on:fillform={handleFillForm}
      on:deleteentry={handleDeleteEntry}
      on:message={handleMessage}
      on:reload={handleReload}
      on:account-selected={handleAccountSelected}
    />

    {#if rows.length === 0}
      <div class="empty-state">
        <p>No journal entries found.</p>
        <a href="/booking">Create your first booking</a>
      </div>
    {/if}
  {/if}
</div>

<style>
  .primanota-page {
    max-width: 1800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .page-header h1 {
    margin: 0;
    font-size: 1.75rem;
    color: #1f2937;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .header-actions button,
  .button-link {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: background-color 0.15s;
  }

  .header-actions button:hover,
  .button-link:hover {
    background: #2563eb;
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
  }

  .error-state {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #991b1b;
  }

  .error-state h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }

  .error-state p {
    margin: 0 0 1rem 0;
  }

  .error-state button {
    padding: 0.5rem 1.5rem;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
  }

  .error-state button:hover {
    background: #b91c1c;
  }

  .empty-state {
    color: #6b7280;
  }

  .empty-state a {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
  }

  .empty-state a:hover {
    background: #2563eb;
  }
</style>
