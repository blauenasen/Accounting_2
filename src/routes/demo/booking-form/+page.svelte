<!-- src/routes/demo/booking-form/+page.svelte -->
<script lang="ts">
  // Demo page for BookingForm components
  import BookingFormContainer from '$lib/components/booking/form/BookingFormContainer.svelte';

  // Demo state
  let selectedBookCircle = { no: 10, textcode: 'Purchases' };
  let currentMonth = '11';
  let currentYear = '2025';

  let formRef: BookingFormContainer;

  /**
   * Handle booking submit event
   */
  function handleBookingSubmit(event: CustomEvent): void {
    console.log('Booking submitted:', event.detail);
  }

  /**
   * Demo: Fill form with sample data
   */
  function fillSampleData(): void {
    if (formRef) {
      formRef.fillForm({
        turnover: '100.00',
        sh: 'S',
        contra: '10000',
        reference: 'DEMO-001',
        date: '2025-11-16',
        account: '8400',
        tax: '19',
        desc: 'Sample booking entry',
        bookCircle: '10',
        gu: '',
        due: '2025-11-23',
        disc: '0.00 %',
        idNr: null,
        jahr: null,
        monat: null,
        tag: null,
        lfdNr: null,
        id_invoice: null,
        nettoGes: null,
        steuer: null,
        vStUSt: null,
        bu: null
      });
    }
  }

  /**
   * Demo: Reset form
   */
  function resetForm(): void {
    if (formRef) {
      formRef.resetForm();
    }
  }
</script>

<svelte:window on:booking:submit={handleBookingSubmit} />

<div class="demo-page">
  <header class="demo-header">
    <h1>Booking Form Demo</h1>
    <p>Test page for refactored booking form components (Phase 6)</p>
  </header>

  <div class="demo-controls">
    <div class="control-group">
      <label>
        Book Circle:
        <select bind:value={selectedBookCircle.no}>
          <option value={10}>10 - Purchases</option>
          <option value={20}>20 - Revenue</option>
        </select>
      </label>

      <label>
        Month:
        <select bind:value={currentMonth}>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </label>

      <label>
        Year:
        <input type="number" bind:value={currentYear} min="2020" max="2030" />
      </label>
    </div>

    <div class="action-buttons">
      <button on:click={fillSampleData}>Fill Sample Data</button>
      <button on:click={resetForm}>Reset Form</button>
    </div>
  </div>

  <div class="demo-form">
    <BookingFormContainer
      bind:this={formRef}
      {selectedBookCircle}
      {currentMonth}
      {currentYear}
    />
  </div>

  <div class="demo-info">
    <h3>Component Status</h3>
    <ul>
      <li>✓ BookingFormContainer - Main orchestrator</li>
      <li>✓ BookingFormFields - Input fields with validation</li>
      <li>✓ BookingFormValidation - Validation logic</li>
      <li>✓ BookingFormDialogs - Dialog manager</li>
      <li>✓ 7 Dialog components (Account Selection, Duplicate Warning, etc.)</li>
    </ul>

    <h3>Features Implemented</h3>
    <ul>
      <li>✓ Form validation with comprehensive error messages</li>
      <li>✓ Tax calculations using Decimal.js for cent precision</li>
      <li>✓ Keyboard navigation (Enter to move between fields)</li>
      <li>✓ Auto-calculation of Due Date (+7 days)</li>
      <li>✓ Keep field toggles (preserve values on reset)</li>
      <li>✓ SH toggle (S/H based on turnover sign)</li>
      <li>✓ Toast notifications for success/error</li>
    </ul>

    <h3>Pending Features (Future Implementation)</h3>
    <ul>
      <li>⏳ Account loading and selection dialog integration</li>
      <li>⏳ Tax group loading from database</li>
      <li>⏳ PDF upload/download functionality</li>
      <li>⏳ Duplicate booking detection</li>
      <li>⏳ Year/Month mismatch validation</li>
      <li>⏳ API integration for saving bookings</li>
    </ul>
  </div>
</div>

<style>
  .demo-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .demo-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .demo-header h1 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .demo-header p {
    margin: 0;
    color: #6b7280;
  }

  .demo-controls {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .control-group {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .control-group label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  .control-group select,
  .control-group input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .action-buttons button {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .action-buttons button:hover {
    background: #2563eb;
  }

  .demo-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .demo-info {
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .demo-info h3 {
    margin: 0 0 1rem 0;
    color: #065f46;
  }

  .demo-info ul {
    margin: 0 0 1.5rem 0;
    padding-left: 1.5rem;
  }

  .demo-info ul:last-child {
    margin-bottom: 0;
  }

  .demo-info li {
    margin-bottom: 0.5rem;
    color: #047857;
  }
</style>
