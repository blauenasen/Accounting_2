// src/lib/stores/selectionStore.ts
// Multi-selection store with Shift/Ctrl support (Feature A: Mehrfachmarkierung)

import { writable, derived, type Writable } from 'svelte/store';
import type { SelectionState } from '../types/ui.js';

/**
 * Internal selection state
 */
interface InternalSelectionState {
  selectedIds: Set<number>;
  lastSelectedIndex: number;
  anchorIndex: number;
}

/**
 * Selection store interface
 */
export interface SelectionStore extends Writable<InternalSelectionState> {
  toggle: (rowIndex: number, rowId: number) => void;
  selectSingle: (rowIndex: number, rowId: number) => void;
  selectRange: (fromIndex: number, toIndex: number, displayRows: DisplayRow[]) => void;
  addToSelection: (rowIndex: number, rowId: number) => void;
  selectAll: (displayRows: DisplayRow[]) => void;
  clear: () => void;
  keepLastSelected: (displayRows: DisplayRow[]) => void;
  isSelected: (rowId: number, state: InternalSelectionState) => boolean;
}

/**
 * Minimal row interface for selection
 */
interface DisplayRow {
  IdNr?: number;
  idNr?: number;
  idnr?: number;
}

/**
 * Creates a selection store for multi-select with keyboard support
 * @returns Selection store with helper methods
 */
function createSelectionStore(): SelectionStore {
  const { subscribe, set, update } = writable<InternalSelectionState>({
    selectedIds: new Set(),
    lastSelectedIndex: -1,
    anchorIndex: -1
  });

  /**
   * Extracts row ID from display row (handles various casings)
   */
  function getRowId(row: DisplayRow): number | null {
    return row.IdNr ?? row.idNr ?? row.idnr ?? null;
  }

  return {
    subscribe,
    set,
    update,

    /**
     * Toggle selection of a single row
     * @param rowIndex Index of the row
     * @param rowId Unique ID of the row (IdNr)
     */
    toggle: (rowIndex: number, rowId: number) => {
      update(state => {
        const newSelectedIds = new Set(state.selectedIds);

        if (newSelectedIds.has(rowId)) {
          newSelectedIds.delete(rowId);
        } else {
          newSelectedIds.add(rowId);
        }

        return {
          selectedIds: newSelectedIds,
          lastSelectedIndex: rowIndex,
          anchorIndex: rowIndex
        };
      });
    },

    /**
     * Select a single row (deselect all others)
     * @param rowIndex Index of the row
     * @param rowId Unique ID of the row
     */
    selectSingle: (rowIndex: number, rowId: number) => {
      update(() => ({
        selectedIds: new Set([rowId]),
        lastSelectedIndex: rowIndex,
        anchorIndex: rowIndex
      }));
    },

    /**
     * Select a range of rows (Shift + Click)
     * @param fromIndex Start index
     * @param toIndex End index
     * @param displayRows Array of visible rows
     */
    selectRange: (fromIndex: number, toIndex: number, displayRows: DisplayRow[]) => {
      update(state => {
        const newSelectedIds = new Set(state.selectedIds);
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);

        for (let i = start; i <= end; i++) {
          if (displayRows[i]) {
            const rowId = getRowId(displayRows[i]);
            if (rowId !== null) {
              newSelectedIds.add(rowId);
            }
          }
        }

        return {
          selectedIds: newSelectedIds,
          lastSelectedIndex: toIndex,
          anchorIndex: fromIndex
        };
      });
    },

    /**
     * Add to selection (Ctrl + Click)
     * @param rowIndex Index of the row
     * @param rowId Unique ID of the row
     */
    addToSelection: (rowIndex: number, rowId: number) => {
      update(state => {
        const newSelectedIds = new Set(state.selectedIds);
        newSelectedIds.add(rowId);

        return {
          selectedIds: newSelectedIds,
          lastSelectedIndex: rowIndex,
          anchorIndex: state.anchorIndex >= 0 ? state.anchorIndex : rowIndex
        };
      });
    },

    /**
     * Select all visible rows
     * @param displayRows Array of visible rows
     */
    selectAll: (displayRows: DisplayRow[]) => {
      update(() => {
        const newSelectedIds = new Set<number>();

        displayRows.forEach(row => {
          const rowId = getRowId(row);
          if (rowId !== null) {
            newSelectedIds.add(rowId);
          }
        });

        return {
          selectedIds: newSelectedIds,
          lastSelectedIndex: displayRows.length - 1,
          anchorIndex: 0
        };
      });
    },

    /**
     * Clear all selections
     */
    clear: () => {
      set({
        selectedIds: new Set(),
        lastSelectedIndex: -1,
        anchorIndex: -1
      });
    },

    /**
     * Keep only the last selected row (for ESC key behavior)
     * @param displayRows Array of visible rows
     */
    keepLastSelected: (displayRows: DisplayRow[]) => {
      update(state => {
        if (state.lastSelectedIndex < 0) {
          return {
            selectedIds: new Set(),
            lastSelectedIndex: -1,
            anchorIndex: -1
          };
        }

        const lastRow = displayRows[state.lastSelectedIndex];
        if (!lastRow) {
          return {
            selectedIds: new Set(),
            lastSelectedIndex: -1,
            anchorIndex: -1
          };
        }

        const lastRowId = getRowId(lastRow);
        if (lastRowId === null) {
          return {
            selectedIds: new Set(),
            lastSelectedIndex: -1,
            anchorIndex: -1
          };
        }

        return {
          selectedIds: new Set([lastRowId]),
          lastSelectedIndex: state.lastSelectedIndex,
          anchorIndex: state.lastSelectedIndex
        };
      });
    },

    /**
     * Check if a row is selected
     * @param rowId Unique ID of the row
     * @param state Current state
     * @returns true if selected
     */
    isSelected: (rowId: number, state: InternalSelectionState): boolean => {
      return state.selectedIds.has(rowId);
    }
  };
}

/**
 * Global selection store instance
 */
export const selectionStore = createSelectionStore();

/**
 * Derived store for selection count
 */
export const selectionCount = derived(
  selectionStore,
  $selection => $selection.selectedIds.size
);

/**
 * Derived store for selected IDs as array
 */
export const selectedIds = derived(
  selectionStore,
  $selection => Array.from($selection.selectedIds)
);

/**
 * Derived store for has selection
 */
export const hasSelection = derived(
  selectionStore,
  $selection => $selection.selectedIds.size > 0
);
