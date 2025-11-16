<!-- Module: src/lib/components/ledgers/LedgerAccounts.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { tip } from '$lib/actions/tip';

  const ENDPOINT = '/api/ledgers/accounts';
  const SORTABLE_COLUMNS = ['account', 'designationDE', 'category', 'jabereich', 'active'];

  interface Account {
    account: number;
    designationDE: string;
    designationEN: string;
    category?: string;
    jabereich?: string;
    japos?: string;
    active: boolean;
    available: boolean;
    taxgroup?: string;
  }

  interface FormData {
    account: string;
    designationDE: string;
    designationEN: string;
    category: string;
    jabereich: string;
    japos: string;
    active: boolean;
    available: boolean;
    taxgroup: string;
  }

  interface Options {
    categories: string[];
    jabereiche: string[];
    japos: string[];
    taxgroups: string[];
  }

  function createEmptyForm(): FormData {
    return {
      account: '',
      designationDE: '',
      designationEN: '',
      category: '',
      jabereich: '',
      japos: '',
      active: true,
      available: true,
      taxgroup: ''
    };
  }

  const dispatch = createEventDispatcher();

  let accounts: Account[] = [];
  let options: Options = {
    categories: [],
    jabereiche: [],
    japos: [],
    taxgroups: []
  };

  let loading = false;
  let saving = false;
  let selectedAccount: number | null = null;
  let form: FormData = createEmptyForm();
  let errors: string[] = [];
  let sortKey = 'account';
  let sortDirection: 'asc' | 'desc' = 'asc';
  let showOnlyActive = true;
  let isOpen = true;
  let mounted = false;

  onMount(() => {
    const saved = localStorage.getItem('ledgers-chart-open');
    isOpen = saved !== 'false';
    mounted = true;
    loadAccounts();
  });

  function toggleOpen(): void {
    isOpen = !isOpen;
    localStorage.setItem('ledgers-chart-open', String(isOpen));
  }

  async function loadAccounts(): Promise<void> {
    loading = true;
    errors = [];
    try {
      const res = await fetch(ENDPOINT);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'ACCOUNTS_FETCH_FAILED');
      }
      accounts = Array.isArray(data.accounts) ? data.accounts : [];
      options = data.options ?? options;
      dispatch('update', { accounts });
    } catch (error) {
      errors = [error instanceof Error ? error.message : 'Could not load accounts'];
      accounts = [];
    } finally {
      loading = false;
    }
  }

  function resetForm(): void {
    selectedAccount = null;
    form = createEmptyForm();
    errors = [];
  }

  function selectAccount(entry: Account): void {
    selectedAccount = entry.account;
    form = {
      account: String(entry.account ?? ''),
      designationDE: entry.designationDE ?? '',
      designationEN: entry.designationEN ?? '',
      category: entry.category ?? '',
      jabereich: entry.jabereich ?? '',
      japos: entry.japos ?? '',
      active: Boolean(entry.active),
      available: Boolean(entry.available),
      taxgroup: entry.taxgroup ?? ''
    };
    errors = [];
  }

  function sortBy(column: string): void {
    if (!SORTABLE_COLUMNS.includes(column)) {
      return;
    }
    if (sortKey === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = column;
      sortDirection = 'asc';
    }
  }

  $: sortedAccounts = [...accounts].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const left = a[sortKey as keyof Account];
    const right = b[sortKey as keyof Account];
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction;
    }
    return String(left ?? '').localeCompare(String(right ?? '')) * direction;
  });

  function buildPayload(action: 'create' | 'update' | 'delete'): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      action,
      account: form.account,
      designation: form.designationDE,
      designationEN: form.designationEN,
      category: form.category,
      jabereich: form.jabereich,
      japos: form.japos,
      active: form.active,
      available: form.available,
      taxgroup: form.taxgroup
    };
    if (action === 'update') {
      payload.current_account = selectedAccount;
    }
    return payload;
  }

  async function submitForm(event?: Event): Promise<void> {
    event?.preventDefault();
    const action = selectedAccount === null ? 'create' : 'update';
    await persist(buildPayload(action as 'create' | 'update'));
  }

  async function persist(payload: Record<string, unknown>): Promise<void> {
    saving = true;
    errors = [];
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'ACCOUNT_SAVE_FAILED');
      }
      await loadAccounts();
      dispatch('changed');
      if (payload.action === 'create') {
        resetForm();
      } else {
        const updated = data.account ?? null;
        if (updated) {
          selectAccount(updated);
        }
      }
    } catch (error) {
      errors = [error instanceof Error ? error.message : 'Unable to save'];
    } finally {
      saving = false;
    }
  }

  async function deleteAccountRequest(): Promise<void> {
    if (selectedAccount === null) {
      return;
    }
    const confirmed = window.confirm('Delete this account? This cannot be undone.');
    if (!confirmed) {
      return;
    }
    await persist({ action: 'delete', account: selectedAccount });
    resetForm();
  }

  function handleInput(event: Event, key: keyof FormData): void {
    const target = event.target as HTMLInputElement;
    form = { ...form, [key]: target.type === 'checkbox' ? target.checked : target.value };
  }

  $: accountLabel = selectedAccount === null ? 'Create Account' : `Edit Account ${selectedAccount}`;
