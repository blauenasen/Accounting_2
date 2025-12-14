<!-- File: src/lib/components/invoice/InvoiceListTable.svelte -->
<!-- Left table: Shows invoice list for selection -->
<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { handleError } from '$lib/utils/errors';

  export let items: any[] = [];
  export let selectedIndex: number | null = null;

  const dispatch = createEventDispatcher<{
    select: { index: number; id_invoice: number | null };
  }>();

  let lockMap: Record<number, number> = {};
  let inFlight = new Map<number, AbortController>();
  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  const getId = (row: any): number => Number(row?.id_invoice ?? row?.id ?? row?.ID ?? NaN);
  const norm01 = (v: any): number => (Number(v) === 1 ? 1 : 0);
  const fromItemsBlocked = (row: any): number => norm01(row?.blocked ?? row?.locked ?? 0);

  function hydrateFromItems(list: any[]): void {
    const next = { ...lockMap };
    for (const r of (Array.isArray(list) ? list : [])) {
      const id = getId(r);
      if (!Number.isFinite(id)) continue;
      if (!(id in next)) next[id] = fromItemsBlocked(r);
    }
    lockMap = next;
  }

  function selectRow(index: number): void {
    console.log('InvoiceListTable selectRow called - index:', index);
    selectedIndex = index;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(async () => {
      const row = items?.[index];
      const id = getId(row);
      console.log('InvoiceListTable dispatching select - index:', index, 'id_invoice:', id, 'row:', row);
      dispatch('select', { index, id_invoice: Number.isFinite(id) ? id : null });
      if (Number.isFinite(id)) {
        await refreshLockForId(id);
      }
    }, 120);
  }

  function onKeydown(e: KeyboardEvent, index: number): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectRow(index);
    }
  }

  onMount(() => {
    hydrateFromItems(items);
    silentRefreshAllLocks();
  });

  $: if (items) {
    console.log('InvoiceListTable items changed - count:', items.length, 'items:', items);
    hydrateFromItems(items);
  }

  onDestroy(() => {
    if (clickTimer) clearTimeout(clickTimer);
    for (const ctrl of inFlight.values()) {
      try { ctrl.abort(); } catch {}
    }
    inFlight.clear();
  });

  async function apiGet(url: string, controller?: AbortController): Promise<any> {
    const res = await fetch(url, { signal: controller?.signal });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
  }

  function extractHeader(payload: any, id: number): any | null {
    if (!payload) return null;
    if (Array.isArray(payload)) {
      return payload.find(r => Number(r?.id_invoice ?? r?.id ?? r?.ID) === id) ?? null;
    }
    if (Array.isArray(payload?.rows)) {
      return payload.rows.find(r => Number(r?.id_invoice ?? r?.id ?? r?.ID) === id) ?? null;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data.find(r => Number(r?.id_invoice ?? r?.id ?? r?.ID) === id) ?? null;
    }
    const pid = Number(payload?.id_invoice ?? payload?.id ?? payload?.ID);
    if (Number.isFinite(pid) && pid === id) return payload;
    return null;
  }

  async function fetchHeaderLocked(id: number, controller?: AbortController): Promise<number> {
    try {
      const p = await apiGet(`/invoice?mode=header&id_invoice=${encodeURIComponent(id)}`, controller);
      const h = extractHeader(p, id) ?? p;
      const v = norm01(h?.blocked ?? h?.locked ?? 0);
      return v;
    } catch (_) {}
    const p2 = await apiGet('/invoice', controller);
    const h2 = extractHeader(p2, id);
    const v2 = norm01(h2?.blocked ?? h2?.locked ?? 0);
    return v2;
  }

  async function refreshLockForId(id: number): Promise<void> {
    if (inFlight.has(id)) {
      try { inFlight.get(id)?.abort(); } catch {}
      inFlight.delete(id);
    }
    const ctrl = new AbortController();
    inFlight.set(id, ctrl);
    try {
      const v = await fetchHeaderLocked(id, ctrl);
      lockMap = { ...lockMap, [id]: v };
    } catch (e: any) {
      // Ignore AbortError (normal when user switches quickly between invoices)
      if (e?.name !== 'AbortError') {
        handleError(e, 'Refresh lock status', { silent: true });
      }
    } finally {
      inFlight.delete(id);
    }
  }

  async function silentRefreshAllLocks(): Promise<void> {
    const ids = (items || []).map(getId).filter(Number.isFinite);
    const limit = 4;
    let i = 0;
    async function nextBatch(): Promise<void> {
      const batch = [];
      for (let k = 0; k < limit && i < ids.length; k++, i++) {
        batch.push(refreshLockForId(ids[i]));
      }
      if (batch.length) {
        await Promise.allSettled(batch);
        return nextBatch();
      }
    }
    await nextBatch();
  }

  function isLocked(row: any): boolean {
    const id = getId(row);
    if (Number.isFinite(id) && (id in lockMap)) return lockMap[id] === 1;
    return fromItemsBlocked(row) === 1;
  }
</script>

<style>
  .invoice-list-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  .invoice-list-table thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    background-color: #c0dfc1;
    color: #000;
    font-weight: bold;
    padding: 8px;
    border: 1px solid #ccc;
    user-select: none;
  }
  .invoice-list-table tbody td {
    background-color: #fff;
    height: 32px;
    color: #000;
    padding: 2px;
    border: 1px solid #ccc;
    user-select: none;
    word-break: break-word;
  }

  .invoice-list-table thead th:nth-child(1),
  .invoice-list-table tbody td:nth-child(1) { display: none; }
  .invoice-list-table thead th:nth-child(2),
  .invoice-list-table tbody td:nth-child(2) { width: 20px; text-align: center; }
  .invoice-list-table thead th:nth-child(3),
  .invoice-list-table tbody td:nth-child(3) { width: 20px; text-align: center; }
  .invoice-list-table thead th:nth-child(4),
  .invoice-list-table tbody td:nth-child(4) { width: 30px; text-align: center; }

  .invoice-list-table tbody tr:hover td:nth-child(n+2) { background-color: #d9fbe1; cursor: pointer; }
  .invoice-list-table tbody tr.selected td:nth-child(n+2) { background-color: #cce4ff; }
  .invoice-list-table tbody tr.selected:hover td:nth-child(n+2) { background-color: #cce4ff !important; }

  .invoice-list-table tbody tr:focus-visible td:nth-child(n+2) {
    outline: 2px solid #5b9dd9;
    outline-offset: -2px;
  }

  .lock { margin-left: 4px; }
</style>

<table class="invoice-list-table">
  <thead>
    <tr>
      <th aria-hidden="true">ID</th>
      <th>Year</th>
      <th>No</th>
      <th>Account</th>
    </tr>
  </thead>
  <tbody>
    {#each items as row, i (row.id_invoice ?? i)}
      <tr
        class:selected={i === selectedIndex}
        aria-selected={i === selectedIndex}
        tabindex="0"
        on:click={() => selectRow(i)}
        on:keydown={(e) => onKeydown(e, i)}
      >
        <td aria-hidden="true">{row?.id_invoice ?? ''}</td>
        <td>{row?.year ?? ''}</td>
        <td>{row?.num ?? ''}</td>
        <td>
          {row?.account ?? ''}
          {#if isLocked(row)}<span class="lock" title="Locked">🔒</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
