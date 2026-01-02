// src/lib/logic/booking/primanotaActions.ts
// Primanota-specific action handlers (Context Menu actions)

import { tick } from 'svelte';
import type { RowSelectionContext } from './shared/rowSelection';
import type { FormActionsContext } from './shared/formActions';

// Re-export shared handlers (used by Primanota)
export { handleRowSelect, setBookCircleFromEntry } from './shared/rowSelection';
export { handleSave, handleCancel, handleAddPDF } from './shared/formActions';

/**
 * Extended context for Primanota-specific handlers
 */
export interface PrimanotaActionsContext extends RowSelectionContext, FormActionsContext {
  // Additional Primanota-specific functions if needed
}

/**
 * Handle "Fill Form" context menu action
 * Loads booking entry data into the form (Primanota only)
 *
 * @param event CustomEvent with originalRow data
 * @param context Context object with state and functions
 */
export async function handleFillForm(event: CustomEvent, context: PrimanotaActionsContext) {
  const { originalRow } = event.detail;

  console.log('[primanotaActions] handleFillForm called', { originalRow });

  if (!originalRow || !originalRow.IdNr) {
    console.error('[primanotaActions] No originalRow or IdNr provided for fillform');
    return;
  }

  // Indicate we're loading an entry (prevents clearFormFields)
  context.setIsLoadingEntry(true);

  // Auto-select Book Circle from entry
  if (originalRow.BookCircle) {
    const { setBookCircleFromEntry } = await import('./shared/rowSelection');
    await setBookCircleFromEntry(originalRow.BookCircle, context);
  }

  // Use data directly from originalRow (already in memory)
  context.setSelectedEntry(originalRow);

  console.log('[primanotaActions] Form filled with entry', { IdNr: originalRow.IdNr });

  // Reset flag after form has loaded
  await tick();
  context.setIsLoadingEntry(false);
}

/**
 * Handle "Delete Entry" context menu action
 * Deletes a booking entry from database (Primanota only)
 *
 * @param event CustomEvent with bookingData
 * @param context Context object with reload function
 */
export async function handleDeleteEntry(event: CustomEvent, context: PrimanotaActionsContext) {
  const { bookingData } = event.detail;

  console.log('[primanotaActions] handleDeleteEntry called', { bookingData });

  if (!bookingData || !bookingData.IdNr) {
    console.error('[primanotaActions] No IdNr found for deletion');
    return;
  }

  try {
    const response = await fetch(`/api/booking/delete?idNr=${bookingData.IdNr}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.ok) {
      console.log('[primanotaActions] Entry deleted successfully:', result.deletedIdNr);
      // Reload current view to reflect changes
      await context.reloadCurrentView();
    } else {
      console.error('[primanotaActions] Delete failed:', result.error);
      alert(`Failed to delete entry: ${result.error}`);
    }
  } catch (error) {
    console.error('[primanotaActions] Delete request failed:', error);
    alert('Failed to delete entry');
  }
}

/**
 * Handle "Cancel Entry" context menu action
 * Creates a reversal booking (STORNO) for the selected entry (Primanota only)
 *
 * @param event CustomEvent with bookingData
 * @param context Context object with reload function
 */
export async function handleCancelEntry(event: CustomEvent, context: PrimanotaActionsContext) {
  const { bookingData } = event.detail;

  console.log('[primanotaActions] handleCancelEntry called', { bookingData });

  if (!bookingData) {
    console.error('[primanotaActions] No booking data for cancellation');
    return;
  }

  try {
    const response = await fetch('/api/booking/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalBooking: bookingData })
    });

    const result = await response.json();

    if (result.ok) {
      console.log('[primanotaActions] Entry cancelled successfully. GU:', result.guNumber);
      // Reload current view to reflect changes
      await context.reloadCurrentView();
    } else {
      console.error('[primanotaActions] Cancel failed:', result.error);
      alert(`Failed to cancel entry: ${result.error}`);
    }
  } catch (error) {
    console.error('[primanotaActions] Cancel request failed:', error);
    alert('Failed to cancel entry');
  }
}

/**
 * Handle message event from Primanota table
 * Displays messages to user (Primanota only)
 *
 * @param event CustomEvent with message text
 */
export function handleMessage(event: CustomEvent) {
  const { text } = event.detail;
  console.log('[primanotaActions] Message:', text);
  // TODO: Show message to user (toast notification)
}