</script>

<section class="ledger-section" aria-labelledby="ledger-accounts-heading">
  <header class="section-header">
    <div>
      <div class="header-title">
        <h2 id="ledger-accounts-heading">Chart of accounts (SKR04)</h2>
        <button type="button" class="toggle-btn" on:click={toggleOpen} aria-label="Toggle section">
          {isOpen ? '▼' : '▲'}
        </button>
      </div>
      <p class="section-subtitle">Manage accounts, categories and visibility.</p>
    </div>
    <div class="actions">
      <button class="btn-secondary" on:click={resetForm} type="button" use:tip={'accounts.reset'}>Neuer Eintrag</button>
    </div>
  </header>

  {#if isOpen}
    {#if errors.length && !loading && !saving}
      <div class="form-errors" role="alert">
        {#each errors as error}
          <div>{error}</div>
        {/each}
      </div>
    {/if}

    <div class="accounts-layout">
      <div class="table-wrap" aria-live="polite">
        <div class="filter-bar">
          <label class="checkbox-field">
            <input type="checkbox" bind:checked={showOnlyActive} />
            <span>Show only active accounts</span>
          </label>
        </div>

        <table class="accounts-table">
          <thead>
            <tr>
              <th>
                <button type="button" class="sort-button" on:click={() => sortBy('account')}>
                  Account
                  {#if sortKey === 'account'}<span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
                </button>
              </th>
              <th>
                <button type="button" class="sort-button" on:click={() => sortBy('designationDE')}>
                  Description
                  {#if sortKey === 'designationDE'}<span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
                </button>
              </th>
              <th>
                <button type="button" class="sort-button" on:click={() => sortBy('category')}>
                  Category
                  {#if sortKey === 'category'}<span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
                </button>
              </th>
              <th>
                <button type="button" class="sort-button" on:click={() => sortBy('taxgroup')}>
                  Taxgroup
                  {#if sortKey === 'taxgroup'}<span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
                </button>
              </th>
              <th>
                <button type="button" class="sort-button" on:click={() => sortBy('jabereich')}>
                  JABereich
                  {#if sortKey === 'jabereich'}<span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
                </button>
              </th>
              <th>
                <button type="button" class="sort-button" on:click={() => sortBy('active')}>
                  Active
                  {#if sortKey === 'active'}<span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
                </button>
              </th>
              <th>
                <button type="button" class="sort-button">
                  Available
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#if loading}
              <tr>
                <td class="empty" colspan="7">Lade Konten ...</td>
              </tr>
            {:else if !sortedAccounts.length}
              <tr>
                <td class="empty" colspan="7">Keine Konten vorhanden.</td>
              </tr>
            {:else}
              {#each sortedAccounts.filter(acc => !showOnlyActive || acc.active) as account}
                <tr class:selected={selectedAccount === account.account} on:click={() => selectAccount(account)}>
                  <td>{account.account}</td>
                  <td>{account.designationDE}</td>
                  <td>{account.category || '—'}</td>
                  <td>{account.taxgroup || '—'}</td>
                  <td>{account.jabereich || '—'}</td>
                  <td>{account.active ? 'Ja' : 'Nein'}</td>
                  <td>{account.available ? 'Ja' : 'Nein'}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <form class="account-form" on:submit|preventDefault={submitForm} aria-labelledby="account-form-title">
        <h3 id="account-form-title">{accountLabel}</h3>

        <label>
          Kontonummer
          <input
            type="number"
            min="10"
            max="9999"
            required
            bind:value={form.account}
          />
        </label>

        <label>
          Bezeichnung (DE)
          <input type="text" required bind:value={form.designationDE} />
        </label>

        <label>
          Bezeichnung (EN)
          <input type="text" bind:value={form.designationEN} />
        </label>

        <label>
          Kategorie
          <input list="category-options" bind:value={form.category} />
          <datalist id="category-options">
            {#each options.categories as category}
              <option value={category}></option>
            {/each}
          </datalist>
        </label>

        <label>
          JABereich
          <input list="jabereich-options" bind:value={form.jabereich} />
          <datalist id="jabereich-options">
            {#each options.jabereiche as value}
              <option value={value}></option>
            {/each}
          </datalist>
        </label>

        <label>
          Japos
          <input list="japos-options" bind:value={form.japos} />
          <datalist id="japos-options">
            {#each options.japos as value}
              <option value={value}></option>
            {/each}
          </datalist>
        </label>

        <label>
          Steuergruppe
          <input list="taxgroup-options" bind:value={form.taxgroup} />
          <datalist id="taxgroup-options">
            {#each options.taxgroups as value}
              <option value={value}></option>
            {/each}
          </datalist>
        </label>

        <label class="checkbox-field">
          <input type="checkbox" bind:checked={form.active} on:change={(event) => handleInput(event, 'active')} />
          <span>Aktiv</span>
        </label>

        <label class="checkbox-field">
          <input type="checkbox" bind:checked={form.available} on:change={(event) => handleInput(event, 'available')} />
          <span>Verfügbar</span>
        </label>

        {#if errors.length && (loading || saving)}
          <div class="form-errors" role="alert">
            {#each errors as error}
              <div>{error}</div>
            {/each}
          </div>
        {/if}

        <div class="form-actions">
          <button type="submit" class="btn-primary" disabled={saving}>
            {saving ? 'Speichern …' : 'OK'}
          </button>
          <button type="button" class="btn-tertiary" on:click={resetForm}>Abbrechen</button>
          <button
            type="button"
            class="btn-danger"
            on:click={deleteAccountRequest}
            disabled={selectedAccount === null || saving}
          >
            Löschen
          </button>
        </div>
      </form>
    </div>
  {/if}
</section>

<style>
  .ledger-section {
    border: 1px solid #d1d5db;
    background: #fff;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    position: sticky;
    top: 0;
    z-index: 4;
    background: #fff;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
  }

  .section-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toggle-btn {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    color: #4b5563;
    transition: color 0.15s ease-in-out;
  }

  .toggle-btn:hover {
    color: #111827;
  }

  .section-subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  .accounts-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 18px;
    align-items: flex-start;
  }

  .table-wrap {
    --header-h: 50px;
    --filter-bar-h: 38px;
    position: relative;
    max-height: 420px;
    overflow: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fff;
  }

  .accounts-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .accounts-table th,
  .accounts-table td {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 10px;
    text-align: left;
  }

  .accounts-table tbody tr:nth-child(even) {
    background: #f9fafb;
  }

  .accounts-table tr.selected {
    color: white;
    background: #da1e1e !important;
  }

  .accounts-table tbody tr:hover {
    background: #a7eeb7 !important;
    cursor: pointer;
    transition: background 0.1s ease-in-out;
  }

  .filter-bar {
    position: sticky;
    top: 0px;
    z-index: 3;
    background: #fff;
    padding: 0px 8px;
    min-height: var(--filter-bar-h);
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e5e7eb;
  }

  .accounts-table thead th {
    position: sticky;
    top: 39px;
    background: #fff;
    z-index: 2;
  }

  .accounts-table td.empty {
    text-align: center;
    font-style: italic;
    color: #6b7280;
  }

  .sort-button {
    background: transparent;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .account-form {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .account-form h3 {
    margin: 0 0 6px 0;
    font-size: 16px;
    font-weight: 600;
  }

  label {
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  input[type='text'],
  input[type='number'] {
    border: 1px solid #cbd5f5;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 13px;
  }

  .checkbox-field {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .btn-primary,
  .btn-secondary,
  .btn-tertiary,
  .btn-danger {
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: filter 0.15s ease-in-out;
  }

  .btn-primary { background: #2563eb; color: #fff; }
  .btn-secondary { background: #10b981; color: #fff; }
  .btn-tertiary { background: #9ca3af; color: #fff; }
  .btn-danger { background: #dc2626; color: #fff; }

  .btn-primary:disabled,
  .btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button:hover {
    filter: brightness(0.95);
  }

  .form-errors {
    border: 1px solid #dc2626;
    background: #fee2e2;
    color: #991b1b;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 13px;
    margin-bottom: 12px;
  }

  .empty {
    text-align: center;
    padding: 16px;
  }

  @media (max-width: 1200px) {
    .accounts-layout {
      grid-template-columns: 1fr;
    }

    .table-wrap {
      max-height: none;
    }
  }
</style>
