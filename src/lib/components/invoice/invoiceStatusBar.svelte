<!-- File: src/lib/components/invoice/invoiceStatusBar.svelte -->
<script>
  // Props
  export let statusMsg = '';
  export let title = 'Invoice#';
</script>

<div style="display:flex; justify-content:space-between; align-items:flex-start; margin:0 0 8px 0; width:100%;">
  <h1 style="margin:0 0 0 10px; font-size:22px; font-weight:bold; flex:1;">{title}</h1>
  {#if statusMsg}
    <div style="padding:4px 10px; border:3px solid #c7d2fe; border-radius:4px; background-color:#eef2ff; color:#3730a3; font-size:10px; white-space:nowrap; margin-left:auto;">
      {statusMsg}
    </div>
  {/if}
</div>
