<!-- File: src/routes/estimate/middle_tbl.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import RateDropdown from '$lib/components/RateDropdown.svelte';
  import { handleError } from '$lib/utils/errors';

  export let selectedIdEstimate: any = null;
  export let locked: boolean = false;
  export let booked: boolean = false;

  const dispatch = createEventDispatcher();

  let rates: any[] = [];
  let tax = 0;
  let lines: any[] = [];
  let deletedIds: number[] = [];

  const nf = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt2 = (v: any) => nf.format(toNum(v));
  const toNum = (v: any) => { if (v === '' || v == null) return 0; const n = parseFloat(String(v).replace(',', '.').trim()); return Number.isFinite(n) ? n : 0; };
  const sameId = (a: any, b: any) => Number(a) === Number(b);
  const findRate = (id: any) => rates.find((r) => sameId(r.id_rate, id)) || null;
  const unitPriceOf = (id: any) => toNum(findRate(id)?.rate ?? 0);
  const serviceOf = (id: any) => findRate(id)?.service ?? '';
  const amountOf = (row: any) => toNum(row?.qty) * unitPriceOf(row?.id_rate);

  $: subtotal = (lines || []).filter(r => r?.id_rate && !r?._delete).reduce((a, r) => a + amountOf(r), 0);
  $: gstPct = toNum(tax);
  $: gstSum = subtotal * (gstPct / 100);
  $: grandTotal = subtotal + gstSum;
  $: dispatch('totals', { subtotal, gstSum, gstPct, total: grandTotal });

  function sendDirty(v = true) { dispatch('dirty', { value: !!v }); }
  function sendStats() { const count = (lines || []).filter(r => r && (r.id_rate || r.description || toNum(r.qty) > 0)).length; dispatch('stats', { count }); }

  const arrFromPayload = (p: any) =>
    Array.isArray(p) ? p
    : Array.isArray(p?.rows) ? p.rows
    : Array.isArray(p?.data) ? p.data
    : Array.isArray(p?.items) ? p.items
    : Array.isArray(p?.result) ? p.result
    : Array.isArray(p?.list) ? p.list
    : [];

  function fireSnapshot() { dispatch('snapshot', { lines: getSnapshot() }); }

  async function loadRates() {
    try {
      const res = await fetch('/api/rates');
      if (!res.ok) throw new Error(`/api/rates -> ${res.status}`);
      const arr = arrFromPayload(await res.json());
      rates = arr.map((r: any) => ({
        id_rate: r.id_rate ?? r.id ?? r.ID ?? '',
        service: r.service ?? r.name ?? '',
        description: r.description ?? r.desc ?? '',
        qty: toNum(r.qty ?? 0),
        rate: toNum(r.rate ?? r.price ?? 0),
        blocked: toNum(r.blocked ?? 0)
      })).sort((a, b) => (a.id_rate ?? 0) - (b.id_rate ?? 0));
    } catch (e) {
      handleError(e, 'Leistungen laden');
      rates = [];
    }
  }

  async function loadTax() {
    try {
      const res = await fetch('/api/stammdaten');
      if (!res.ok) throw new Error(`/api/stammdaten -> ${res.status}`);
      const payload = await res.json();
      const first = (Array.isArray(payload) && payload[0]) || (Array.isArray(payload?.rows) && payload.rows[0]) || payload;
      tax = toNum(first?.tax ?? 0);
    } catch (e) {
      handleError(e, 'Steuersatz laden');
      tax = 0;
    }
  }

  async function loadLines(id_estimate: any) {
    if (!id_estimate) { lines = []; deletedIds = []; sendStats(); sendDirty(false); fireSnapshot(); return; }
    try {
      const res = await fetch(`/api/estimates/${encodeURIComponent(id_estimate)}/lines`);
      if (!res.ok) throw new Error(`/api/estimates/${id_estimate}/lines -> ${res.status}`);
      const arr = arrFromPayload(await res.json());
      lines = arr.map((r: any) => ({
        id_line: r.id_line ?? null,
        id_estimate: r.id_estimate ?? id_estimate,
        id_rate: r.id_rate ?? '',
        description: r.description ?? '',
        qty: toNum(r.qty ?? 0),
        blocked: toNum(r.blocked ?? 0),
        editing: false
      }));
      deletedIds = [];
      await tick();
      ensureAlwaysEmptyRow();
      await tick();
      for (const row of lines) { if (row?._descEl) autoGrow(row._descEl); }
      sendStats(); sendDirty(false); fireSnapshot();
    } catch (e) {
      handleError(e, 'Angebotspositionen laden');
      lines = [];
      deletedIds = [];
      sendStats();
      sendDirty(false);
      fireSnapshot();
    }
  }

  export async function reloadFromServer(id_est?: any) { const id = id_est ?? selectedIdEstimate; await loadLines(id); }

  // SAVE via PUT
  export async function saveToServer(id_est?: any) {
    const id = id_est ?? selectedIdEstimate;
    if (!id || locked) return { ok: false, reason: 'no id or locked' };

    const meaningful = (row: any) => !!(row && (row.id_rate || row.description || toNum(row.qty) > 0));
    const linesPayload = (lines || [])
      .filter(meaningful)
      .map(r => ({
        id_line: r.id_line ?? null,
        id_estimate: id,
        id_rate: r.id_rate !== '' ? Number(r.id_rate) : null,
        description: r.description ?? '',
        qty: toNum(r.qty ?? 0)
      }));

    try {
      const res = await fetch(`/api/estimates/${id}/lines`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: linesPayload })
      });

      if (!res.ok) throw new Error(`PUT /api/estimates/${id}/lines -> ${res.status}`);

      await reloadFromServer(id);
      sendDirty(false);
      fireSnapshot();
      return { ok: true };
    } catch (e) {
      handleError(e, 'Angebotspositionen speichern');
      return { ok: false, error: String(e) };
    }
  }

  function createEmptyRow() { return { id_line: null, id_estimate: selectedIdEstimate ?? null, id_rate: '', description: '', qty: 0, _qtyRaw: undefined, blocked: 0, editing: true }; }
  async function ensureAlwaysEmptyRow() { if (!selectedIdEstimate || locked) return; if (!Array.isArray(lines)) lines = []; const last = lines[lines.length - 1]; if (!last || last.id_rate) { lines = [...lines, createEmptyRow()]; await tick(); } }

  // Focus utilities
  function focusQtyAt(i: number) {
    if (locked) return;
    const el = lines?.[i]?._qtyEl;
    if (el) { el.focus(); try { el.select(); } catch { } }
  }
  function onQtyFocus(row: any, i: number, ev: any) {
    if (locked) return;
    if (row._qtyRaw == null) row._qtyRaw = row.qty ? String(row.qty) : '';
    const el = ev?.currentTarget || row?._qtyEl;
    if (el) { try { el.select(); } catch { } }
  }

  async function onRatePick(row: any, idx: number, e: any) {
    if (locked) return;
    row.id_rate = e?.detail?.value ?? '';
    const r = findRate(row.id_rate);
    row.description = r ? (r.description ?? '') : '';
    row.qty = r ? (toNum(r.qty ?? 0) || 1) : 0;
    lines = Object.assign([], lines, { [idx]: row });
    await tick();
    const el = row._descEl; if (el) { el.style.height = '20px'; autoGrow(el); }
    ensureAlwaysEmptyRow(); sendStats(); sendDirty(true); fireSnapshot();
    await tick();
    focusQtyAt(idx);
  }
  function onInputDesc(row: any, idx: number, ev: any) { if (locked) return; row.description = ev?.target?.value ?? ''; lines = Object.assign([], lines, { [idx]: row }); sendStats(); sendDirty(true); fireSnapshot(); }
  function onInputQty(row: any, idx: number, ev: any) {
    if (locked) return;
    row._qtyRaw = ev?.target?.value ?? '';
    lines = Object.assign([], lines, { [idx]: row });
    sendStats(); sendDirty(true); fireSnapshot();
  }

  function onBlurQty(row: any, idx: number) {
    row.qty = toNum(row._qtyRaw ?? row.qty);
    row._qtyRaw = undefined;
    lines = Object.assign([], lines, { [idx]: row });
    sendStats(); sendDirty(true); fireSnapshot();
  }

  function deleteRow(i: number) {
    if (locked) return;
    if (i < 0 || i >= lines.length) return;
    const row = lines[i];
    if (row && row.id_line != null) {
      deletedIds = [...deletedIds, Number(row.id_line)];
    }
    lines = [...lines.slice(0, i), ...lines.slice(i + 1)];
    tick().then(() => { ensureAlwaysEmptyRow(); sendStats(); sendDirty(true); fireSnapshot(); });
  }

  function autoGrow(el: HTMLTextAreaElement) { if (!el) return; el.style.height = '20px'; el.style.height = Math.min(96, el.scrollHeight) + 'px'; }

  onMount(async () => { await Promise.all([loadRates(), loadTax()]); if (selectedIdEstimate) loadLines(selectedIdEstimate); });

  $: if (selectedIdEstimate != null) loadLines(selectedIdEstimate);
  $: if (selectedIdEstimate == null) { lines = []; deletedIds = []; sendStats(); sendDirty(false); fireSnapshot(); }

  // Public snapshot for letter
  export function getSnapshot() {
    const meaningful = (r: any) => !!(r && (r.id_rate || r.description || toNum(r.qty) > 0));
    return (lines || [])
      .filter(meaningful)
      .map((r, i) => ({
        pos: i + 1,
        service: serviceOf(r.id_rate),
        description: r.description ?? '',
        tax: gstPct,
        qty: toNum(r.qty),
        rate: unitPriceOf(r.id_rate),
        amount: amountOf(r)
      }));
  }
