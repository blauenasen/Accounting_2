<!-- File: src/lib/components/invoice/InvoicePositionsTable.svelte -->
<!-- Middle table: Invoice positions (copied from Original) -->
<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import RateDropdown from '$lib/components/RateDropdown.svelte';
  import { handleError } from '$lib/utils/errors';

  export let selectedIdInvoice = null;
  export let locked = false;

  const dispatch = createEventDispatcher();

  let rates = [];
  let tax   = 0;
  let lines = [];
  let deletedIds = [];

  const nf   = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt2 = (v) => nf.format(toNum(v));
  const toNum = (v) => { if (v === '' || v == null) return 0; const n = parseFloat(String(v).replace(',', '.').trim()); return Number.isFinite(n) ? n : 0; };
  const sameId      = (a, b) => Number(a) === Number(b);
  const findRate    = (id) => rates.find((r) => sameId(r.id_rate, id)) || null;
  const unitPriceOf = (id) => toNum(findRate(id)?.rate ?? 0);
  const serviceOf   = (id) => findRate(id)?.service ?? '';
  const amountOf    = (row) => toNum(row?.qty) * unitPriceOf(row?.id_rate);

  $: subtotal   = (lines || []).filter(r => r?.id_rate && !r?._delete).reduce((a, r) => a + amountOf(r), 0);
  $: gstPct     = toNum(tax);
  $: gstSum     = subtotal * (gstPct / 100);
  $: grandTotal = subtotal + gstSum;
  $: dispatch('totals', { subtotal, gstSum, gstPct, total: grandTotal });

  function sendDirty(v=true){ dispatch('dirty', { value: !!v }); }
  function sendStats(){ const count = (lines||[]).filter(r => r && (r.id_rate || r.description || toNum(r.qty)>0)).length; dispatch('stats', { count }); }

  const arrFromPayload = (p) =>
    Array.isArray(p) ? p
    : Array.isArray(p?.rows)   ? p.rows
    : Array.isArray(p?.data)   ? p.data
    : Array.isArray(p?.items)  ? p.items
    : Array.isArray(p?.result) ? p.result
    : Array.isArray(p?.list)   ? p.list
    : [];

  function fireSnapshot(){ dispatch('snapshot', { lines: getSnapshot() }); }

  async function loadRates(){
    try{
      const res = await fetch('/rates'); if(!res.ok) throw new Error(`/rates -> ${res.status}`);
      const arr = arrFromPayload(await res.json());
      rates = arr.map((r) => ({
        id_rate: r.id_rate ?? r.id ?? r.ID ?? '',
        service: r.service ?? r.name ?? '',
        description: r.description ?? r.desc ?? '',
        qty: toNum(r.qty ?? 0),
        rate: toNum(r.rate ?? r.price ?? 0),
        blocked: toNum(r.blocked ?? 0)
      }));
    } catch(e) {
      handleError(e, 'Leistungen laden');
      rates = [];
    }
  }

  async function loadTax(){
    try{
      const res = await fetch('/stammdaten'); if(!res.ok) throw new Error(`/stammdaten -> ${res.status}`);
      const payload = await res.json();
      const first = (Array.isArray(payload) && payload[0]) || (Array.isArray(payload?.rows) && payload.rows[0]) || payload;
      tax = toNum(first?.tax ?? 0);
    } catch(e) {
      handleError(e, 'Steuersatz laden');
      tax = 0;
    }
  }

  async function loadLines(id_invoice){
    if (!id_invoice) { lines = []; deletedIds=[]; sendStats(); sendDirty(false); fireSnapshot(); return; }
    try{
      const res = await fetch(`/invoice-db?id_invoice=${encodeURIComponent(id_invoice)}`);
      if (!res.ok) throw new Error(`/invoice-db -> ${res.status}`);
      const arr = arrFromPayload(await res.json());
      lines = arr.map((r) => ({
        id_line: r.id_line ?? null,
        id_invoice: r.id_invoice ?? id_invoice,
        id_rate: r.id_rate ?? '',
        description: r.description ?? r.discription ?? '',
        qty: toNum(r.qty ?? 0),
        _qtyRaw: undefined,
        blocked: toNum(r.blocked ?? 0),
        editing: false
      }));
      deletedIds = [];
      await tick();
      ensureAlwaysEmptyRow();
      await tick();
      for (const row of lines) { if (row?._descEl) autoGrow(row._descEl); }
      sendStats(); sendDirty(false); fireSnapshot();
    } catch(e) {
      handleError(e, 'Rechnungspositionen laden');
      lines = [];
      deletedIds = [];
      sendStats();
      sendDirty(false);
      fireSnapshot();
    }
  }

  export async function reloadFromServer(id_inv){ const id = id_inv ?? selectedIdInvoice; await loadLines(id); }

  // SAVE via GET (Replace-Modus)
  export async function saveToServer(id_inv){
    const id = id_inv ?? selectedIdInvoice;
    if (!id || locked) return { ok:false, reason:'no id or locked' };

    const meaningful = (row) => !!(row && (row.id_rate || row.description || toNum(row.qty)>0));
    const linesPayload = (lines || [])
      .filter(meaningful)
      .map(r => ({
        id_line: r.id_line ?? null,
        id_invoice: id,
        id_rate: r.id_rate !== '' ? Number(r.id_rate) : null,
        description: r.description ?? '',
        qty: toNum(r.qty ?? 0)
      }));

    const url = `/invoice-db?mode=savelines&id_invoice=${encodeURIComponent(id)}&lines=${encodeURIComponent(JSON.stringify(linesPayload))}`;

    try{
      const res = await fetch(url, { method:'GET', headers:{ 'Cache-Control':'no-cache' } });
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
      await reloadFromServer(id);
      sendDirty(false);
      fireSnapshot();
      return { ok:true };
    } catch(e) {
      handleError(e, 'Rechnungspositionen speichern');
      return { ok: false, error: String(e) };
    }
  }

  /**
   * Ersetzt ALLE aktuellen Zeilen in der UI – ohne zu speichern.
   * Erwartet Array von { id_rate, description?, qty? }.
   * Markiert standardmäßig als dirty, damit "Update" aktiv wird.
   */
  export async function replaceAllLines(newLines, { markDirty = true } = {}) {
    if (!Array.isArray(newLines)) newLines = [];

    const norm = (r) => ({
      id_line: null,
      id_invoice: selectedIdInvoice ?? null,
      id_rate: r?.id_rate ?? r?.id ?? '',
      description: r?.description ?? '',
      qty: toNum(r?.qty ?? 0),
      _qtyRaw: undefined,
      blocked: 0,
      editing: false
    });

    lines = newLines.map(norm);

    await tick();
    await ensureAlwaysEmptyRow();
    await tick();

    for (const row of lines) { if (row?._descEl) autoGrow(row._descEl); }

    sendStats();
    if (markDirty) sendDirty(true);
    fireSnapshot();
  }

  function createEmptyRow(){ return { id_line:null, id_invoice:selectedIdInvoice ?? null, id_rate:'', description:'', qty:0, _qtyRaw:undefined, blocked:0, editing:true }; }
  async function ensureAlwaysEmptyRow(){ if (!selectedIdInvoice || locked) return; if (!Array.isArray(lines)) lines=[]; const last=lines[lines.length-1]; if (!last || last.id_rate){ lines=[...lines, createEmptyRow()]; await tick(); } }

  // Fokus-Utilities
  function focusQtyAt(i){
    if (locked) return;
    const el = lines?.[i]?._qtyEl;
    if (el) { el.focus(); try{ el.select(); }catch{} }
  }
  function onQtyFocus(row, i, ev){
    if (locked) return;
    if (row._qtyRaw == null) row._qtyRaw = row.qty ? String(row.qty) : '';
    const el = ev?.currentTarget || row?._qtyEl;
    if (el) { try{ el.select(); }catch{} }
  }

  async function onRatePick(row, idx, e){
    if (locked) return;
    row.id_rate = e?.detail?.value ?? '';
    const r = findRate(row.id_rate);
    row.description = r ? (r.description ?? '') : '';
    row.qty         = r ? (toNum(r.qty ?? 0) || 1) : 0;
    lines = Object.assign([], lines, { [idx]: row });
    await tick();
    const el=row._descEl; if(el){ el.style.height='20px'; autoGrow(el); }
    ensureAlwaysEmptyRow(); sendStats(); sendDirty(true); fireSnapshot();
    await tick();
    focusQtyAt(idx);
  }
  function onInputDesc(row, idx, ev){ if (locked) return; row.description = ev?.target?.value ?? ''; lines = Object.assign([], lines, { [idx]: row }); sendStats(); sendDirty(true); fireSnapshot(); }
  function onInputQty(row, idx, ev){
    if (locked) return;
    row._qtyRaw = ev?.target?.value ?? '';
    lines = Object.assign([], lines, { [idx]: row });
    sendStats(); sendDirty(true); fireSnapshot();
  }

  function onBlurQty(row, idx){
    row.qty = toNum(row._qtyRaw ?? row.qty);
    row._qtyRaw = undefined;
    lines = Object.assign([], lines, { [idx]: row });
    sendStats(); sendDirty(true); fireSnapshot();
  }

  function deleteRow(i){
    if (locked) return;
    if (i<0 || i>=lines.length) return;
    const row = lines[i];
    if (row && row.id_line != null) {
      deletedIds = [...deletedIds, Number(row.id_line)];
    }
    lines = [...lines.slice(0,i), ...lines.slice(i+1)];
    tick().then(()=>{ ensureAlwaysEmptyRow(); sendStats(); sendDirty(true); fireSnapshot(); });
  }

  function autoGrow(el){ if(!el) return; el.style.height='20px'; el.style.height = Math.min(96, el.scrollHeight) + 'px'; }

  onMount(async()=>{ await Promise.all([loadRates(), loadTax()]); if (selectedIdInvoice) loadLines(selectedIdInvoice); });

  $: if (selectedIdInvoice != null) loadLines(selectedIdInvoice);
  $: if (selectedIdInvoice == null) { lines = []; deletedIds=[]; sendStats(); sendDirty(false); fireSnapshot(); }

  // öffentlicher Snapshot für den Letter
  export function getSnapshot(){
    const meaningful = (r) => !!(r && (r.id_rate || r.description || toNum(r.qty)>0));
    return (lines||[])
      .filter(meaningful)
      .map((r,i)=>({
        pos: i+1,
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
      </tr>
    </thead>

    <tbody>
      {#each lines as row, i (i)}
        <tr class:blocked={locked}>
          <td class="ta-center">
            {#if selectedIdInvoice}
              <RateDropdown
                items={rates}
                bind:value={row.id_rate}
                disabled={locked}
                menuWidth={480}
                menuMaxHeight={520}
                refocusAfterSelect={false}
                on:change={(e)=>onRatePick(row, i, e)} />
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
              disabled={locked || !selectedIdInvoice}
              on:input={(e)=>{ autoGrow(e.currentTarget); onInputDesc(row, i, e); }}></textarea>
          </td>

          <td class="ta-center">{row.id_rate ? nf.format(gstPct) + ' %' : ''}</td>

          <td class="ta-right">
            <input
              class="cell-input ta-right"
              type="text"
              inputmode="decimal"
              bind:this={row._qtyEl}
              value={row.id_rate ? (row._qtyRaw ?? fmt2(row.qty)) : ''}
              disabled={locked || !selectedIdInvoice}
              on:focus={(e)=>onQtyFocus(row, i, e)}
              on:input={(e)=>onInputQty(row, i, e)}
              on:keydown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onBlurQty(row, i); } }}
              on:blur={() => onBlurQty(row, i)} />
          </td>

          <td class="ta-right">{row.id_rate ? nf.format(unitPriceOf(row.id_rate)) + ' $' : ''}</td>

          <td class="ta-right amount-cell">
            <span class="amount-value">{row.id_rate ? nf.format(amountOf(row)) + ' $' : ''}</span>
            {#if !locked && (row.id_rate || row.description || row.qty)}
              <button class="trash-btn" title="Delete line" aria-label="Delete line" on:click={() => deleteRow(i)}>🗑</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .mid-wrap { height:100%; overflow:auto; background:#fff;
    --tbl-width: 890px;
    --col-rate-w:40px; --col-service-w:230px; --col-desc-w:240px; --col-gst-w:60px; --col-qty-w:50px; --col-unit-w:60px; --col-amount-w:110px;
  }
  .tbl { width:var(--tbl-width); border-collapse:collapse; table-layout:fixed; font-family:Helvetica, Arial, sans-serif; font-size:13px; color:#000; border:1px solid #d1d5db; }
  .tbl th { overflow:hidden; } .tbl td { overflow:visible; }
  thead th { position:sticky; top:0; background:#f3f4f6; z-index:1; border-bottom:1px solid #cfd3d7; padding:4px 6px; font-weight:700; color:#000; }

  thead th.col-rate{width:var(--col-rate-w);} thead th.col-service{width:var(--col-service-w);} thead th.col-desc{width:var(--col-desc-w);}
  thead th.col-gst{width:var(--col-gst-w);} thead th.col-qty{width:var(--col-qty-w);} thead th.col-unit{width:var(--col-unit-w);} thead th.col-amount{width:var(--col-amount-w);}

  thead th + th, tbody td + td { border-left:1px solid #d1d5db; }

  tbody td{ border-bottom:1px solid #ececec; padding:2px 6px; height:24px; color:#000; vertical-align:middle; }
  .tbl td > *{ display:inline-block; height:20px; line-height:20px; vertical-align:middle; }

  thead th.col-rate, tbody td:nth-child(1){ text-align:center; }
  thead th.col-service, tbody td:nth-child(2){ text-align:left; }
  thead th.col-desc, tbody td:nth-child(3){ text-align:left; }
  thead th.col-gst, tbody td:nth-child(4){ text-align:center; }
  thead th.col-qty{ text-align:center; } tbody td:nth-child(5){ text-align:right; } tbody td:nth-child(5) .cell-input{ text-align:right; }
  thead th.col-unit, tbody td:nth-child(6){ text-align:right; white-space:nowrap; }
  thead th.col-amount, tbody td:nth-child(7){ text-align:right; white-space:nowrap; }

  .cell-input{ width:100%; height:20px; border:none; outline:none; background:transparent; font:inherit; color:#000; -webkit-text-fill-color:#000; appearance:none; -webkit-appearance:none; -moz-appearance:none; }
  .cell-input:disabled, .cell-input:read-only{ color:#000; -webkit-text-fill-color:#000; text-align:inherit; opacity:1; }

  .tbl tbody td:nth-child(3){ height:auto; }
  .cell-textarea{ width:100%; min-height:20px; max-height:96px; line-height:20px; border:none; outline:none; background:transparent; font:inherit; color:#000; padding:0; resize:none; white-space:pre-wrap; overflow-wrap:break-word; }
  .cell-textarea:disabled{ color:#000; -webkit-text-fill-color:#000; opacity:1; }

  td :global(.rate-dd){ width:var(--col-rate-w); height:20px; font-size:13px; }
  td :global(.rate-dd .display){ width:100%; height:20px; line-height:20px; padding:0 2px; border:1px solid transparent !important; background:transparent !important; text-align:center; box-sizing:border-box; }

  .amount-cell{ white-space:nowrap; }
  .amount-value{ display:inline-block; vertical-align:middle; }
  .trash-btn{ display:inline-block; width:20px; height:20px; line-height:18px; text-align:center; border:none; background:transparent; color:#8a8a8a; cursor:pointer; margin-left:6px; vertical-align:middle; }
  .trash-btn:hover{ color:#000; }

  tr.blocked { background:#f2f2f2; }
</style>
