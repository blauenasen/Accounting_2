// src/lib/stores/splitStore.ts
// Split transaction state management (Feature B & C: Split-Buchungen)

import { writable, derived, type Writable } from 'svelte/store';
import type { SplitPosition, SplitMode, SplitValidationResult } from '../types/booking.js';
import { validateSplitPositions } from '../logic/split.js';

/**
 * Split store state
 */
export interface SplitStoreState {
  isActive: boolean;
  mode: SplitMode;
  total: number;
  positions: SplitPosition[];
  validationResult: SplitValidationResult | null;
  isDirty: boolean;
}

/**
 * Split store interface
 */
export interface SplitStore extends Writable<SplitStoreState> {
  start: (total: number, mode?: SplitMode) => void;
  addPosition: (position: SplitPosition) => void;
  updatePosition: (index: number, position: SplitPosition) => void;
  removePosition: (index: number) => void;
  setMode: (mode: SplitMode) => void;
  setTotal: (total: number) => void;
  validate: () => void;
  clear: () => void;
  cancel: () => void;
}

/**
 * Creates a split transaction store
 * @returns Split store with helper methods
 */
function createSplitStore(): SplitStore {
  const defaultState: SplitStoreState = {
    isActive: false,
    mode: 'gross',
    total: 0,
    positions: [],
    validationResult: null,
    isDirty: false
  };

  const { subscribe, set, update } = writable<SplitStoreState>(defaultState);

  /**
   * Validates current positions against total
   */
  function performValidation(state: SplitStoreState): SplitStoreState {
    if (state.positions.length === 0) {
      return {
        ...state,
        validationResult: null
      };
    }

    const result = validateSplitPositions(
      state.positions,
      state.total,
      state.mode
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
     * Start a new split transaction
     * @param total Total amount to split
     * @param mode Calculation mode (default: 'gross')
     */
    start: (total: number, mode: SplitMode = 'gross') => {
      set({
        isActive: true,
        mode,
        total,
        positions: [],
        validationResult: null,
        isDirty: false
      });
    },

    /**
     * Add a new position to the split
     * @param position Split position to add
     */
    addPosition: (position: SplitPosition) => {
      update(state => {
        const newState = {
          ...state,
          positions: [...state.positions, position],
          isDirty: true
        };
        return performValidation(newState);
      });
    },

    /**
     * Update an existing position
     * @param index Index of position to update
     * @param position Updated position data
     */
    updatePosition: (index: number, position: SplitPosition) => {
      update(state => {
        if (index < 0 || index >= state.positions.length) {
          return state;
        }

        const newPositions = [...state.positions];
        newPositions[index] = position;

        const newState = {
          ...state,
          positions: newPositions,
          isDirty: true
        };

        return performValidation(newState);
      });
    },

    /**
     * Remove a position from the split
     * @param index Index of position to remove
     */
    removePosition: (index: number) => {
      update(state => {
        if (index < 0 || index >= state.positions.length) {
          return state;
        }

        const newPositions = state.positions.filter((_, i) => i !== index);

        const newState = {
          ...state,
          positions: newPositions,
          isDirty: true
        };

        return performValidation(newState);
      });
    },

    /**
     * Set the calculation mode
     * @param mode Calculation mode ('gross' or 'net')
     */
    setMode: (mode: SplitMode) => {
      update(state => {
        const newState = {
          ...state,
          mode,
          isDirty: true
        };
        return performValidation(newState);
      });
    },

    /**
     * Set the total amount
     * @param total Total amount to split
     */
    setTotal: (total: number) => {
      update(state => {
        const newState = {
          ...state,
          total,
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
     * Clear all positions but keep split active
     */
    clear: () => {
      update(state => ({
        ...state,
        positions: [],
        validationResult: null,
        isDirty: false
      }));
    },

    /**
     * Cancel split and reset to default state
     */
    cancel: () => {
      set(defaultState);
    }
  };
}

/**
 * Global split store instance
 */
export const splitStore = createSplitStore();

/**
 * Derived store for split validity
 */
export const isSplitValid = derived(
  splitStore,
  $split => $split.validationResult?.valid ?? false
);

/**
 * Derived store for split errors
 */
export const splitErrors = derived(
  splitStore,
  $split => $split.validationResult?.errors ?? []
);

/**
 * Derived store for remaining amount
 */
export const splitRemaining = derived(
  splitStore,
  $split => {
    if ($split.positions.length === 0) {
      return $split.total;
    }

    const sum = $split.positions.reduce((acc, pos) => acc + pos.amount, 0);
    return $split.total - sum;
  }
);

/**
 * Derived store for position count
 */
export const splitPositionCount = derived(
  splitStore,
  $split => $split.positions.length
);
