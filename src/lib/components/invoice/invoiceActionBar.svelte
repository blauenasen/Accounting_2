<!-- File: src/lib/components/invoice/invoiceActionBar.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  // Eingaben (vom Parent gesteuert)
  export let id_invoice = null;
  export let canSaveBtn = false;
  export let canUpdateBtn = false;
  export let canLoadOld = false;
  export let canShowPrint = false;
  export let canSendCommitBtn = false;
  export let hasSel = false;
  export let isBlocked = false;
  export let loading = false;
  export let saving = false;
  export let showLetter = false;
  export let canHandover = false; // New prop for handover button
  export let booked = false; // Invoice booked status

  const dispatch = createEventDispatcher();

  // Event-Wrapper (keine Logik/Seiteneffekte – Parent führt aus)
  function onSave()        { dispatch('save'); }
  function onLoadOld()     { dispatch('loadOld'); }
  function onNew()         { dispatch('new'); }
  function onRefresh()     { dispatch('refresh'); }
  function onToggleLetter(){ if (canShowPrint) dispatch('toggleLetter', { value: !showLetter }); }
  function onPrint()       { if (canShowPrint) dispatch('print'); }
  function onDelete()      { if (hasSel && !isBlocked) dispatch('delete'); }
  function onSend()        { if (canSendCommitBtn) dispatch('send'); }
  function onHandover()    { if (canHandover) dispatch('handover'); }
</script>

<!-- Buttons (Position & Layout 1:1 wie in +page.svelte) -->
<div class="estimate-button-container" style="margin-left:10px; display:flex; gap:8px; margin-top:10px;">
  <button class="save" on:click={onSave}
    disabled={!canSaveBtn && !canUpdateBtn}
    style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#28a745;">
    {id_invoice==null?'Save':'Update'}
  </button>

  <button class="load" on:click={onLoadOld}
    disabled={!canLoadOld}
    title="Reload positions from DB"
    style="height:30px; width:170px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#17a2b8;">
    Load Old Positions
  </button>

  <button class="new" on:click={onNew} disabled={loading||saving}
    style="height:30px; width:150px; border-radius:6px; color:gray; border:1px solid #6c757d; box-sizing:border-box; font-weight:bold; background-color:#e2df3e;">
    New
  </button>

  <button class="refresh" on:click={onRefresh} disabled={loading}
    style="height:30px; width:165px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#666;">
    Refresh Page
  </button>

  <button
    class="load"
    on:click={onToggleLetter}
    disabled={!canShowPrint}
    aria-pressed={showLetter}
    title="Letter after left_tbl"
    style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:{showLetter ? '#136b4a' : '#17a2b8'};">
    Show Letter
  </button>

  <button class="load" disabled={!canShowPrint} title="Invoice after left_tbl" on:click={onPrint}
    style="height:30px; width:165px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#17a2b8;">
    Print Invoice
  </button>

  <button class="delete" on:click={onDelete}
    disabled={!hasSel || isBlocked}
    title={isBlocked ? 'Locked invoices cannot be deleted' : 'Delete selected invoice'}
    style="height:30px; width:150px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#d9534f; opacity:{(!hasSel || isBlocked)?0.5:1}; cursor:{(!hasSel || isBlocked)?'not-allowed':'pointer'};">
    Delete
  </button>

  <button class="send" on:click={onSend}
    disabled={!canSendCommitBtn}
    title="Send invoice by email and lock records"
    style="height:30px; width:170px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#0d6efd; opacity:{canSendCommitBtn?1:0.5}; cursor:{canSendCommitBtn?'pointer':'not-allowed'};">
    Send &amp; Commit
  </button>

  <button class="handover" on:click={onHandover}
    disabled={!canHandover}
    title={booked ? 'Invoice already booked' : (isBlocked ? 'Handover to Booking' : 'Invoice must be blocked first')}
    style="height:30px; width:200px; border-radius:6px; color:white; border:1px solid #6c757d; box-sizing:border-box; background-color:#fd7e14; opacity:{canHandover?1:0.5}; cursor:{canHandover?'pointer':'not-allowed'};">
    Handover to Booking
  </button>
</div>
