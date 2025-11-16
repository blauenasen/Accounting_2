<!-- src/lib/components/invoice/InvoiceList.svelte -->
<script lang="ts">
  // Invoice list component - displays all invoices in a sortable table
  import { createEventDispatcher } from 'svelte';
  import type { InvoiceData, SortState } from '$lib/types/ui.js';

  const dispatch = createEventDispatcher<{
    select: { invoice: InvoiceData };
    'new-invoice': void;
    'view-pdf': { invoiceId: number };
    'send-email': { invoiceId: number };
    delete: { invoiceId: number };
  }>();

  // Props
  export let invoices: unknown[] = [];
  export let loading = false;

  // Local state
  let sortState: SortState = {
    column: 'date',
    direction: 'desc'
  };
  let searchQuery = '';
  let filterStatus: 'all' | 'open' | 'booked' | 'blocked' = 'all';

  /**
   * Sort invoices
   */
  $: sortedInvoices = sortInvoices(filteredInvoices, sortState);

  /**
   * Filter invoices
   */
  $: filteredInvoices = filterInvoices(invoices, searchQuery, filterStatus);

  /**
   * Handle column sort
   */
  function handleSort(column: string): void {
    if (sortState.column === column) {
      sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      sortState = { column, direction: 'asc' };
    }
  }

  /**
   * Sort invoices by column
   */
  function sortInvoices(
    data: unknown[],
    sort: SortState
  ): unknown[] {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a: any, b: any) => {
      const aVal = a[sort.column];
      const bVal = b[sort.column];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  /**
   * Filter invoices
   */
  function filterInvoices(
    data: unknown[],
    query: string,
    status: string
  ): unknown[] {
    if (!data || data.length === 0) return [];

    let result = [...data];

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter((inv: any) => {
        return (
          String(inv.year || '').toLowerCase().includes(lowerQuery) ||
          String(inv.num || '').toLowerCase().includes(lowerQuery) ||
          String(inv.account || '').includes(lowerQuery)
        );
      });
    }

    // Filter by status
    if (status !== 'all') {
      result = result.filter((inv: any) => {
        if (status === 'blocked') return inv.blocked;
        if (status === 'booked') return inv.booked;
        if (status === 'open') return !inv.booked && !inv.blocked;
        return true;
      });
    }

    return result;
  }

  /**
   * Format date for display
   */
  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE');
    } catch {
      return dateStr;
    }
  }

  /**
   * Format currency
   */
  function formatCurrency(value: number): string {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  /**
   * Get status badge class
   */
  function getStatusClass(invoice: any): string {
    if (invoice.blocked) return 'status-blocked';
    if (invoice.booked) return 'status-booked';
    return 'status-open';
  }

  /**
   * Get status label
   */
  function getStatusLabel(invoice: any): string {
    if (invoice.blocked) return 'Blocked';
    if (invoice.booked) return 'Booked';
    return 'Open';
  }

  /**
   * Handle row click
   */
  function handleRowClick(invoice: any): void {
    dispatch('select', { invoice });
  }

  /**
   * Handle new invoice
   */
  function handleNewInvoice(): void {
    dispatch('new-invoice');
  }

  /**
   * Handle view PDF
   */
  function handleViewPdf(event: Event, invoiceId: number): void {
    event.stopPropagation();
    dispatch('view-pdf', { invoiceId });
  }

  /**
   * Handle send email
   */
  function handleSendEmail(event: Event, invoiceId: number): void {
    event.stopPropagation();
    dispatch('send-email', { invoiceId });
  }

  /**
   * Handle delete
   */
  function handleDelete(event: Event, invoiceId: number): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this invoice?')) {
      dispatch('delete', { invoiceId });
    }
  }
</script>

