<!-- Module: src/lib/components/ledgers/LedgerCompanyCodes.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { tip } from '$lib/actions/tip';

  export let accounts: Array<{
    account: number;
    active: boolean;
    available: boolean;
    designationDE: string;
  }> = [];

  const ENDPOINT = '/api/ledgers/companycodes';

  interface CompanyCode {
    idcode: number;
    no: string;
    textcode: string;
    account: string | number;
    available: boolean;
  }

  interface FormData {
    idcode: number | null;
    no: string;
    textcode: string;
    account: string;
    available: boolean;
  }

  function createEmptyForm(): FormData {
    return {
      idcode: null,
      no: '',
      textcode: '',
      account: '',
      available: true
    };
  }

  const dispatch = createEventDispatcher();

  let codes: CompanyCode[] = [];
  let loading = false;
  let saving = false;
  let errors: string[] = [];
  let form: FormData = createEmptyForm();
  let isOpen = false;
  let mounted = false;

  onMount(() => {
    const saved = sessionStorage.getItem('ledgers-circle-open');
    isOpen = saved === 'true';
    mounted = true;
    loadCodes();
  });

  function toggleOpen(): void {
    isOpen = !isOpen;
    sessionStorage.setItem('ledgers-circle-open', String(isOpen));
  }

  async function loadCodes(): Promise<void> {
    loading = true;
    errors = [];
    try {
      const res = await fetch(ENDPOINT);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'BOOK_CIRCLE_FETCH_FAILED');
      }
      codes = Array.isArray(data.codes) ? data.codes : [];
    } catch (error) {
      errors = [error instanceof Error ? error.message : 'Could not load book circles'];
      codes = [];
    } finally {
      loading = false;
    }
  }

  function resetForm(): void {
    form = createEmptyForm();
    errors = [];
  }

  function select(code: CompanyCode): void {
    form = {
      idcode: code.idcode,
      no: String(code.no ?? ''),
      textcode: code.textcode ?? '',
      account: code.account != null ? String(code.account) : '',
      available: Boolean(code.available)
    };
    errors = [];
  }

  function resolveAccountLabel(accountNumber: string | number): string {
    const numeric = Number(accountNumber);
    const match = accounts.find((entry) => entry.account === numeric);
    return match ? `${numeric} — ${match.designationDE}` : accountNumber || '—';
  }

  function buildPayload(action: 'create' | 'update' | 'delete'): Record<string, unknown> {
    return {
      action,
      idcode: form.idcode,
      no: form.no,
      textcode: form.textcode,
      account: form.account,
      available: form.available
    };
  }

  async function submitForm(event?: Event): Promise<void> {
    event?.preventDefault();
    const action = form.idcode === null ? 'create' : 'update';
    await persist(buildPayload(action));
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
        throw new Error(data?.error || 'BOOK_CIRCLE_SAVE_FAILED');
      }
      await loadCodes();
      dispatch('changed');
      if (payload.action === 'create') {
        resetForm();
      } else if (data.entry) {
        select(data.entry);
      }
    } catch (error) {
      errors = [error instanceof Error ? error.message : 'Unable to save book circle'];
    } finally {
      saving = false;
    }
  }

  async function deleteRequest(code: CompanyCode): Promise<void> {
    const confirmed = window.confirm('Delete this book circle?');
    if (!confirmed) {
      return;
    }
    await persist({ action: 'delete', idcode: code.idcode });
    if (form.idcode === code.idcode) {
      resetForm();
    }
  }

  $: accountOptions = accounts
    .filter((entry) => entry.active && entry.available)
    .map((entry) => ({
      value: entry.account,
      label: `${entry.account} — ${entry.designationDE}`
    }));
</script>

<section class="ledger-section" aria-labelledby="ledger-companycodes-heading">
  <header class="section-header">
    <div>
      <div class="header-title">
        <h2 id="ledger-companycodes-heading">Book Circle Management</h2>
        <button type="button" class="toggle-btn" on:click={toggleOpen} aria-label="Toggle section">
          {isOpen ? '▼' : '▲'}
        </button>
      </div>
      <p class="section-subtitle">Manage book circles and standard accounts.</p>
    </div>
    <div class="actions">
      <button type="button" class="btn-secondary" on:click={resetForm} use:tip={'bookcircle.reset'}>New Entry</button>
    </div>
  </header>

  {#if mounted && isOpen}
    {#if errors.length && !loading && !saving}
      <div class="form-errors" role="alert">
        {#each errors as error}
          <div>{error}</div>
        {/each}
      </div>
    {/if}

    <div class="companycode-layout">
      <div class="table-wrap">
        <table class="codes-table">
          <thead>
            <tr>
              <th>Book Circle</th>
              <th>Description</th>
              <th>Standard Account</th>
              <th>Status</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if loading}
              <tr>
                <td class="empty" colspan="5">Loading book circles...</td>
              </tr>
            {:else if !codes.length}
              <tr>
                <td class="empty" colspan="5">No book circles defined.</td>
              </tr>
            {:else}
              {#each codes as code}
                <tr class:selected={form.idcode === code.idcode}>
                  <td>{code.no}</td>
                  <td>{code.textcode || '—'}</td>
                  <td>{resolveAccountLabel(code.account)}</td>
                  <td>{code.available ? 'Active' : 'Inactive'}</td>
                  <td class="col-actions">
                    <button class="btn-tertiary" type="button" on:click={() => select(code)}>Edit</button>
                    <button class="btn-danger" type="button" on:click={() => deleteRequest(code)}>Delete</button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <form class="code-form" on:submit|preventDefault={submitForm} aria-labelledby="companycode-form-title">
        <h3 id="companycode-form-title">{form.idcode === null ? 'Create New Book Circle' : `Edit Book Circle ${form.no}`}</h3>

        <label>
          Book Circle Number
          <input type="number" min="0" required bind:value={form.no} />
        </label>

        <label>
          Text Code
          <input type="text" required bind:value={form.textcode} />
        </label>

        <label>
          Standard Account
          <input list="bookcircle-account-options" bind:value={form.account} />
          <datalist id="bookcircle-account-options">
            {#each accountOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </datalist>
        </label>

        <label class="checkbox-field">
          <input type="checkbox" bind:checked={form.available} />
          <span>Book Circle is available</span>
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

  .companycode-layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 18px;
  }

  .table-wrap {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: auto;
    max-height: 360px;
  }

  .codes-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .codes-table th,
  .codes-table td {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 10px;
    text-align: left;
  }

  .codes-table tr:nth-child(even) {
    background: #f9fafb;
  }

  .codes-table tr.selected {
    background: #e0f2fe;
  }

  .col-actions {
    width: 180px;
    white-space: nowrap;
  }

  .code-form {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
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

  button:hover {
    filter: brightness(0.95);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    font-style: italic;
    color: #6b7280;
  }

  @media (max-width: 1200px) {
    .companycode-layout {
      grid-template-columns: 1fr;
    }

    .table-wrap {
      max-height: none;
    }
  }
</style>
