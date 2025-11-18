<script lang="ts">
  // Placeholder for CancelBookingDialog
  export let visible = false;
  export let booking: any = null;

  function handleCancel() {
    visible = false;
  }

  function handleConfirm() {
    // Cancel booking logic would go here
    visible = false;
  }
</script>

{#if visible}
  <div class="dialog-overlay" on:click={handleCancel} on:keydown={(e) => e.key === 'Escape' && handleCancel()} role="button" tabindex="-1">
    <div class="dialog" on:click|stopPropagation role="dialog">
      <h2>Cancel Booking</h2>
      <p>Booking cancellation - To be implemented</p>
      {#if booking}
        <p>IdNr: {booking.IdNr}</p>
      {/if}
      <div class="buttons">
        <button on:click={handleCancel}>Cancel</button>
        <button on:click={handleConfirm}>Confirm</button>
      </div>
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

  .buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
