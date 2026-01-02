// src/lib/logic/booking/shared/rowSelection.ts
// Shared row selection and Book Circle synchronization logic

import { tick } from 'svelte';
import { get } from 'svelte/store';
import { bookingStore } from '$lib/stores/bookingStore';
import { viewModeStore } from '$lib/stores/viewModeStore';

/**
 * Context interface for row selection handlers
 */
export interface RowSelectionContext {
  // State getters/setters
  getIsLoadingEntry: () => boolean;
  setIsLoadingEntry: (value: boolean) => void;
  getSelectedEntry: () => any;
  setSelectedEntry: (entry: any) => void;
  getSelectedBookCircle: () => { idcode: string; no: number; textcode: string } | null;
  setSelectedBookCircle: (circle: { idcode: string; no: number; textcode: string } | null) => void;

  // Data loading functions
  loadPrimanotaEntries: () => Promise<void>;
  loadKontoansichtEntries: () => Promise<void>;
  loadOpEntries: () => Promise<void>;
}

/**
 * Handle row selection (double-click on table row)
 * Used by all views: Primanota, Kontoansicht, OP-Ansicht
 *
 * @param event CustomEvent with entry data
 * @param context Context object with state and functions
 */
export async function handleRowSelect(event: CustomEvent, context: RowSelectionContext) {
  const { entry } = event.detail;

  console.log('[rowSelection] handleRowSelect called', {
    entry,
    viewMode: get(viewModeStore).mode,
    currentView: get(bookingStore).currentView
  });

  if (!entry || !entry.IdNr) {
    console.warn('[rowSelection] Invalid entry - missing IdNr');
    return;
  }

  // Indicate we're loading an entry (prevents clearFormFields)
  context.setIsLoadingEntry(true);

  // Auto-select Book Circle from entry FIRST (before setting selectedEntry)
  // This prevents race condition where fields are cleared after being filled
  if (entry.BookCircle) {
    await setBookCircleFromEntry(entry.BookCircle, context);
  }

  // Set selectedEntry AFTER Book Circle (so form fills correctly)
  context.setSelectedEntry(entry);

  console.log('[rowSelection] Entry loaded into form', { IdNr: entry.IdNr });

  // Reset flag after form has loaded
  await tick();
  context.setIsLoadingEntry(false);
}

/**
 * Set Book Circle from booking entry (auto-select)
 * FIX: Only reload view if Book Circle actually changes (prevents double-click issue)
 *
 * @param bookCircleNo Book Circle number from entry
 * @param context Context object with state and functions
 */
export async function setBookCircleFromEntry(
  bookCircleNo: number,
  context: RowSelectionContext
) {
  if (!bookCircleNo) return;

  console.log('[rowSelection] Auto-selecting Book Circle:', bookCircleNo);

  // Check if Book Circle is already selected (DOUBLE-CLICK FIX!)
  const currentBookCircle = context.getSelectedBookCircle();
  const isAlreadySelected = currentBookCircle?.no === bookCircleNo;

  if (isAlreadySelected) {
    console.log('[rowSelection] Book Circle already selected - skipping reload');
    return; // Don't reload if already selected
  }

  // Fetch the actual book circle from database to get correct textcode
  try {
    const response = await fetch('/api/booking/bookcircle');
    const bookCircles = await response.json();

    const bookCircle = bookCircles.find((bc: any) => bc.no === bookCircleNo);

    if (bookCircle) {
      context.setSelectedBookCircle({
        idcode: bookCircle.idcode?.toString() || bookCircleNo.toString(),
        no: bookCircle.no,
        textcode: bookCircle.textcode // Real designation from DB
      });
      bookingStore.setBookCircle(`${bookCircle.no} - ${bookCircle.textcode}`);
    } else {
      // Fallback if not found
      context.setSelectedBookCircle({
        idcode: bookCircleNo.toString(),
        no: bookCircleNo,
        textcode: `Circle ${bookCircleNo}`
      });
      bookingStore.setBookCircle(`${bookCircleNo} - Circle ${bookCircleNo}`);
    }
  } catch (error) {
    console.error('[rowSelection] Failed to fetch book circle:', error);
    // Fallback on error
    context.setSelectedBookCircle({
      idcode: bookCircleNo.toString(),
      no: bookCircleNo,
      textcode: `Circle ${bookCircleNo}`
    });
    bookingStore.setBookCircle(`${bookCircleNo} - Circle ${bookCircleNo}`);
  }

  // Reload current view with new book circle filter
  // ONLY if Book Circle actually changed (prevents empty form on first double-click)
  const currentView = get(bookingStore).currentView;
  console.log('[rowSelection] Reloading view after Book Circle change:', currentView);

  if (currentView === 'primanota') {
    await context.loadPrimanotaEntries();
  } else if (currentView === 'kontoansicht') {
    await context.loadKontoansichtEntries();
  } else if (currentView === 'op') {
    await context.loadOpEntries();
  }
}
