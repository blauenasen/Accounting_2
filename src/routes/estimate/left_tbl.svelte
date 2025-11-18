<script lang="ts">
  // Placeholder for LeftTbl component
  export let data: any[] = [];
  export let items: any[] = [];
  export let selectedIndex: number = -1;
</script>

<div class="left-tbl-placeholder">
  <p>Left Table - To be implemented</p>
  {#if data.length > 0}
    <p>Items: {data.length}</p>
  {/if}
</div>

<style>
  .left-tbl-placeholder {
    padding: 1rem;
    border: 1px dashed #ccc;
    background: #f9f9f9;
    color: #666;
  }
</style>
