<script lang="ts">
  // Placeholder for SplitDebitorDialog
  export let visible = false;
  export let booking: any = null;

  function close() {
    visible = false;
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={close} on:keydown={(e) => e.key === 'Escape' && close()} role="button" tabindex="-1">
    <div class="dialog" on:click|stopPropagation role="dialog">
      <h2>Split Debitor</h2>
      <p>Split debitor dialog - To be implemented</p>
      <button on:click={close}>Close</button>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    min-width: 400px;
  }
</style>
