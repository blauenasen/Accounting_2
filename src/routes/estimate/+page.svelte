<!-- File: src/routes/estimate/+page.svelte -->
<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import CustomDropdown from '$lib/components/CustomDropdown.svelte';
  import LeftTbl from './left_tbl.svelte';
  import MiddleTbl from './middle_tbl.svelte';
  import Letter from '$lib/components/Letter.svelte';
  import '$lib/all.css';
  import { tip } from '$lib/actions/tip.js';
  import { handleError } from '$lib/utils/errors';

  const FRAME_TOP = 140;
  const LEFT_WIDTH = 300;
  const FRAME_HEIGHT = 700;
  const TOTALS_LEFT = 952;

  const MID_LEFT = 320;
  const MID_WIDTH = 915;

  const NATURAL_W = 794;
  const NATURAL_H = 1123;
  let letterScale = 1, letterWidth = NATURAL_W, letterHeight = NATURAL_H;
  let letterVersion = 0;
  let showLetter = false;
  let liveLines: any[] = [];

  function computeLetterSize(){
    const winW = (typeof window !== 'undefined') ? window.innerWidth  : NATURAL_W;
    const winH = (typeof window !== 'undefined') ? window.innerHeight : NATURAL_H;
    const letterLeft  = MID_LEFT + MID_WIDTH + 20;
    const rightGutter = 20;
    const availW = Math.max(200, winW - letterLeft - rightGutter);
    const availH = Math.max(200, winH - FRAME_TOP - 20);
    const scale  = Math.min(0.9, availW / NATURAL_W, availH / NATURAL_H);
    letterScale  = scale;
    letterWidth  = NATURAL_W * scale;
    letterHeight = NATURAL_H * scale;
  }

  function onSnapshot(e: any){
    liveLines = e?.detail?.lines ?? [];
    letterVersion += 1;
  }
  function requestSnapshot(){ try{ if (midRef?.getSnapshot) liveLines = midRef.getSnapshot(); }catch{} }

  const moneyNF = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoney = (n: number) => `${moneyNF.format(Number(n || 0))} $`;

  let totals = { subtotal: 0, gstSum: 0, gstPct: 0, total: 0 };
  function onTotals(e: any) { totals = e.detail || totals; requestSnapshot(); }

  // Header
  let id_estimate: number | null = null;
  let year = '';
  let num = '';
  let date = '';
  let dateISO = '';
  let account: number | null = null;

  // Debtor (readonly)
  let debtor = { name:'', address1:'', address2:'', address3:'', email:'' };

  // Datenquellen
  let debtors: any[] = [];
  let estimates: any[] = [];
  let selectedIndex: number | null = null;

  // UI
  let loading = false;
  let saving = false;
  let statusMsg = '';
  let statusType = 'info';

  // Zustände
  let isBlocked = false;
  let headerDirty = false;
  let linesDirty = false;
  let linesCount = 0;

  let originalAccount: number | null = null;
  let originalDateISO = '';

  $: isNew = id_estimate == null;
  $: hasSel = id_estimate != null;
  $: dirty  = !!(headerDirty || linesDirty);

  // Validität: Für NEU keine num erforderlich; für bestehende Datensätze schon.
  $: headerValidNew = !!(date && (account != null) && year);
  $: headerValidExisting = !!(date && (account != null) && year && num);

  $: canSaveBtn   = isNew  && headerValidNew;
  $: canUpdateBtn = hasSel && dirty && !isBlocked;
  $: canLoadOld   = hasSel && dirty && !isBlocked;
  $: canShowPrint = hasSel && !dirty && linesCount > 0;
  $: if (!canShowPrint && showLetter) showLetter = false;

  // Refs
  let refDate: HTMLInputElement, refDropdownWrap: HTMLElement, refName: HTMLInputElement, refAddress1: HTMLInputElement, refAddress2: HTMLInputElement, refAddress3: HTMLInputElement, refEmail: HTMLInputElement;
  let midRef: any;

  const focusOrder = () => [refDate, refDropdownWrap, refName, refAddress1, refAddress2, refAddress3, refEmail];

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  // Datum
  function toISOAny(s: string) {
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    let m = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
    if (m) {
      const [, a,b,y] = m;
      const mm = Number(a)>12 ? b:a, dd = Number(a)>12 ? a:b;
      return `${y}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    }
    m = s.match(/^(\d{4})[./-](\d{2})[./-](\d{2})$/);
    if (m) { const [,y,mm,dd] = m; return `${y}-${mm}-${dd}`; }
    const dt = new Date(s);
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getFullYear(), mm = String(dt.getMonth()+1).padStart(2,'0'), dd = String(dt.getDate()).padStart(2,'0');
      return `${y}-${mm}-${dd}`;
    }
    return '';
  }
  function isoToUS(iso: string){ if(!iso) return ''; const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m) return ''; const [,y,mm,dd]=m; return `${mm}/${dd}/${y}`; }
  function usToISO(us: string){ if(!us) return ''; const m = us.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if(!m) return toISOAny(us); const [,mm,dd,y]=m; return `${y}-${mm}-${dd}`; }

  function setStatus(msg: string, type='info'){ statusMsg = msg ?? ''; statusType = type; if(msg){ const keep=msg; setTimeout(()=>{ if(statusMsg===keep) statusMsg=''; },3500);} }

  async function apiGet(path: string){ const res = await fetch(path); if(!res.ok) throw new Error(`${path} -> ${res.status}`); return res.json(); }

  async function loadDebtors(){ const rows = await apiGet('/estimate?mode=debtors'); debtors = Array.isArray(rows)?rows:[]; }

  async function loadEstimates() {
    const rows = await apiGet('/estimate');
    estimates = (Array.isArray(rows) ? rows : []).map((r: any) => ({
      ...r,
      blocked: Number(r?.blocked ?? r?.locked ?? 0)
    }));
  }

  function syncDebtorDetails(){
    const d = debtors.find((x: any)=>x.account===account);
    debtor = {
      name: d ? `${d.salutation??''} ${d.name??''}`.trim() : '',
      address1: d?.adress1 ?? '',
      address2: d?.adress2 ?? '',
      address3: d?.adress3 ?? '',
      email: d?.email ?? ''
    };
  }

  async function initNewForm(){
    id_estimate = null;
    year = String(new Date().getFullYear());
    num = '';
    dateISO = todayISO();
    date = isoToUS(dateISO);
    account = null;
    debtor = { name:'', address1:'', address2:'', address3:'', email:'' };
    selectedIndex = null;

    isBlocked = false;
    headerDirty = false;
    linesDirty = false;
    linesCount = 0;
    originalAccount = null;
    originalDateISO = '';

    await tick();
    focusDropdown();
    requestSnapshot();
  }

  async function saveOrUpdateHeader(){
    if (saving) {
      return;
    }

    saving = true;
    setStatus('');

    try{
      let didHeader = false;
      let didLines  = false;

      if (isNew) {
        if (!headerValidNew) { setStatus('Header incomplete.', 'error'); return; }
        const dateToSave = usToISO(date) || dateISO || todayISO();
        const resNew = await fetch('/estimate', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ year, date:dateToSave, account:Number(account) })
        });
        if (!resNew.ok) throw new Error(`POST /estimate -> ${resNew.status}`);
        const dataNew = await resNew.json();
        if (typeof dataNew?.id_estimate === 'number') id_estimate = dataNew.id_estimate;
        didHeader = true;

        await loadEstimates();
        const idx = estimates.findIndex((r: any) => Number(r?.id_estimate) === Number(id_estimate));
        if (idx !== -1) {
          await onSelectFromList({ detail: { index: idx, id_estimate } });
        }
      } else {
        if (headerDirty && headerValidExisting) {
          const dateToSave = usToISO(date) || dateISO || todayISO();
          const resUpd = await fetch('/estimate', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ id_estimate:Number(id_estimate), date:dateToSave, account:Number(account) })
          });
          if (!resUpd.ok) throw new Error(`POST /estimate -> ${resUpd.status}`);
          didHeader = true;
          await loadEstimates();
        }
      }

      if (!isNew && linesDirty && midRef && id_estimate) {
        const r = await midRef.saveToServer(id_estimate);
        if (!r?.ok) throw new Error('POST /estimate-db (lines) failed');
        didLines = true;
      }

      originalAccount = account;
      originalDateISO = usToISO(date);
      headerDirty = false;

      if (didHeader && didLines) setStatus('Header & lines updated.','ok');
      else if (didLines)        setStatus('Lines updated.','ok');
      else if (didHeader)       setStatus('Header updated.','ok');
      else                      setStatus('No changes.','info');

      requestSnapshot();
    } catch(e) {
      handleError(e, 'Angebot speichern');
      setStatus('Save/Update failed.','error');
    } finally {
      saving=false;
    }
  }

  async function doReset(){ await initNewForm(); setStatus('Form new.','info'); }

  async function refreshPage(){
    loading=true; setStatus('');
    try{
      await Promise.all([loadDebtors(), loadEstimates()]);
      await initNewForm();
      setStatus('Page refreshed.','ok');
    } catch(e) {
      handleError(e, 'Seite aktualisieren');
      setStatus('Refresh failed.','error');
    } finally {
      loading=false;
    }
  }

  async function reloadOldPositions(){ if(!midRef || !id_estimate) return; await midRef.reloadFromServer(id_estimate); linesDirty=false; requestSnapshot(); }

  function selectOnFocus(e: FocusEvent){ (e.currentTarget as HTMLInputElement)?.select?.(); }
  function handleEnterNavigation(e: KeyboardEvent,ref: any){ if(e.key==='Enter'){ e.preventDefault(); const order=focusOrder(); const i=order.indexOf(ref); const next=order[(i+1)%order.length]; focusElement(next);} }
  function focusElement(ref: any){ if(!ref) return; if(ref===refDropdownWrap){ focusDropdown(); return; } ref.focus?.(); if('select' in ref) ref.select(); }
  function focusDropdown(){ const btn=refDropdownWrap?.querySelector('.dropdown-display') as HTMLElement; btn?.focus(); }

  async function onSelectFromList(e: any){
    const { index, id_estimate: idFromEvent } = e?.detail ?? {};
    if (typeof index !== 'number') return;
    selectedIndex = index;
    const row = estimates?.[index];
    if (!row) return;

    id_estimate = row.id_estimate ?? idFromEvent ?? null;
    year = String(row.year ?? '');
    num = String(row.num ?? '');
    dateISO = toISOAny(row.date) || todayISO();
    date = isoToUS(dateISO);
    account = row.account ?? null;

    isBlocked = !!(row.blocked);

    originalAccount = account;
    originalDateISO = dateISO;
    headerDirty = false;
    linesDirty = false;

    statusMsg = `Selected E-${year}-${num}.`;
    liveLines = [];
    letterVersion += 1;
    computeLetterSize();
    await tick();
    requestSnapshot();
   }

   $: {
    if (hasSel && !isBlocked) {
      const nowISO = usToISO(date) || '';
      headerDirty = (account !== originalAccount) || (nowISO !== (originalDateISO || ''));
    } else if (isNew) {
      headerDirty = false;
    }
  }

  function onLinesDirty(e: any){ linesDirty = !!(e?.detail?.value ?? e?.detail ?? true); }
  function onLinesStats(e: any){
    linesCount = Number(e?.detail?.count ?? 0) || 0;
    requestSnapshot();
  }

  $: if (account!==null) syncDebtorDetails();
  $: if (account===null) debtor={name:'', address1:'', address2:'', address3:'', email:''};

  onMount(async()=>{ try{ document?.documentElement?.setAttribute('lang','en-US'); }catch{} await refreshPage(); computeLetterSize(); if (typeof window!=='undefined'){ window.addEventListener('resize', computeLetterSize); } });
  onDestroy(()=>{ if (typeof window!=='undefined'){ window.removeEventListener('resize', computeLetterSize); } });

  function onLockState(e: any){
    const v = !!(e?.detail?.value ?? false);
    isBlocked = v;
    if (selectedIndex != null && estimates[selectedIndex]) {
      estimates[selectedIndex] = { ...estimates[selectedIndex], blocked: v ? 1 : 0 };
    }
  }

  async function handleDelete() {
    if (!hasSel || isBlocked) return;

    const previewMsg = [
      `Delete estimate ${year}-${num} (${debtor?.name || 'n/a'})?`,
      `${linesCount} line(s), total ${fmtMoney(totals.total)}.`,
      `Continue?`
    ].join('\n');
    const ok1 = window.confirm(previewMsg);
    if (!ok1) return;

    const check = await fetch(`/estimate-db?mode=delete-check&id_estimate=${encodeURIComponent(id_estimate!)}`);
    const checkData = await check.json();
    if (!checkData?.ok) { alert(checkData?.message || 'Delete check failed.'); return; }

    const c = checkData.counts || { header: 1, lines: linesCount };
    const finalMsg = [
      `This will permanently delete: ${c.header} header and ${c.lines} line(s).`,
      `This action cannot be undone.`,
      `Proceed?`
    ].join('\n');
    const ok2 = window.confirm(finalMsg);
    if (!ok2) return;

    const del = await fetch(`/estimate-db?mode=delete&id_estimate=${encodeURIComponent(id_estimate!)}`);
    const delData = await del.json();
    if (!delData?.ok) { alert(delData?.message || 'Deletion failed.'); return; }

    const oldIdx = selectedIndex;
    const oldYear = year, oldNum = num;

    await loadEstimates();

    if (estimates.length === 0) {
      await initNewForm();
      setStatus(`Estimate ${oldYear}-${oldNum} deleted, ${delData?.deleted?.lines ?? 0} line(s) removed.`,'ok');
      return;
    }

    const prevIdx = Math.max(0, Math.min(oldIdx! - 1, estimates.length - 1));
    onSelectFromList({ detail: { index: prevIdx } });

    linesDirty = false;
    totals = { subtotal: 0, gstSum: 0, gstPct: 0, total: 0 };
    setStatus(`Estimate ${oldYear}-${oldNum} deleted, ${delData?.deleted?.lines ?? 0} line(s) removed.`,'ok');
  }

  function letterPositions(){
    return (liveLines||[]).map((r: any)=>({
      pos: r.pos,
      service: r.service,
      description: r.description,
      tax: totals.gstPct ?? r.tax ?? 0,
      qty: Number(r.qty||0),
      rate: Number(r.rate||0),
      amount: Number(r.amount ?? (Number(r.qty||0)*Number(r.rate||0)))
    }));
  }

  function handlePrintOffer(){
    if (!canShowPrint) return;
    const q = new URLSearchParams({
      id: String(id_estimate ?? ''),
      year: String(year ?? ''),
      num: String(num ?? ''),
      date: String(date ?? '')
    }).toString();
    window.open(`/print-offer?${q}`, '_blank', 'noopener,noreferrer');
  }

  async function loadMailDefaults() {
    try {
      const r = await fetch('/send-invoice?mode=defaults', { cache: 'no-store' });
      if (r.ok) { await r.json(); }
    } catch {}
  }
</script>

<div class="page-wrap" style="position:relative;">
  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin:0 0 8px 0; width:100%;">
    <h1 style="margin:0 0 0 10px; font-size:25px; font-weight:bold; line-height:1; flex:1;">ESTIMATES</h1>
    {#if statusMsg}
      <div style="padding:4px 10px; border:3px solid #c7d2fe; border-radius:4px; background-color:#eef2ff; color:#3730a3; font-size:10px; white-space:nowrap; margin-left:auto;">
        {statusMsg}
      </div>
    {/if}
  </div>

  <div style="position:absolute; top:{FRAME_TOP}px; left:10px; width:{LEFT_WIDTH}px; height:{FRAME_HEIGHT}px; box-sizing:border-box; overflow-y:auto; border:1px solid #ccc; background-color:#fff;">
    <LeftTbl items={estimates} bind:selectedIndex on:select={onSelectFromList} />
  </div>

  <div style="position:absolute; top:140px; left:320px; width:915px; height:700px; box-sizing:border-box; overflow-y:auto; border:1px solid #ccc; background-color:#fff;">
    <MiddleTbl
      bind:this={midRef}
      selectedIdEstimate={id_estimate}
      locked={isBlocked}
      on:totals={onTotals}
      on:dirty={onLinesDirty}
      on:stats={onLinesStats}
      on:lockstate={onLockState}
      on:snapshot={onSnapshot} />
  </div>

  <div style="position:absolute; top:{FRAME_TOP + FRAME_HEIGHT + 16}px; left:{TOTALS_LEFT + 6}px; display:flex; justify-content:flex-end;">
    <div style="display:grid; grid-template-columns:auto 120px; column-gap:8px; row-gap:4px; font-size:13px; color:#000;">
      <div style="text-align:right;">Subtotal</div>
      <div style="text-align:right; white-space:nowrap;">{fmtMoney(totals.subtotal)}</div>
      <div style="text-align:right;">GST @ {moneyNF.format(Number(totals.gstPct||0))} %</div>
      <div style="text-align:right; white-space:nowrap;">{fmtMoney(totals.gstSum)}</div>
      <div style="text-align:right; font-weight:700;">Total</div>
      <div style="text-align:right; white-space:nowrap; font-weight:700;">{fmtMoney(totals.total)}</div>
    </div>
  </div>

  <label style="position:absolute; top:90px; left:10px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="text-align:center; display:block; padding-left:4px; margin-bottom:2px;">Year</span>
    <input type="text" value={year} readonly
      style="position:relative; top:0; left:0; width:50px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:center; margin-top:0; box-sizing:border-box; word-break:normal;"
      on:focus={selectOnFocus}/>
  </label>

  <label style="position:absolute; top:90px; left:65px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="text-align:center; display:block; padding-left:4px; margin-bottom:2px;">No.</span>
    <input type="text" bind:value={num} readonly
      style="position:relative; top:0; left:0; width:70px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:center; margin-top:0; box-sizing:border-box; word-break:normal;"
      on:focus={selectOnFocus}/>
  </label>

  <label style="position:absolute; top:90px; left:140px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">Date</span>
    <input
      type="text"
      bind:this={refDate}
      bind:value={date}
      placeholder="MM/DD/YYYY"
      inputmode="numeric"
      pattern="\d{2}/\d{2}/\d{4}"
      style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; text-align: center; height: 28px; position:relative; top:0; left:0; width:120px; height:28px; background-color:#fff; border:1px solid #ccc; padding:4px; text-align:center; margin-top:0; box-sizing:border-box; word-break:normal;"
      on:focus={selectOnFocus}
      on:blur={() => { const iso = usToISO(date); date = iso ? isoToUS(iso) : date; }}
      on:keydown={(e)=>handleEnterNavigation(e,refDate)}/>
  </label>

  <label class="dropdown-wrap" bind:this={refDropdownWrap}
    style="position:absolute; top:90px; left:265px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">Debtor</span>
    <CustomDropdown id="account" items={debtors} bind:value={account} labelKey="name1" valueKey="account" placeholder="-- choose --"/>
  </label>

  <label style="position:absolute; top:90px; left:365px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">Name</span>
    <input type="text" bind:this={refName} value={debtor.name} readonly
      style="position:relative; top:0; left:0; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left; margin-top:0; box-sizing:border-box; word-break:break-word;"
      on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refName)}/>
  </label>

  <label style="position:absolute; top:90px; left:590px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">Address 1</span>
    <input type="text" bind:this={refAddress1} value={debtor.address1} readonly
      style="position:relative; top:0; left:0; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left; margin-top:0; box-sizing:border-box; word-break:break-word;"
      on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refAddress1)}/>
  </label>

  <label style="position:absolute; top:90px; left:815px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">Address 2</span>
    <input type="text" bind:this={refAddress2} value={debtor.address2} readonly
      style="position:relative; top:0; left:0; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left; margin-top:0; box-sizing:border-box; word-break:break-word;"
      on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refAddress2)}/>
  </label>

  <label style="position:absolute; top:90px; left:1040px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">Address 3</span>
    <input type="text" bind:this={refAddress3} value={debtor.address3} readonly
      style="position:relative; top:0; left:0; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left; margin-top:0; box-sizing:border-box; word-break:break-word;"
      on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refAddress3)}/>
  </label>

  <label style="position:absolute; top:90px; left:1265px; margin-top:0; background-color:transparent; padding:0; word-break:normal; box-sizing:border-box;">
    <span style="display:block; padding-left:4px; margin-bottom:2px;">E-Mail</span>
    <input type="text" bind:this={refEmail} value={debtor.email} readonly
      style="position:relative; top:0; left:0; width:240px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left; margin-top:0; box-sizing:border-box; word-break:break-word;"
      on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refEmail)}/>
  </label>

  <div class="estimate-button-container" style="margin-left:10px; display:flex; gap:8px; margin-top:10px;">
    <button class="save" on:click={saveOrUpdateHeader}
      disabled={!canSaveBtn && !canUpdateBtn}
      style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#28a745;">
      {id_estimate==null?'Save':'Update'}
    </button>

    <button class="load" on:click={reloadOldPositions}
      disabled={!canLoadOld}
      title="Reload positions from DB"
      style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#17a2b8;">
      Load Old Positions
    </button>

    <button class="new" on:click={doReset} disabled={loading||saving}
      style="height:30px; width:150px; border-radius:6px; color:gray; border:1px solid #6c757d; box-sizing:border-box; font-weight:bold; background-color:#e2df3e;">
      New
    </button>

    <button class="refresh" on:click={refreshPage} disabled={loading}
      style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#666;">
      Refresh Page
    </button>

    <button
      class="load"
      on:click={() => { if (canShowPrint){ showLetter = !showLetter; computeLetterSize(); requestSnapshot(); } }}
      disabled={!canShowPrint}
      aria-pressed={showLetter}
      title="Letter after left_tbl"
      style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:{showLetter ? '#136b4a' : '#17a2b8'};">
      Show Letter
    </button>

    <button class="load" disabled={!canShowPrint} title="Offer after left_tbl" on:click={handlePrintOffer}
      style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#17a2b8;">
      Print Offer
    </button>

    <button class="delete" on:click={handleDelete}
      disabled={!hasSel || isBlocked}
      title={isBlocked ? 'Locked estimates cannot be deleted' : 'Delete selected estimate'}
      style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#d9534f; opacity:{(!hasSel || isBlocked)?0.5:1}; cursor:{(!hasSel || isBlocked)?'not-allowed':'pointer'};">
      Delete
    </button>
  </div>

  {#if showLetter}
    <div style="position:absolute; top:{FRAME_TOP}px; left:{MID_LEFT + MID_WIDTH + 20}px; width:{letterWidth}px; height:{letterHeight}px;">
      <div style="position:absolute; left:0; top:0; width:{NATURAL_W}px; height:{NATURAL_H}px; transform:scale({letterScale}); transform-origin:0 0;">
        {#key `${id_estimate}-${letterVersion}`}
          <Letter
            receiver={{ name:debtor.name, adress1:debtor.address1, adress2:debtor.address2, adress3:debtor.address3, email:debtor.email }}
            offerNumber={`E-${year}-${num}`}
            offerDate={date}
            positions={letterPositions()}
            subtotal={totals.subtotal}
            gst={totals.gstSum}
            total={totals.total} />
        {/key}
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.a4-container .Estimate-num){ right: 20px; }
  :global(.a4-container .date){ right: 20px; }
</style>
