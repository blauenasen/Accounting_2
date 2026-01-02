<!-- OPTableBody.svelte -->
<!-- tbody component for OP table -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import OPTableRow from './OPTableRow.svelte';

  // Define entry interface
  interface OPEntry {
    IdNr?: number;
    [key: string]: any;
  }

  const dispatch = createEventDispatcher();

  // Props
  export let entries: OPEntry[] = [];

  // Forward row events
  function forwardRowDblClick(event: CustomEvent) {
    dispatch('row-dblclick', event.detail);
  }

  function forwardRowClick(event: CustomEvent) {
    dispatch('row-click', event.detail);
  }

  function forwardRowContextMenu(event: CustomEvent) {
    dispatch('row-contextmenu', event.detail);
  }
</script>

<tbody>
  {#if entries.length === 0}
    <tr>
      <td colspan="14" class="no-data">No open items found</td>
    </tr>
  {:else}
    {#each entries as entry, index (entry.IdNr || entry.id || index)}
      <OPTableRow
        {entry}
        {index}
        on:row-dblclick={forwardRowDblClick}
        on:row-click={forwardRowClick}
        on:row-contextmenu={forwardRowContextMenu}
      />
    {/each}
  {/if}
</tbody>

<style>
  .no-data {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: rgb(85, 85, 85);
  }
</style>
