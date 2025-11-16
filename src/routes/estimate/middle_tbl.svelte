<script lang="ts">
  // Placeholder for MiddleTbl component
  export let data: any[] = [];
</script>

<div class="middle-tbl-placeholder">
  <p>Middle Table - To be implemented</p>
  {#if data.length > 0}
    <p>Items: {data.length}</p>
  {/if}
</div>

<style>
  .middle-tbl-placeholder {
    padding: 1rem;
    border: 1px dashed #ccc;
    background: #f9f9f9;
    color: #666;
  }
</style>
