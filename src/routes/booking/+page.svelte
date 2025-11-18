<!-- File: src/routes/booking/+page.svelte -->
<script lang="ts">
  /**
   * Booking page - Main booking interface
   * Uses refactored components from Phase 6 & 7
   */
  import BookingFormContainer from '$lib/components/booking/form/BookingFormContainer.svelte';
  import PrimanotaTableContainer from '$lib/components/primanota/PrimanotaTableContainer.svelte';

  // Import page-specific styles
  import '$lib/styles/pages/booking.css';

  // SvelteKit page props
  export let params: Record<string, string> = {};
</script>

<div class="booking-page">
  <BookingFormContainer />
  <PrimanotaTableContainer />
</div>

<style>
  .booking-page {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
