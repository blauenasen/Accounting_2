<!-- File: src/routes/estimate/left_tbl.svelte -->
<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  // Props: complete list of estimates (including id_estimate, year, num, account, blocked)
  export let items: any[] = [];
  // Bindable selection (index in items)
  export let selectedIndex: number | null = null;

  const dispatch = createEventDispatcher();

  // Internal status maps: id_estimate -> 0/1
  let lockMap: Record<number, number> = {};
  let bookedMap: Record<number, number> = {};
  let inFlight = new Map(); // id_estimate -> AbortController
  let clickTimer: number | null = null;

  // Utils
  const getId = (row: any) => Number(row?.id_estimate ?? row?.id ?? row?.ID ?? NaN);
  const norm01 = (v: any) => (Number(v) === 1 ? 1 : 0);
  const fromItemsBlocked = (row: any) => norm01(row?.blocked ?? row?.locked ?? 0);
  const fromItemsBooked = (row: any) => norm01(row?.booked ?? 0);

  // Initial hydration from props (immediate display), later correct via fetch
  function hydrateFromItems(list: any[]) {
    const nextLock = { ...lockMap };
    const nextBooked = { ...bookedMap };
    for (const r of (Array.isArray(list) ? list : [])) {
      const id = getId(r);
      if (!Number.isFinite(id)) continue;
      if (!(id in nextLock)) nextLock[id] = fromItemsBlocked(r);
      if (!(id in nextBooked)) nextBooked[id] = fromItemsBooked(r);
    }
    lockMap = nextLock;
    bookedMap = nextBooked;
  }

  // Event debounce & selection
  function selectRow(index: number) {
    selectedIndex = index;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = window.setTimeout(async () => {
      const row = items?.[index];
      const id = getId(row);
      // Selection event immediately (no UX blocking)
      dispatch('select', { index, id_estimate: Number.isFinite(id) ? id : null });
      // Fetch lock status specifically and correct display
      if (Number.isFinite(id)) {
        await refreshLockForId(id);
      }
    }, 120);
  }

  function onKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectRow(index);
    }
  }

  onMount(() => {
    hydrateFromItems(items);
    // Optional: silently refresh lock status for visible list (without wait)
    silentRefreshAllLocks();
  });

  // React to list changes (e.g. refresh/save)
  $: if (items) {
    hydrateFromItems(items);
  }

  onDestroy(() => {
    if (clickTimer) clearTimeout(clickTimer);
    for (const ctrl of inFlight.values()) {
      try { (ctrl as AbortController).abort(); } catch {}
    }
    inFlight.clear();
  });

  // ---------------------------
  // Backend query for header
  // ---------------------------

  async function apiGet(url: string, controller?: AbortController) {
    const res = await fetch(url, { signal: controller?.signal });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
  }

  function extractHeader(payload: any, id: number) {
    // Try common structures: object directly, array of objects, {rows:[...]}, {data:[...]} etc.
    if (!payload) return null;
    if (Array.isArray(payload)) {
      return payload.find(r => Number(r?.id_estimate ?? r?.id ?? r?.ID) === id) ?? null;
    }
    if (Array.isArray(payload?.rows)) {
      return payload.rows.find(r => Number(r?.id_estimate ?? r?.id ?? r?.ID) === id) ?? null;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data.find(r => Number(r?.id_estimate ?? r?.id ?? r?.ID) === id) ?? null;
    }
    // A single object?
    const pid = Number(payload?.id_estimate ?? payload?.id ?? payload?.ID);
    if (Number.isFinite(pid) && pid === id) return payload;
    return null;
  }

  async function fetchHeaderStatus(id: number, controller?: AbortController): Promise<{ blocked: number; booked: number }> {
    // 1) prefer dedicated header endpoint
    try {
      const p = await apiGet(`/api/estimates?id_estimate=${encodeURIComponent(id)}`, controller);
      const h = extractHeader(p, id) ?? p;
      return {
        blocked: norm01(h?.blocked ?? h?.locked ?? 0),
        booked: norm01(h?.booked ?? 0)
      };
    } catch (_) {}

    // 2) Fallback: full list /api/estimates and filter matching record
    const p2 = await apiGet('/api/estimates', controller);
    const h2 = extractHeader(p2, id);
    return {
      blocked: norm01(h2?.blocked ?? h2?.locked ?? 0),
      booked: norm01(h2?.booked ?? 0)
    };
  }

  async function refreshLockForId(id: number) {
    // Already requested? → cancel running request and restart
    if (inFlight.has(id)) {
      try { (inFlight.get(id) as AbortController).abort(); } catch {}
      inFlight.delete(id);
    }
    const ctrl = new AbortController();
    inFlight.set(id, ctrl);
    try {
      const status = await fetchHeaderStatus(id, ctrl);
      // Set maps reactively
      lockMap = { ...lockMap, [id]: status.blocked };
      bookedMap = { ...bookedMap, [id]: status.booked };
    } catch (e) {
      // On error: keep existing value
      // console.error('status refresh failed', id, e);
    } finally {
      inFlight.delete(id);
    }
  }

  async function silentRefreshAllLocks() {
    const ids = (items || []).map(getId).filter(Number.isFinite);
    // Gentle limit: parallel 4
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

  // Display helpers: prefer freshly loaded value, otherwise prop
  function isLocked(row: any) {
    const id = getId(row);
    if (Number.isFinite(id) && (id in lockMap)) return lockMap[id] === 1;
    return fromItemsBlocked(row) === 1;
  }

  function isBooked(row: any) {
    const id = getId(row);
    if (Number.isFinite(id) && (id in bookedMap)) return bookedMap[id] === 1;
    return fromItemsBooked(row) === 1;
  }
</script>

<style>
  /* Basic table layout */
  .estimate-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  .estimate-table thead th {
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
  .estimate-table tbody td {
    background-color: #fff;
    height: 32px;
    color: #000;
    padding: 2px;
    border: 1px solid #ccc;
    user-select: none;
    word-break: break-word;
  }

  /* Column widths + hide ID column (4 columns total) */
  .estimate-table thead th:nth-child(1),
  .estimate-table tbody td:nth-child(1) {
    display: none;
  }
  .estimate-table thead th:nth-child(2),
  .estimate-table tbody td:nth-child(2) {
    width: 20px;
    text-align: center;
  }
  .estimate-table thead th:nth-child(3),
  .estimate-table tbody td:nth-child(3) {
    width: 20px;
    text-align: center;
  }
  .estimate-table thead th:nth-child(4),
  .estimate-table tbody td:nth-child(4) {
    width: 30px;
    text-align: center;
  }

  /* Hover (light green) & Selected (light blue) */
  .estimate-table tbody tr:hover td:nth-child(n+2) {
    background-color: #d9fbe1;
    cursor: pointer;
  }
  .estimate-table tbody tr.selected td:nth-child(n+2) {
    background-color: #cce4ff;
  }
  .estimate-table tbody tr.selected:hover td:nth-child(n+2) {
    background-color: #cce4ff !important;
  }

  /* Keyboard focus visible */
  .estimate-table tbody tr:focus-visible td:nth-child(n+2) {
    outline: 2px solid #5b9dd9;
    outline-offset: -2px;
  }

  /* Status icons minimal, layout unchanged */
  .lock, .booked {
    margin-left: 4px;
  }
</style>

<table class="estimate-table">
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
      <tr
        class:selected={i === selectedIndex}
        aria-selected={i === selectedIndex}
        tabindex="0"
        on:click={() => selectRow(i)}
        on:keydown={(e) => onKeydown(e, i)}
      >
        <td aria-hidden="true">{row?.id_estimate ?? ''}</td>
        <td>{row?.year ?? ''}</td>
        <td>{row?.num ?? ''}</td>
        <td>
          {row?.account ?? ''}
          {#if isLocked(row)}<span class="lock" title="Locked">🔒</span>{/if}
          {#if isBooked(row)}<span class="booked" title="Booked">📚</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
