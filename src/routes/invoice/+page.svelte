<!-- File: src/routes/invoice/+page.svelte -->
<script lang="ts">
  /**
   * Invoice page - Main invoice interface
   * Uses refactored InvoiceContainer from Phase 8
   */
  import InvoiceContainer from '$lib/components/invoice/InvoiceContainer.svelte';

  // SvelteKit page props
  export let params: Record<string, string> = {};
</script>

<div class="invoice-page">
  <InvoiceContainer />
</div>

<style>
  .invoice-page {
    width: 100%;
    min-height: 80vh;
    padding: 0;
    margin: 0;
  }
</style>
