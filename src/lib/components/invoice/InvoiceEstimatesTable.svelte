<!-- File: src/lib/components/invoice/InvoiceEstimatesTable.svelte -->
<!-- Right table: Shows estimates list for copying positions -->
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  // Props
  export let items: any[] = [];            // [{ id_estimate, year, num, account, blocked? }, ...]
  export let selectedIndex: number | null = null;  // bindable
  export let invoiceLocked: boolean = false; // Invoice locked? -> Double-click disabled

  const dispatch = createEventDispatcher<{
    select: { index: number; id_estimate: number | null };
    dblpick: { id_estimate: number };
    blocked: { reason: string; id_estimate: number };
  }>();

  // Lock status per id_estimate (0/1)
  let lockMap: Record<number, number> = {};
  let inFlight = new Map<number, AbortController>(); // id -> AbortController

  const getId = (r: any): number => Number(r?.id_estimate ?? r?.id ?? r?.ID ?? NaN);
  const norm01 = (v: any): number => (Number(v) === 1 ? 1 : 0);
  const fromItemsBlocked = (r: any): number => norm01(r?.blocked ?? r?.locked ?? 0);

  function hydrate(list: any[]): void {
    const next = { ...lockMap };
    for (const r of (Array.isArray(list) ? list : [])) {
      const id = getId(r);
      if (!Number.isFinite(id)) continue;
      if (!(id in next)) next[id] = fromItemsBlocked(r);
    }
    lockMap = next;
  }

  // API helpers
  async function apiGet(url: string, ctrl?: AbortController): Promise<any> {
    const res = await fetch(url, { signal: ctrl?.signal });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
  }

  function extractHeader(p: any, id: number): any | null {
    if (!p) return null;
    const pick = (row: any) => Number(row?.id_estimate ?? row?.id ?? row?.ID) === id;
    if (Array.isArray(p)) return p.find(pick) ?? null;
    if (Array.isArray(p?.rows)) return p.rows.find(pick) ?? null;
    if (Array.isArray(p?.data)) return p.data.find(pick) ?? null;
    const pid = Number(p?.id_estimate ?? p?.id ?? p?.ID);
    return Number.isFinite(pid) && pid === id ? p : null;
  }

  async function fetchLocked(id: number, ctrl?: AbortController): Promise<number> {
    try {
      const p = await apiGet(`/estimate?mode=header&id_estimate=${encodeURIComponent(id)}`, ctrl);
      const h = extractHeader(p, id) ?? p;
      return norm01(h?.blocked ?? h?.locked ?? 0);
    } catch {
      const p2 = await apiGet('/estimate', ctrl);
      const h2 = extractHeader(p2, id);
      return norm01(h2?.blocked ?? h2?.locked ?? 0);
    }
  }

  async function refreshLockForId(id: number): Promise<void> {
    if (!Number.isFinite(id)) return;
    if (inFlight.has(id)) { try { inFlight.get(id)?.abort(); } catch {} inFlight.delete(id); }
    const ctrl = new AbortController();
    inFlight.set(id, ctrl);
    try {
      const v = await fetchLocked(id, ctrl);
      lockMap = { ...lockMap, [id]: v };
    } finally {
      inFlight.delete(id);
    }
  }

  async function refreshAllLocks(): Promise<void> {
    const ids = (items || []).map(getId).filter(Number.isFinite);
    await Promise.allSettled(ids.map(refreshLockForId));
  }

  // UI helpers
  function isLocked(row: any): boolean {
    const id = getId(row);
    if (Number.isFinite(id) && (id in lockMap)) return lockMap[id] === 1;
    return fromItemsBlocked(row) === 1;
  }

  function onClick(index: number): void {
    selectedIndex = index;
    const row = items?.[index];
    const id = getId(row);
    dispatch('select', { index, id_estimate: Number.isFinite(id) ? id : null });
    // After click, refresh lock status specifically
    if (Number.isFinite(id)) refreshLockForId(id);
  }

  function onDblClick(index: number): void {
    const row = items?.[index];
    const id = getId(row);
    if (!Number.isFinite(id)) return;

    // Disable double-click if invoice or estimate is locked
    if (invoiceLocked) {
      dispatch('blocked', { reason: 'invoice-locked', id_estimate: id });
      return;
    }
    if (isLocked(row)) {
      dispatch('blocked', { reason: 'estimate-locked', id_estimate: id });
      return;
    }
    dispatch('dblpick', { id_estimate: id });
  }

  // Lifecycle
  onMount(() => { hydrate(items); refreshAllLocks(); });
  $: items && hydrate(items);   // On list change, take initial locks from props
  onDestroy(() => { for (const c of inFlight.values()) { try { c.abort(); } catch {} } inFlight.clear(); });
</script>

<style>
  .estimates-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  .estimates-table thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    background: #c0dfc1;
    color: #000;
    font-weight: 700;
    padding: 8px;
    border: 1px solid #ccc;
    user-select: none;
  }
  .estimates-table tbody td {
    background: #fff;
    height: 32px;
    color: #000;
    padding: 2px 4px;
    border: 1px solid #ccc;
    user-select: none;
    word-break: break-word;
  }

  /* Columns (hide ID) */
  .estimates-table thead th:nth-child(1),
  .estimates-table tbody td:nth-child(1) { display: none; }
  .estimates-table thead th:nth-child(2),
  .estimates-table tbody td:nth-child(2) { width: 20px; text-align: center; }
  .estimates-table thead th:nth-child(3),
  .estimates-table tbody td:nth-child(3) { width: 20px; text-align: center; }
  .estimates-table thead th:nth-child(4),
  .estimates-table tbody td:nth-child(4) { width: 30px; text-align: center; }

  /* Hover & Selection */
  .estimates-table tbody tr:hover td:nth-child(n+2) { background: #d9fbe1; cursor: pointer; }
  .estimates-table tbody tr.selected td:nth-child(n+2) { background: #cce4ff; }
  .estimates-table tbody tr.selected:hover td:nth-child(n+2) { background: #cce4ff !important; }
  .estimates-table tbody tr:focus-visible td:nth-child(n+2) { outline: 2px solid #5b9dd9; outline-offset: -2px; }

  /* Locked: gray out */
  .estimates-table tbody tr.locked td:nth-child(n+2) {
    background: #eeeeee !important;
    color: #777;
  }

  .lock {
    margin-left: 4px;
  }
</style>

<table class="estimates-table">
  <thead>
    <tr>
      <th aria-hidden="true">ID</th>
      <th>Year</th>
      <th>No</th>
      <th>Account</th>
    </tr>
  </thead>
  <tbody>
    {#each items as row, i (row.id_estimate ?? i)}
      {#key row.id_estimate ?? i}
        <tr
          class:selected={i === selectedIndex}
          class:locked={isLocked(row)}
          aria-selected={i === selectedIndex}
          tabindex="0"
          on:click={() => onClick(i)}
          on:dblclick={() => onDblClick(i)}
        >
          <td aria-hidden="true">{row?.id_estimate ?? ''}</td>
          <td>{row?.year ?? ''}</td>
          <td>{row?.num ?? ''}</td>
          <td>
            {row?.account ?? ''}
            {#if isLocked(row)}<span class="lock" title="Locked">🔒</span>{/if}
          </td>
        </tr>
      {/key}
    {/each}
  </tbody>
</table>
