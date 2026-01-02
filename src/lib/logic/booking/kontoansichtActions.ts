// src/lib/logic/booking/kontoansichtActions.ts
// Kontoansicht-specific action handlers

// Re-export shared handlers (used by Kontoansicht)
export { handleRowSelect, setBookCircleFromEntry } from './shared/rowSelection';
export { handleSave, handleCancel, handleAddPDF } from './shared/formActions';

/**
 * Context interface for Kontoansicht-specific handlers
 * Extends shared context interfaces
 */
export type { RowSelectionContext } from './shared/rowSelection';
export type { FormActionsContext } from './shared/formActions';

// ============================================================================
// PLACEHOLDER: Future Kontoansicht-specific handlers
// ============================================================================
// When Kontoansicht gets filters (similar to Primanota), add handlers here:
//
// export async function handleFilterChange(event: CustomEvent, context: KontoansichtContext) {
//   // Handle filter changes specific to Kontoansicht
// }
//
// export async function handleAccountNavigation(direction: 'first' | 'prev' | 'next' | 'last', context: KontoansichtContext) {
//   // Handle account navigation
// }
