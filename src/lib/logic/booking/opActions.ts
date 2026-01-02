// src/lib/logic/booking/opActions.ts
// OP-Ansicht-specific action handlers

// Re-export shared handlers (used by OP-Ansicht)
export { handleRowSelect, setBookCircleFromEntry } from './shared/rowSelection';
export { handleSave, handleCancel, handleAddPDF } from './shared/formActions';

/**
 * Context interface for OP-Ansicht-specific handlers
 * Extends shared context interfaces
 */
export type { RowSelectionContext } from './shared/rowSelection';
export type { FormActionsContext } from './shared/formActions';

// ============================================================================
// PLACEHOLDER: Future OP-Ansicht-specific handlers
// ============================================================================
// When OP-Ansicht gets filters (similar to Primanota), add handlers here:
//
// export async function handleOpFilterChange(event: CustomEvent, context: OpContext) {
//   // Handle OP filter changes (open/balanced/all)
// }
//
// export async function handleReconcile(selectedEntries: any[], context: OpContext) {
//   // Handle reconciliation of open items
// }
