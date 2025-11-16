<!-- File: src/lib/components/invoice/invoiceSendModal.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { handleError, handleApiError } from '$lib/utils/errors';

  export let visible = false;

  // Context vom Parent
  export let id_invoice = null;
  export let year = '';
  export let num = '';
  export let date = '';          // UI-Format MM/DD/YYYY
  export let account = null;
  export let debtors = [];
  export let debtor = { name:'', address1:'', address2:'', address3:'', email:'', info:'' };
  export let estimateNr = '';    // z. B. "E-2025-103"
  export let defaultBcc = '';    // aus /send-invoice?mode=defaults

  const dispatch = createEventDispatcher();

  // ----------------- Helpers -----------------
  const isValidEmail = (s) => {
    if (!s) return false;
    const t = String(s).trim();
    if (/[<>]/.test(t)) return false;                // kein "Name <mail>"
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(t);
  };
  const normEmail = (s) => String(s||'').trim().toLowerCase();

  function subjectDefault() {
    const base = `Invoice I-${String(year||'').trim()}-${String(num||'').trim()} - Date ${String(date||'').trim()}`;
    return base;
  }

  function debtorByAccount(){
    return (Array.isArray(debtors)?debtors:[]).find(x => Number(x?.account)===Number(account)) || {};
  }
  function debtorInfoText(){
    const d = debtorByAccount();
    return String(d?.info ?? debtor?.info ?? '').trim();
  }
  function debtorEmail(){
    const d = debtorByAccount();
    return String(d?.email ?? debtor?.email ?? '').trim();
  }

  function formatGreeting(raw){
    const t = String(raw||'').trim();
    if (!t) return '';
    const low = t.toLowerCase();
    if (/^(dear|hello|hi)\b/.test(low)) {
      return /,\s*$/.test(t) ? t : `${t},`;
    }
    return `Dear ${t},`;
  }

  function paymentDueLine(days=0){
    const dt = new Date();
    if (Number.isFinite(+days)) dt.setDate(dt.getDate() + Number(days));
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    const dd = String(dt.getDate()).padStart(2,'0');
    const y  = dt.getFullYear();
    return `Payment due by ${mm}/${dd}/${y}.`;
  }

  // paydate bevorzugt aus Defaults-Endpoint, sonst aus data-Attribut (Fallback)
  let paydateDays = 0;
  function findPaydateFallback(){
    const el = typeof document!=='undefined' ? document.querySelector('[data-paydate]') : null;
    const v = el?.getAttribute?.('data-paydate') ?? '';
    return Number.isFinite(Number(v)) ? Number(v) : 0;
  }

  function bodyDefaultText() {
    const greeting = formatGreeting(debtorInfoText());
    const core = `Enclosed you will find my invoice for the services and materials provided.`;
    const dueLine = paymentDueLine(paydateDays || findPaydateFallback());
    const best = `Best regards`;
    // Abstände nach Vorgabe
    return [greeting, '', core, '', dueLine, '', '', best].filter((x)=>x!=null).join('\n');
  }

  // ----------------- Form state -----------------
  let toRaw = '';
  let bccRaw = '';
  let subject = '';
  let body = '';
  let signaturePreview = { text:'', html:'' };
  let sending = false;

  let defaultsLoaded = false;
  let lastAutoSubject = '';

  async function fetchDefaults(){
    try{
      const r = await fetch(`/send-invoice?mode=defaults&id_invoice=${encodeURIComponent(id_invoice ?? '')}`, { cache:'no-store' });
      if (r.ok){
        const j = await r.json();
        signaturePreview.text = String(j?.signature_text||'');
        signaturePreview.html = String(j?.signature_html||'');
        bccRaw = String((j?.bcc ?? defaultBcc) || '');
        paydateDays = Number(j?.paydate ?? 0) || 0;
        if (!estimateNr && j?.estimateNr) {
          estimateNr = String(j.estimateNr).trim();
        }
        defaultsLoaded = true;
      }
    }catch{/* ignore */}
  }

  // (Re)Seed bei Öffnen (dirty-sicher)
  $: if (visible) {
    if (!defaultsLoaded) fetchDefaults();
    if (!toRaw) {
      const em = debtorEmail();
      if (em) toRaw = em;
    }
    // Auto-Subject initial setzen
    if (!subject) {
      subject = subjectDefault();
      lastAutoSubject = subject;
    }
    // Auto-Subject nachziehen, solange Benutzer nicht editiert hat
    const autoNow = subjectDefault();
    if (subject === lastAutoSubject && subject !== autoNow) {
      subject = autoNow;
      lastAutoSubject = autoNow;
    }
    if (!bccRaw) bccRaw = defaultBcc || '';
    if (!body) body = bodyDefaultText();
  }

  function close(){ if (sending) return; dispatch('close'); }

  function validate(){
    const pieces = String(toRaw||'').split(/[;, ]+/).map(normEmail).filter(Boolean);
    const uniq = Array.from(new Set(pieces));
    if (uniq.length !== 1) return { ok:false, errTo: uniq.length===0 ? 'Recipient required.' : 'Only one recipient allowed.' };
    if (!isValidEmail(uniq[0])) return { ok:false, errTo:'Invalid email address.' };
    if (!debtorInfoText()) return { ok:false, errInfo:'Debtor info is required.' };

    const must = new RegExp(`^Invoice\\s+I-${String(year).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}-${String(num).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`);
    if (!String(subject||'').trim() || !must.test(subject)) return { ok:false, errSubject:'Subject must begin with "Invoice I-YYYY-NNN".' };

    return { ok:true };
  }

  let errors = { to:'', info:'', subject:'' };

  async function doSend(){
    const v = validate();
    errors = { to:'', info:'', subject:'' };
    if (!v.ok){
      errors = { to: v.errTo||'', info: v.errInfo||'', subject: v.errSubject||'' };
      return;
    }
    sending = true;
    try{
      const payload = {
        id_invoice: Number(id_invoice),
        to: [normEmail(toRaw)],
        subject: String(subject||'').trim(),
        body_text: String(body||'').trim() || bodyDefaultText(),
      };
      const r = await fetch('/send-invoice', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        await handleApiError(r, 'Rechnung versenden');
        errors.subject = 'Sending failed.';
        return;
      }
      const j = await r.json();
      if (j?.ok) { dispatch('sent'); close(); }
      else {
        handleError(new Error(j?.error || 'Unbekannter Fehler'), 'Rechnung versenden');
        errors.subject = 'Sending failed.';
      }
    } catch(e) {
      handleError(e, 'Rechnung versenden');
      errors.subject = 'Sending failed.';
    }
    finally{ sending = false; }
  }
