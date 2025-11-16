<!-- src/routes/demo/invoice/+page.svelte -->
<script lang="ts">
  // Demo page for Invoice components
  import InvoiceContainer from '$lib/components/invoice/InvoiceContainer.svelte';
  import type { InvoiceViewMode } from '$lib/types/ui.js';

  // Demo state
  let viewMode: InvoiceViewMode = 'form';
  let containerRef: InvoiceContainer;

  /**
   * Handle view mode change
   */
  function handleViewChange(event: CustomEvent): void {
    const { mode } = event.detail;
    viewMode = mode;
  }

  /**
   * Switch to list view
   */
  function switchToList(): void {
    if (containerRef) {
      containerRef.switchView('list');
    }
  }

  /**
   * Switch to form view
   */
  function switchToForm(): void {
    if (containerRef) {
      containerRef.switchView('form');
    }
  }
</script>

<div class="demo-page">
  <header class="demo-header">
    <h1>Invoice Module Demo</h1>
    <p>Test page for refactored invoice components (Phase 8)</p>
  </header>

  <div class="demo-controls">
    <div class="control-group">
      <label>
        View Mode:
        <div class="button-group">
          <button
            type="button"
            class:active={viewMode === 'list'}
            on:click={switchToList}
          >
            List View
          </button>
          <button
            type="button"
            class:active={viewMode === 'form'}
            on:click={switchToForm}
          >
            Form View
          </button>
        </div>
      </label>
    </div>
  </div>

  <div class="demo-invoice">
    <InvoiceContainer
      bind:this={containerRef}
      bind:viewMode
      on:view-change={handleViewChange}
    />
  </div>

  <div class="demo-info">
    <h3>Component Status (Phase 8 Tag 14)</h3>
    <ul>
      <li>✓ InvoiceContainer - Main orchestrator (~250 lines)</li>
      <li>✓ InvoiceState - State management logic (~250 lines)</li>
      <li>✓ InvoiceForm - Form component (~150 lines)</li>
      <li>✓ InvoiceDialogs - Dialog manager (~50 lines)</li>
      <li>✓ 6 Sub-components migrated (ActionBar, HeaderFields, etc.)</li>
    </ul>

    <h3>Invoice Logic Modules</h3>
    <ul>
      <li>✓ invoiceCalculations.ts - Decimal.js precision (~150 lines)</li>
      <li>✓ invoiceValidation.ts - Validation logic (~200 lines)</li>
      <li>✓ invoiceFormatting.ts - Formatting utilities (~200 lines)</li>
    </ul>

    <h3>Features Implemented</h3>
    <ul>
      <li>✓ Invoice header management (year, num, date, account)</li>
      <li>✓ Debtor selection and auto-fill</li>
      <li>✓ Precise calculations using Decimal.js</li>
      <li>✓ Validation for new and existing invoices</li>
      <li>✓ Action bar (Save, Update, Delete, Print, Send, Handover)</li>
      <li>✓ Status bar for messages</li>
      <li>✓ Totals box with GST calculations</li>
      <li>✓ Estimate number tracking</li>
      <li>✓ Send modal dialog</li>
    </ul>

    <h3>Refactoring Results</h3>
    <ul>
      <li>✓ Original: 817 lines (monolithic invoice/+page.svelte)</li>
      <li>✓ Refactored: Split into 4 main components + logic modules</li>
      <li>✓ All components &lt; 500 lines ✓</li>
      <li>✓ TypeScript ready</li>
      <li>✓ Clear separation of concerns</li>
      <li>✓ Reusable state management and logic</li>
      <li>✓ Modular and testable</li>
    </ul>

    <h3>Pending Features (Future Implementation)</h3>
    <ul>
      <li>⏳ InvoiceList component integration</li>
      <li>⏳ InvoicePositions component integration</li>
      <li>⏳ Letter preview functionality</li>
      <li>⏳ PDF generation integration</li>
      <li>⏳ Email sending backend integration</li>
      <li>⏳ Handover to accounting backend</li>
      <li>⏳ Full API integration</li>
      <li>⏳ Unit tests for logic modules</li>
    </ul>

    <h3>Next Steps</h3>
    <ul>
      <li>📋 Phase 8 Tag 15: PDF + Email modules (OHNE Debug!)</li>
      <li>📋 Phase 9: Routing & Pages migration</li>
      <li>📋 Phase 10+: Testing & Production-ready</li>
    </ul>
  </div>
</div>

<style>
  .demo-page {
    max-width: 1800px;
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
  }

  .control-group label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  .button-group button {
    padding: 0.5rem 1rem;
    background: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .button-group button:hover {
    background: #d1d5db;
  }

  .button-group button.active {
    background: #3b82f6;
    color: white;
  }

  .demo-invoice {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 2rem;
    min-height: 600px;
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