</script>

<div class="mid-wrap">
  <table class="tbl">
    <thead>
      <tr>
        <th class="col-rate ta-center">RATE</th>
        <th class="col-service ta-left">SERVICE</th>
        <th class="col-desc ta-left">DESCRIPTION</th>
        <th class="col-gst ta-center">GST&nbsp;%</th>
        <th class="col-qty ta-center">QTY</th>
        <th class="col-unit ta-right">RATE</th>
        <th class="col-amount ta-right">AMOUNT</th>
        <th class="col-delete ta-center">DEL</th>
      </tr>
    </thead>

    <tbody>
      {#each lines as row, i (i)}
        <tr class:blocked={locked && !booked} class:booked={booked}>
          <td class="ta-center">
            {#if selectedIdEstimate}
              <RateDropdown
                items={rates}
                bind:value={row.id_rate}
                disabled={locked || booked}
                menuWidth={480}
                menuMaxHeight={520}
                refocusAfterSelect={false}
                on:change={(e) => onRatePick(row, i, e)} />
            {:else}
              <span>{row.id_rate}</span>
            {/if}
          </td>

          <td class="ta-left">{serviceOf(row.id_rate)}</td>

          <td class="ta-left">
            <textarea
              class="cell-textarea"
              rows="1"
              bind:this={row._descEl}
              bind:value={row.description}
              disabled={locked || booked || !selectedIdEstimate}
              on:input={(e) => { autoGrow(e.currentTarget); onInputDesc(row, i, e); }} />
          </td>

          <td class="ta-center">{row.id_rate ? nf.format(gstPct) + ' %' : ''}</td>

          <td class="ta-right">
            <input
              class="cell-input ta-right"
              type="text"
              inputmode="decimal"
              bind:this={row._qtyEl}
              value={row.id_rate ? (row._qtyRaw ?? fmt2(row.qty)) : ''}
              disabled={locked || booked || !selectedIdEstimate}
              on:focus={(e) => onQtyFocus(row, i, e)}
              on:input={(e) => onInputQty(row, i, e)}
              on:keydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onBlurQty(row, i); } }}
              on:blur={() => onBlurQty(row, i)} />
          </td>

          <td class="ta-right">{row.id_rate ? nf.format(unitPriceOf(row.id_rate)) + ' $' : ''}</td>

          <td class="ta-right col-amount">
            {row.id_rate ? nf.format(amountOf(row)) + ' $' : ''}
          </td>

          <td class="ta-center col-delete">
            {#if !locked && !booked && (row.id_rate || row.description || row.qty)}
              <button class="trash-btn" title="Delete line" aria-label="Delete line" on:click={() => deleteRow(i)}>🗑</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .mid-wrap {
    height: 100%;
    overflow: auto;
    background: #fff;
    --tbl-width: 890px;
    --col-rate-w: 40px;
    --col-service-w: 220px;
    --col-desc-w: 240px;
    --col-gst-w: 60px;
    --col-qty-w: 50px;
    --col-unit-w: 60px;
    --col-amount-w: 80px;
    --col-delete-w: 40px;
  }
  .tbl {
    width: var(--tbl-width);
    border-collapse: collapse;
    table-layout: fixed;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 13px;
    color: #000;
    border: 1px solid #d1d5db;
  }
  .tbl th { overflow: hidden; }
  .tbl td { overflow: visible; }
  thead th {
    position: sticky;
    top: 0;
    background: #f3f4f6;
    z-index: 1;
    border-bottom: 1px solid #cfd3d7;
    padding: 4px 6px;
    font-weight: 700;
    color: #000;
  }

  thead th.col-rate { width: var(--col-rate-w); }
  thead th.col-service { width: var(--col-service-w); }
  thead th.col-desc { width: var(--col-desc-w); }
  thead th.col-gst { width: var(--col-gst-w); }
  thead th.col-qty { width: var(--col-qty-w); }
  thead th.col-unit { width: var(--col-unit-w); }
  thead th.col-amount { width: var(--col-amount-w); }
  thead th.col-delete { width: var(--col-delete-w); }

  thead th + th,
  tbody td + td {
    border-left: 1px solid #d1d5db;
  }

  tbody td {
    border-bottom: 1px solid #ececec;
    padding: 2px 6px;
    height: 24px;
    color: #000;
    vertical-align: middle;
  }
  .tbl td > * {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    vertical-align: middle;
  }

  thead th.col-rate,
  tbody td:nth-child(1) { text-align: center; }
  thead th.col-service,
  tbody td:nth-child(2) { text-align: left; }
  thead th.col-desc,
  tbody td:nth-child(3) { text-align: left; }
  thead th.col-gst,
  tbody td:nth-child(4) { text-align: center; }
  thead th.col-qty { text-align: center; }
  tbody td:nth-child(5) { text-align: right; }
  tbody td:nth-child(5) .cell-input { text-align: right; }
  thead th.col-unit,
  tbody td:nth-child(6) {
    text-align: right;
    white-space: nowrap;
  }
  thead th.col-amount,
  tbody td:nth-child(7) {
    text-align: right;
    white-space: nowrap;
  }
  thead th.col-delete,
  tbody td:nth-child(8) {
    text-align: center;
    vertical-align: middle;
  }

  .cell-input {
    width: 100%;
    height: 20px;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    color: #000;
    -webkit-text-fill-color: #000;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  .cell-input:disabled,
  .cell-input:read-only {
    color: #000;
    -webkit-text-fill-color: #000;
    text-align: inherit;
    opacity: 1;
  }

  .tbl tbody td:nth-child(3) { height: auto; }
  .cell-textarea {
    width: 100%;
    min-height: 20px;
    max-height: 96px;
    line-height: 20px;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    color: #000;
    padding: 0;
    resize: none;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
  .cell-textarea:disabled {
    color: #000;
    -webkit-text-fill-color: #000;
    opacity: 1;
  }

  td :global(.rate-dd) {
    width: var(--col-rate-w);
    height: 20px;
    font-size: 13px;
  }
  td :global(.rate-dd .display) {
    width: 100%;
    height: 20px;
    line-height: 20px;
    padding: 0 2px;
    border: 1px solid transparent !important;
    background: transparent !important;
    text-align: center;
    box-sizing: border-box;
  }

  .trash-btn {
    display: inline-block;
    width: 20px;
    text-align: center;
    border: none;
    background: transparent;
    color: #8a8a8a;
    cursor: pointer;
    padding: 0;
    line-height: normal;
  }
  .trash-btn:hover { color: #000; }

  tr.blocked { background: #f2f2f2; }
  tr.booked { background: #e0e0e0; }
</style>
