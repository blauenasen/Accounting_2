// src/lib/stores/matchingStore.ts
// Open items matching state management (Feature D & E: Auszifferung)

import { writable, derived, type Writable } from 'svelte/store';
import type { OpenItem, MatchingResult, MatchingOptions } from '../types/booking.js';
import { validateMatching } from '../logic/matching.js';

/**
 * Matching store state
 */
export interface MatchingStoreState {
  isActive: boolean;
  selectedItems: OpenItem[];
  options: MatchingOptions;
  validationResult: MatchingResult | null;
  isDirty: boolean;
}

/**
 * Matching store interface
 */
export interface MatchingStore extends Writable<MatchingStoreState> {
  start: (items?: OpenItem[], options?: MatchingOptions) => void;
  addItem: (item: OpenItem) => void;
  removeItem: (idNr: number) => void;
  setItems: (items: OpenItem[]) => void;
  setOptions: (options: MatchingOptions) => void;
  validate: () => void;
  clear: () => void;
  cancel: () => void;
}

/**
 * Creates a matching store for open items reconciliation
 * @returns Matching store with helper methods
 */
function createMatchingStore(): MatchingStore {
  const defaultState: MatchingStoreState = {
    isActive: false,
    selectedItems: [],
    options: {
      tolerance: 0.01,
      ausziffArt: undefined,
      ausziffDatum: undefined
    },
    validationResult: null,
    isDirty: false
  };

  const { subscribe, set, update } = writable<MatchingStoreState>(defaultState);

  /**
   * Validates current items for matching
   */
  function performValidation(state: MatchingStoreState): MatchingStoreState {
    if (state.selectedItems.length < 2) {
      return {
        ...state,
        validationResult: null
      };
    }

    const result = validateMatching(
      state.selectedItems,
      state.options.tolerance
    );

    return {
      ...state,
      validationResult: result
    };
  }

  return {
    subscribe,
    set,
    update,

    /**
     * Start a new matching session
     * @param items Optional initial items
     * @param options Optional matching options
     */
    start: (items: OpenItem[] = [], options: MatchingOptions = {}) => {
      const newState: MatchingStoreState = {
        isActive: true,
        selectedItems: items,
        options: {
          tolerance: options.tolerance ?? 0.01,
          ausziffArt: options.ausziffArt,
          ausziffDatum: options.ausziffDatum
        },
        validationResult: null,
        isDirty: false
      };

      set(performValidation(newState));
    },

    /**
     * Add an item to the matching selection
     * @param item Open item to add
     */
    addItem: (item: OpenItem) => {
      update(state => {
        const exists = state.selectedItems.some(i => i.idNr === item.idNr);
        if (exists) {
          return state;
        }

        const newState = {
          ...state,
          selectedItems: [...state.selectedItems, item],
          isDirty: true
        };

        return performValidation(newState);
      });
    },

    /**
     * Remove an item from the matching selection
     * @param idNr ID of item to remove
     */
    removeItem: (idNr: number) => {
      update(state => {
        const newState = {
          ...state,
          selectedItems: state.selectedItems.filter(i => i.idNr !== idNr),
          isDirty: true
        };

        return performValidation(newState);
      });
    },

    /**
     * Set all items at once
     * @param items Array of open items
     */
    setItems: (items: OpenItem[]) => {
      update(state => {
        const newState = {
          ...state,
          selectedItems: items,
          isDirty: true
        };

        return performValidation(newState);
      });
    },

    /**
     * Set matching options
     * @param options Matching options
     */
    setOptions: (options: MatchingOptions) => {
      update(state => {
        const newState = {
          ...state,
          options: {
            tolerance: options.tolerance ?? state.options.tolerance,
            ausziffArt: options.ausziffArt ?? state.options.ausziffArt,
            ausziffDatum: options.ausziffDatum ?? state.options.ausziffDatum
          },
          isDirty: true
        };

        return performValidation(newState);
      });
    },

    /**
     * Trigger validation
     */
    validate: () => {
      update(state => performValidation(state));
    },

    /**
     * Clear all items but keep matching active
     */
    clear: () => {
      update(state => ({
        ...state,
        selectedItems: [],
        validationResult: null,
        isDirty: false
      }));
    },

    /**
     * Cancel matching and reset to default state
     */
    cancel: () => {
      set(defaultState);
    }
  };
}

/**
 * Global matching store instance
 */
export const matchingStore = createMatchingStore();

/**
 * Derived store for matching validity
 */
export const isMatchingValid = derived(
  matchingStore,
  $matching => $matching.validationResult?.valid ?? false
);

/**
 * Derived store for matching errors
 */
export const matchingErrors = derived(
  matchingStore,
  $matching => $matching.validationResult?.errors ?? []
);

/**
 * Derived store for selected item count
 */
export const matchingItemCount = derived(
  matchingStore,
  $matching => $matching.selectedItems.length
);

/**
 * Derived store for total Soll amount
 */
export const matchingTotalSoll = derived(
  matchingStore,
  $matching => $matching.selectedItems
    .filter(item => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)
);

/**
 * Derived store for total Haben amount
 */
export const matchingTotalHaben = derived(
  matchingStore,
  $matching => $matching.selectedItems
    .filter(item => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0)
);

/**
 * Derived store for balance difference
 */
export const matchingDifference = derived(
  [matchingTotalSoll, matchingTotalHaben],
  ([$soll, $haben]) => Math.abs($soll - $haben)
);