<div class="invoice-list">
  <!-- Header -->
  <div class="list-header">
    <h2>Invoices</h2>
    <button type="button" class="btn-primary" on:click={handleNewInvoice}>
      New Invoice
    </button>
  </div>

  <!-- Filters & Search -->
  <div class="list-controls">
    <input
      type="text"
      class="search-input"
      placeholder="Search by year, number, or account..."
      bind:value={searchQuery}
    />

    <div class="filter-tabs">
      <button
        type="button"
        class:active={filterStatus === 'all'}
        on:click={() => (filterStatus = 'all')}
      >
        All
      </button>
      <button
        type="button"
        class:active={filterStatus === 'open'}
        on:click={() => (filterStatus = 'open')}
      >
        Open
      </button>
      <button
        type="button"
        class:active={filterStatus === 'booked'}
        on:click={() => (filterStatus = 'booked')}
      >
        Booked
      </button>
      <button
        type="button"
        class:active={filterStatus === 'blocked'}
        on:click={() => (filterStatus = 'blocked')}
      >
        Blocked
      </button>
    </div>
  </div>

  <!-- Table -->
  {#if loading}
    <div class="loading">Loading invoices...</div>
  {:else if sortedInvoices.length === 0}
    <div class="empty-state">
      <p>No invoices found</p>
      <button type="button" class="btn-secondary" on:click={handleNewInvoice}>
        Create your first invoice
      </button>
    </div>
  {:else}
    <div class="table-wrapper">
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="sortable" on:click={() => handleSort('year')}>
              Year {sortState.column === 'year' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th class="sortable" on:click={() => handleSort('num')}>
              Number {sortState.column === 'num' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th class="sortable" on:click={() => handleSort('date')}>
              Date {sortState.column === 'date' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th class="sortable" on:click={() => handleSort('account')}>
              Account {sortState.column === 'account' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each sortedInvoices as invoice (invoice.id_invoice || Math.random())}
            <tr on:click={() => handleRowClick(invoice)} class="clickable">
              <td>{invoice.year || ''}</td>
              <td>{invoice.num || ''}</td>
              <td>{formatDate(invoice.date)}</td>
              <td>{invoice.account || ''}</td>
              <td>
                <span class="status-badge {getStatusClass(invoice)}">
                  {getStatusLabel(invoice)}
                </span>
              </td>
              <td class="actions">
                {#if invoice.id_invoice}
                  <button
                    type="button"
                    class="btn-icon"
                    title="View PDF"
                    on:click={(e) => handleViewPdf(e, invoice.id_invoice)}
                  >
                    📄
                  </button>
                  <button
                    type="button"
                    class="btn-icon"
                    title="Send Email"
                    on:click={(e) => handleSendEmail(e, invoice.id_invoice)}
                  >
                    📧
                  </button>
                  <button
                    type="button"
                    class="btn-icon btn-danger"
                    title="Delete"
                    on:click={(e) => handleDelete(e, invoice.id_invoice)}
                  >
                    🗑️
                  </button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .invoice-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .list-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }

  .list-controls {
    display: flex;
    gap: 1rem;
    padding: 1rem 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .search-input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .filter-tabs button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: #fff;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s;
  }

  .filter-tabs button:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .filter-tabs button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .table-wrapper {
    flex: 1;
    overflow: auto;
    padding: 0 2rem 2rem;
  }

  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .invoice-table thead {
    position: sticky;
    top: 0;
    background: #f9fafb;
    z-index: 10;
  }

  .invoice-table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  .invoice-table th.sortable {
    cursor: pointer;
    user-select: none;
  }

  .invoice-table th.sortable:hover {
    background: #f3f4f6;
  }

  .invoice-table th.text-right {
    text-align: right;
  }

  .invoice-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
  }

  .invoice-table tbody tr.clickable {
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .invoice-table tbody tr.clickable:hover {
    background: #f9fafb;
  }

  .invoice-table td {
    padding: 0.75rem 1rem;
    color: #111827;
  }

  .invoice-table td.actions {
    text-align: right;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-badge.status-open {
    background: #dbeafe;
    color: #1e40af;
  }

  .status-badge.status-booked {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.status-blocked {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn-primary {
    padding: 0.625rem 1.25rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    padding: 0.625rem 1.25rem;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .btn-secondary:hover {
    background: #4b5563;
  }

  .btn-icon {
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: none;
    font-size: 1.125rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  .btn-icon:hover {
    opacity: 1;
  }

  .btn-icon.btn-danger:hover {
    opacity: 1;
    filter: brightness(0.8);
  }

  .loading,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #6b7280;
  }

  .empty-state p {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
  }
</style>
