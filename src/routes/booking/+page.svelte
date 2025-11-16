<!-- File: src/routes/booking/+page.svelte -->
<script lang="ts">
  /**
   * Booking page - Main booking interface
   * Uses refactored components from Phase 6 & 7
   */
  import BookingFormContainer from '$lib/components/booking/form/BookingFormContainer.svelte';
  import PrimanotaContainer from '$lib/components/booking/primanota/PrimanotaContainer.svelte';
</script>

<div class="booking-page">
  <BookingFormContainer />
  <PrimanotaContainer />
</div>

<style>
  .booking-page {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
