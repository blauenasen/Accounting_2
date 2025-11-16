<!-- Module: src/lib/components/ledgers/ItemDialog.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let visible = false;
  export let focusedRule: Record<string, unknown> | null = null;
  export let itemForm: Record<string, unknown> = {};
  export let itemMode: 'create' | 'edit' = 'create';
  export let itemErrors: string[] = [];
  export let savingItem = false;
  export let metadataLoading = false;
  export let categoryOptions: string[] = [];
  export let availableAccounts: Array<{ account: number; designation: string }> = [];
  export let focusedItems: Record<string, unknown>[] = [];
  export let accountSourceLabels: Record<string, string> = {};

  const dispatch = createEventDispatcher();

  function handleSourceChange(event: Event): void {
    dispatch('sourcechange', event);
  }

  function handleAccountChange(event: Event): void {
    dispatch('accountchange', event);
  }

  function handleCategoryChange(event: Event): void {
    dispatch('categorychange', event);
  }

  function handleSubmitItem(): void {
    dispatch('submititem');
  }

  function handleClose(): void {
    dispatch('close');
  }

  function handleEditItem(item: Record<string, unknown>): void {
    dispatch('edititem', item);
  }

  function handleDeleteItem(item: Record<string, unknown>): void {
    dispatch('deleteitem', item);
  }

  function handleResetForm(): void {
    dispatch('resetform');
  }
</script>

{#if visible && focusedRule}
  <div class="dialog-backdrop" role="dialog" aria-modal="true">
    <div class="dialog dialog--wide">
      <header class="dialog-header">
        <h2>Regelpositionen — {focusedRule.side} / {focusedRule.category || '—'}</h2>
        <p class="dialog-subtitle">Book Circle {focusedRule.no}</p>
      </header>

      <div class="dialog-body">
        <form class="item-form" on:submit|preventDefault={handleSubmitItem}>
          <label>
            Quelle
            <select bind:value={itemForm.source} on:change={handleSourceChange}>
              {#each Object.keys(accountSourceLabels) as sourceOption}
                <option value={sourceOption}>{accountSourceLabels[sourceOption]}</option>
              {/each}
            </select>
          </label>

          <label>
            Konto
            <select bind:value={itemForm.account} on:change={handleAccountChange}>
              <option value="">(Kategorie verwenden)</option>
              {#each availableAccounts as account}
                <option value={account.account}>{account.account} — {account.designation}</option>
              {/each}
            </select>
          </label>

          <label>
            Kategorie
            <select bind:value={itemForm.category} on:change={handleCategoryChange}>
              <option value="">(Konto verwenden)</option>
              {#each categoryOptions as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </label>

          <div class="item-actions">
            <button type="submit" class="btn-primary" disabled={savingItem || metadataLoading}>
              {savingItem ? 'Speichern …' : itemMode === 'edit' ? 'Position aktualisieren' : 'Position hinzufügen'}
            </button>
            {#if itemMode === 'edit'}
              <button type="button" class="btn-tertiary" on:click={handleResetForm}>Abbrechen</button>
            {/if}
          </div>
        </form>

        {#if itemErrors.length}
          <div class="form-errors" role="alert">
            {#each itemErrors as error}
              <div>{error}</div>
            {/each}
          </div>
        {/if}

        <table class="items-table">
          <thead>
            <tr>
              <th>Quelle</th>
              <th>Konto</th>
              <th>Kategorie</th>
              <th class="col-actions">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {#if !focusedItems.length}
              <tr>
                <td class="empty" colspan="4">Keine Positionen vorhanden.</td>
              </tr>
            {:else}
              {#each focusedItems as item}
                <tr>
                  <td>{accountSourceLabels[item.source] || item.source}</td>
                  <td>{item.account ?? '—'}</td>
                  <td>{item.category || '—'}</td>
                  <td class="col-actions">
                    <button class="btn-secondary" on:click={() => handleEditItem(item)}>Bearbeiten</button>
                    <button class="btn-danger" on:click={() => handleDeleteItem(item)}>Löschen</button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <footer class="dialog-footer">
        <button type="button" class="btn-tertiary" on:click={handleClose}>Schließen</button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(31, 41, 55, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .dialog {
    width: 520px;
    background: #ffffff;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dialog--wide {
    width: 700px;
  }

  .dialog-header {
    padding: 14px 18px 10px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .dialog-subtitle {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  .dialog-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dialog-footer {
    padding: 12px 18px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #e5e7eb;
  }

  label {
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  select {
    border: 1px solid #cbd5f5;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 13px;
    background: #fdfdfd;
    color: #111827;
  }

  .item-form {
    display: grid;
    grid-template-columns: repeat(3, 1fr) auto;
    gap: 12px;
    align-items: end;
    margin-bottom: 12px;
  }

  .item-actions {
    display: flex;
    gap: 8px;
  }

  .form-errors {
    border: 1px solid #dc2626;
    background: #fee2e2;
    color: #991b1b;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 13px;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .items-table th,
  .items-table td {
    border: 1px solid #e5e7eb;
    padding: 6px 8px;
    text-align: left;
  }

  .items-table tbody tr:nth-child(even) {
    background: #f9fafb;
  }

  .empty {
    text-align: center;
    padding: 16px;
    color: #6b7280;
  }

  .col-actions {
    width: auto;
    white-space: nowrap;
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

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button:hover {
    filter: brightness(0.95);
  }
</style>
