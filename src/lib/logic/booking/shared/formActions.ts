// src/lib/logic/booking/shared/formActions.ts
// Shared form action handlers (Save, Cancel, Add PDF)

import { get } from 'svelte/store';
import { bookingStore } from '$lib/stores/bookingStore';

/**
 * Context interface for form action handlers
 */
export interface FormActionsContext {
  // State getters/setters
  getSelectedEntry: () => any;
  setSelectedEntry: (entry: any) => void;

  // Data loading functions
  reloadCurrentView: () => Promise<void>;
}

/**
 * Handle save booking (create or update)
 * Used by BookingEntryForm (all views)
 *
 * @param event CustomEvent with form data
 * @param context Context object with state and functions
 */
export async function handleSave(event: CustomEvent, context: FormActionsContext) {
  // event.detail contains fields directly, NOT in formData
  const formData = event.detail;

  console.log('[formActions] handleSave called', { formData });

  try {
    // Get BookCircle from store (format: "10 - Description" or "")
    const bookCircleStr = get(bookingStore).selectedBookCircle;
    const bookCircle = bookCircleStr ? bookCircleStr.split(' - ')[0] : null;
    console.log('[formActions] Using bookCircle from store:', bookCircle);

    if (!bookCircle || !bookCircleStr) {
      const errorMsg = 'Bitte wählen Sie einen Buchungskreis aus';
      console.error('[formActions]', errorMsg);
      alert(errorMsg); // TODO: Replace with toast notification
      return;
    }

    // Fetch account details (needed for JA fields in transformation)
    const [accountDetails, contraAccountDetails] = await Promise.all([
      fetch(`/api/booking/account-details?account=${formData.account}`).then((r) => r.json()),
      fetch(`/api/booking/account-details?account=${formData.contraAccount}`).then((r) =>
        r.json()
      )
    ]);

    const selectedEntry = context.getSelectedEntry();

    // Send structured payload to API
    const payload = {
      formData,
      bookCircle,
      accountDetails,
      contraAccountDetails,
      idNr: selectedEntry?.IdNr // For updates
    };

    console.log('[formActions] Sending payload to API', { payload });

    const response = await fetch('/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.ok) {
      console.log('[formActions] Booking saved successfully:', result);

      // Refresh current view's table
      await context.reloadCurrentView();

      // Clear form
      context.setSelectedEntry(null);
    } else {
      console.error('[formActions] Save failed:', result.error);
      alert(`Save failed: ${result.error}`); // TODO: Show error to user via toast
    }
  } catch (error) {
    console.error('[formActions] API call failed:', error);
    alert('API call failed. See console for details.'); // TODO: Show error to user via toast
  }
}

/**
 * Handle cancel (clear form)
 * Used by BookingEntryForm (all views)
 *
 * @param context Context object with state and functions
 */
export function handleCancel(context: FormActionsContext) {
  console.log('[formActions] handleCancel called');
  context.setSelectedEntry(null);
}

/**
 * Handle add PDF to booking entry
 * Used by BookingEntryForm (all views)
 * TODO: Implement PDF upload functionality
 *
 * @param context Context object (currently unused)
 */
export function handleAddPDF(context: FormActionsContext) {
  console.log('[formActions] Add PDF to booking entry');
  // TODO: Implement PDF upload functionality
}
