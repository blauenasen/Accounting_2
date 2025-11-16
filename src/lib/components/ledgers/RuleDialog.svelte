<!-- Module: src/lib/components/ledgers/RuleDialog.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let visible = false;
  export let mode: 'create' | 'edit' = 'create';
  export let form: Record<string, unknown> = {};
  export let errors: string[] = [];
  export let saving = false;
  export let companyCodes: Array<{ no: number; textcode: string }> = [];
  export let categoryOptions: string[] = [];

  const dispatch = createEventDispatcher();

  function handleSubmit(): void {
    dispatch('submit');
  }

  function handleClose(): void {
    dispatch('close');
  }
</script>

{#if visible}
  <div class="dialog-backdrop" role="dialog" aria-modal="true">
    <form class="dialog" on:submit|preventDefault={handleSubmit}>
      <header class="dialog-header">
        <h2>{mode === 'edit' ? 'Regel bearbeiten' : 'Neue Regel erstellen'}</h2>
      </header>

      <div class="dialog-body">
        <div class="field-grid">
          <label>
            Book Circle
            <select bind:value={form.no} disabled={mode === 'edit'}>
              {#each companyCodes as code}
                <option value={code.no}>{code.no} — {code.textcode}</option>
              {/each}
            </select>
          </label>

          <label>
            Side
            <select bind:value={form.side}>
              <option value="HK">HK — Hauptkonto</option>
              <option value="CK">CK — Gegenkonto</option>
            </select>
          </label>

          <label>
            Kategorie
            <select bind:value={form.category}>
              <option value="">(Keine)</option>
              {#each categoryOptions as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </label>

          <label>
            Konto von
            <input type="number" bind:value={form.account_min} placeholder="optional" />
          </label>

          <label>
            Konto bis
            <input type="number" bind:value={form.account_max} placeholder="optional" />
          </label>

          <label class="checkbox-field">
            <input type="checkbox" bind:checked={form.active} />
            <span>Aktiv</span>
          </label>
        </div>

        <label class="description-field">
          Beschreibung
          <textarea rows="3" bind:value={form.description} placeholder="Optional"></textarea>
        </label>

        {#if errors.length}
          <div class="form-errors" role="alert">
            {#each errors as error}
              <div>{error}</div>
            {/each}
          </div>
        {/if}
      </div>

      <footer class="dialog-footer">
        <button type="submit" class="btn-primary" disabled={saving}>
          {saving ? 'Speichern …' : 'OK'}
        </button>
        <button type="button" class="btn-tertiary" on:click={handleClose}>Abbrechen</button>
      </footer>
    </form>
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

  .dialog-header {
    padding: 14px 18px 10px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
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

  .field-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  label {
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  input[type='number'],
  select,
  textarea {
    border: 1px solid #cbd5f5;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 13px;
    background: #fdfdfd;
    color: #111827;
  }

  textarea {
    resize: vertical;
  }

  .checkbox-field {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .description-field {
    width: 100%;
  }

  .form-errors {
    border: 1px solid #dc2626;
    background: #fee2e2;
    color: #991b1b;
    padding: 8px 10px;
    border-radius: 4px;
    font-size: 13px;
  }

  .btn-primary,
  .btn-tertiary {
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: filter 0.15s ease-in-out;
  }

  .btn-primary { background: #2563eb; color: #fff; }
  .btn-tertiary { background: #9ca3af; color: #fff; }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button:hover {
    filter: brightness(0.95);
  }
</style>
