<!-- File: src/lib/components/invoice/invoiceHeaderFields.svelte -->
<script>
  import CustomDropdown from '$lib/components/CustomDropdown.svelte';

  // Header-Felder (2-Way Bindings vom Parent)
  export let year = '';
  export let num = '';
  export let date = '';
  export let account = null;

  // Debtor-Readonly-Felder (vom Parent synchronisiert)
  export let debtor = { name:'', address1:'', address2:'', address3:'', email:'' };

  // Datenquelle Debitors für Dropdown
  export let debtors = [];

  // Refs + Fokussteuerung (unverändert)
  let refDate, refDropdownWrap, refName, refAddress1, refAddress2, refAddress3, refEmail;
  const focusOrder = () => [refDate, refDropdownWrap, refName, refAddress1, refAddress2, refAddress3, refEmail];

  function selectOnFocus(e){ e.currentTarget?.select?.(); }
  function handleEnterNavigation(e,ref){ if(e.key==='Enter'){ e.preventDefault(); const order=focusOrder(); const i=order.indexOf(ref); const next=order[(i+1)%order.length]; focusElement(next);} }
  function focusElement(ref){ if(!ref) return; if(ref===refDropdownWrap){ focusDropdown(); return; } ref.focus?.(); if('select' in ref) ref.select(); }
  function focusDropdown(){ const btn=refDropdownWrap?.querySelector('.dropdown-display'); btn?.focus(); }

  // ----------------- Datum (mit "/" + Abwärtskompatibilität für ".") -----------------
  function toISOAny(s) {
    if (!s) return '';
    const t = String(s).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

    const u = t
      .replace(/^(\d{2})\.(\d{2})\.(\d{4})$/, '$1/$2/$3')
      .replace(/^(\d{4})\.(\d{2})\.(\d{2})$/, '$1-$2-$3');

    let m = u.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) { const [, mm, dd, y] = m; return `${y}-${mm}-${dd}`; }

    m = u.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (m) { const [, y, mm, dd] = m; return `${y}-${mm}-${dd}`; }

    const dt = new Date(u);
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getFullYear(), mm = String(dt.getMonth()+1).padStart(2,'0'), dd = String(dt.getDate()).padStart(2,'0');
      return `${y}-${mm}-${dd}`;
    }
    return '';
  }
  function isoToUS(iso){
    if(!iso) return '';
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return '';
    const [,y,mm,dd]=m;
    return `${mm}/${dd}/${y}`;
  }
  function usToISO(us){
    if(!us) return '';
    const m = String(us).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(!m) return toISOAny(us);
    const [,mm,dd,y]=m;
    return `${y}-${mm}-${dd}`;
  }
</script>

<!-- Year -->
<label style="position:absolute; top:90px; left:10px;">
  <span style="text-align:center; display:block; padding-left:4px; margin-bottom:2px;">Year</span>
  <input type="text" value={year} readonly
    style="position:relative; width:50px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:center;"/>
</label>

<!-- No. -->
<label style="position:absolute; top:90px; left:65px;">
  <span style="text-align:center; display:block; padding-left:4px; margin-bottom:2px;">No.</span>
  <input type="text" value={num} readonly
    style="position:relative; width:70px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:center;"/>
</label>

<!-- Date -->
<label style="position:absolute; top:90px; left:140px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">Date</span>
  <input
    type="text"
    bind:this={refDate}
    bind:value={date}
    placeholder="MM/DD/YYYY"
    inputmode="numeric"
    pattern="\d{2}\/\d{2}\/\d{4}"
    style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; text-align: center; height: 28px; width:120px; background-color:#fff; border:1px solid #ccc; padding:0px;"
    on:focus={selectOnFocus}
    on:blur={() => { const iso = usToISO(date); date = iso ? isoToUS(iso) : date; }}
    on:keydown={(e)=>handleEnterNavigation(e,refDate)}/>
</label>

<!-- Debtor -->
<label class="dropdown-wrap" bind:this={refDropdownWrap}
  style="position:absolute; top:90px; left:255px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">Debtor</span>
  <CustomDropdown id="account" items={debtors} bind:value={account} labelKey="name1" valueKey="account" placeholder="-- choose --"/>
</label>

<!-- Name -->
<label style="position:absolute; top:90px; left:365px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">Name</span>
  <input type="text" bind:this={refName} value={debtor.name} readonly
    style="position:relative; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:left;"
    on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refName)}/>
</label>

<!-- Address 1 -->
<label style="position:absolute; top:90px; left:590px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">Address 1</span>
  <input type="text" bind:this={refAddress1} value={debtor.address1} readonly
    style="position:relative; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:left;"
    on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refAddress1)}/>
</label>

<!-- Address 2 -->
<label style="position:absolute; top:90px; left:815px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">Address 2</span>
  <input type="text" bind:this={refAddress2} value={debtor.address2} readonly
    style="position:relative; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:left;"
    on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refAddress2)}/>
</label>

<!-- Address 3 -->
<label style="position:absolute; top:90px; left:1040px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">Address 3</span>
  <input type="text" bind:this={refAddress3} value={debtor.address3} readonly
    style="position:relative; width:220px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:left;"
    on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refAddress3)}/>
</label>

<!-- E-Mail -->
<label style="position:absolute; top:90px; left:1265px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">E-Mail</span>
  <input type="text" bind:this={refEmail} value={debtor.email} readonly
    style="position:relative; width:240px; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:0px; text-align:left;"
    on:focus={selectOnFocus} on:keydown={(e)=>handleEnterNavigation(e,refEmail)}/>
</label>