</script>

{#if visible}
  <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="send-title">
    <div class="modal">
      <div class="header">
        <h2 id="send-title">Send & Commit</h2>
        <button class="x" on:click={close} aria-label="Close">✕</button>
      </div>

      <div class="row">
        <label class="lbl" for="email-to">To</label>
        <input id="email-to" class="inp" type="email" bind:value={toRaw} placeholder="user@example.com" aria-invalid={!!errors.to} aria-describedby="err-to" />
      </div>
      {#if errors.to}<div id="err-to" class="err">{errors.to}</div>{/if}

      <div class="row">
        <label class="lbl" for="email-bcc">BCC</label>
        <input id="email-bcc" class="inp" type="text" value={bccRaw} readonly />
      </div>

      <div class="row">
        <label class="lbl" for="email-subject">Subject</label>
        <input id="email-subject" class="inp" type="text" bind:value={subject} aria-invalid={!!errors.subject} aria-describedby="err-subject"/>
      </div>
      {#if errors.subject}<div id="err-subject" class="err">{errors.subject}</div>{/if}

      <div class="row">
        <label class="lbl" for="email-body">Body</label>
        <textarea id="email-body" class="ta" rows="9" bind:value={body}></textarea>
      </div>

      {#if errors.info}<div class="err">Debtor info missing.</div>{/if}

      <details class="sig">
        <summary>Signature (Preview)</summary>
        {#if signaturePreview.html}
          <div class="sig-html">
            {@html signaturePreview.html}
          </div>
        {:else if signaturePreview.text}
          <pre class="sig-txt">{signaturePreview.text}</pre>
        {:else}
          <div class="sig-html">(no signature)</div>
        {/if}
      </details>

      <div class="actions">
        <button class="send" on:click={doSend} disabled={sending}>Send & Commit</button>
        <button class="cancel" on:click={close} disabled={sending}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay{ position:fixed; inset:0; background:rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; z-index:1000; }
  .modal{ width:740px; max-width:92vw; background:#fff; color:#000; border:1px solid #ccc; border-radius:6px; padding:12px; font-family:Helvetica, Arial, sans-serif; }
  .header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .header h2{ margin:0; font-size:16px; }
  .x{ border:none; background:transparent; cursor:pointer; font-size:18px; }
  .row{ display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center; margin:6px 0; }
  .lbl{ text-align:right; font-size:13px; }
  .inp{ width:100%; height:28px; border:1px solid #ccc; padding:4px 6px; font:inherit; font-size:13px; background:#fff; color:#000; }
  .ta{ width:100%; border:1px solid #ccc; padding:6px; resize:vertical; min-height:120px; font:inherit; font-size:13px; color:#000; background:#fff; white-space:pre-wrap; }
  .sig{ margin-top:10px; }
  .sig summary{ cursor:pointer; font-size:13px; }
  .sig-html{ padding:8px; border:1px dashed #ddd; background:#fafafa; font-size:13px; }
  .sig-txt{ margin:0; padding:8px; border:1px dashed #ddd; background:#fafafa; white-space:pre-wrap; font-size:13px; }
  .actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
  .send{ background:#136b4a; color:#fff; border:1px solid #0f5132; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px; }
  .cancel{ background:#eee; color:#000; border:1px solid #bbb; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px; }
  .err{ color:#b00020; font-size:12px; margin:2px 0 6px 88px; }
</style>
