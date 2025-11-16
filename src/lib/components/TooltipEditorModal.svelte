<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tooltipEditor, closeTooltipEditor } from '$lib/stores/tooltipEditor';
  import { invalidateTipCache } from '$lib/actions/tip';

  interface TooltipState {
    open: boolean;
    key: string | null;
  }

  interface TooltipForm {
    key: string;
    en: string;
    de: string;
    category: string;
    active: 0 | 1;
    updated_at: string;
  }

  interface TooltipResponse {
    key?: string;
    en?: string;
    de?: string;
    category?: string;
    active?: number;
    updated_at?: string;
  }

  let state: TooltipState = { open: false, key: null };
  let unsubStore: (() => void) | null = null;

  let form: TooltipForm = { key: '', en: '', de: '', category: '', active: 1, updated_at: '' };
  let keys: string[] = [];
  let categories: string[] = [];
  let loading = false;
  let saving = false;
  let error = '';
  let loadedKey: string | null = null;

  async function loadRecord(key: string) {
    if (!key || key === loadedKey) return;
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/tooltips?key=' + encodeURIComponent(key));
      if (!res.ok) throw new Error('Load failed ' + res.status);
      const row: TooltipResponse = await res.json();
      const data = row || {};
      const resolvedKey = data.key || key;
      form = {
        key: resolvedKey,
        en: data.en || '',
        de: data.de || '',
        category: data.category || '',
        active: typeof data.active === 'number' ? (data.active === 0 ? 0 : 1) : 1,
        updated_at: data.updated_at || ''
      };
      loadedKey = form.key;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function loadKeys() {
    try {
      const res = await fetch('/api/tooltips/keys');
      if (res.ok) {
        const list = await res.json();
        keys = Array.isArray(list) ? list : [];
      }
    } catch {
      // ignore
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/tooltips/categories');
      if (res.ok) {
        const list = await res.json();
        categories = Array.isArray(list) ? list : [];
      }
    } catch {
      // ignore
    }
  }

  async function onSave() {
    if (saving) return;
    error = '';
    if (!form.key) {
      error = 'Key required.';
      return;
    }
    if (!form.en || !form.de) {
      error = 'EN/DE required.';
      return;
    }
    if (!(form.active === 0 || form.active === 1)) {
      error = 'Active must be 0 or 1.';
      return;
    }

    saving = true;
    try {
      const res = await fetch('/api/tooltips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: form.key,
          en: String(form.en).slice(0, 256),
          de: String(form.de).slice(0, 256),
          category: form.category || null,
          active: Number(form.active) === 0 ? 0 : 1
        })
      });
      if (!res.ok) throw new Error('Save failed ' + res.status);
      const saved: TooltipResponse = await res.json();
      form.updated_at = saved.updated_at || form.updated_at;
      if (form.key) {
        invalidateTipCache(form.key);
      }
      closeTooltipEditor();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      saving = false;
    }
  }

  function onCancel() {
    closeTooltipEditor();
  }

  function onKeydown(e: KeyboardEvent) {
    if (!state.open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || e.key === 'F10') {
      e.preventDefault();
      onSave();
    }
  }

  $: if (form.key && form.key !== loadedKey && keys.includes(form.key)) {
    loadRecord(form.key);
  }

  onMount(() => {
    unsubStore = tooltipEditor.subscribe(async (s) => {
      state = s;
      if (!state.open) {
        loadedKey = null;
        return;
      }
      await loadKeys();
      await loadCategories();
      if (state.key) {
        form.key = state.key;
        if (state.key !== loadedKey) {
          await loadRecord(state.key);
        }
      } else {
        form = { key: '', en: '', de: '', category: '', active: 1, updated_at: '' };
        loadedKey = null;
      }
    });
  });

  onDestroy(() => {
    if (unsubStore) unsubStore();
  });
</script>

{#if state.open}
  <div class="tt-backdrop">
    <div class="tt-modal" role="dialog" aria-modal="true" aria-labelledby="tt-title" tabindex="-1" on:keydown|capture={onKeydown}>
      <h2 id="tt-title">Edit Tooltip</h2>

      {#if loading}
        <div class="tt-status">Loading...</div>
      {:else}
        {#if error}<div class="tt-error">{error}</div>{/if}

        <div class="tt-form">
          <label>
            <span>Key</span>
            <input id="tt-key" type="text" list="tt-keys" bind:value={form.key}>
            <datalist id="tt-keys">
              {#each keys as k}<option value={k}>{k}</option>{/each}
            </datalist>
          </label>
          <label><span>EN</span><input id="tt-en" type="text" bind:value={form.en} maxlength="256" required></label>
          <label><span>DE</span><input id="tt-de" type="text" bind:value={form.de} maxlength="256" required></label>
          <label>
            <span>Category</span>
            <input id="tt-category" type="text" list="tt-categories" bind:value={form.category}>
            <datalist id="tt-categories">
              {#each categories as c}<option value={c}>{c}</option>{/each}
            </datalist>
          </label>
          <label>
            <span>Active</span>
            <select bind:value={form.active}>
              <option value={1}>1</option>
              <option value={0}>0</option>
            </select>
          </label>
          <label><span>Updated</span><input id="tt-updated" type="text" bind:value={form.updated_at} readonly></label>
        </div>

        <div class="tt-actions">
          <button class="tt-save" on:click={onSave} disabled={saving}>SAVE</button>
          <button class="tt-cancel" on:click={onCancel}>CANCEL</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .tt-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: grid; place-items: center; z-index: 10000; }
  .tt-modal { width: 560px; max-width: 94vw; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); padding: 16px 16px 12px 16px; }
  #tt-title { margin: 0 0 12px 0; font-size: 18px; font-weight: 700; }
  .tt-status { padding: 8px; }
  .tt-error { color: #a00; background: #fdecec; border: 1px solid #f2bcbc; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; font-size: 13px; }
  .tt-form { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; }
  .tt-form label { display: grid; gap: 6px; font-size: 12px; }
  .tt-form input, .tt-form select { height: 32px; border: 1px solid #ccc; border-radius: 8px; padding: 4px 8px; box-sizing: border-box; font-size: 14px; }
  .tt-form input[readonly] { background: #f7f7f7; color: #666; }
  .tt-actions { margin-top: 14px; display: flex; gap: 10px; justify-content: flex-end; }
  .tt-save { background: #0d6efd; color: #fff; border: 1px solid #0d6efd; border-radius: 8px; height: 34px; padding: 0 14px; cursor: pointer; }
  .tt-cancel { background: #e9ecef; color: #333; border: 1px solid #ced4da; border-radius: 8px; height: 34px; padding: 0 14px; cursor: pointer; }
</style>
