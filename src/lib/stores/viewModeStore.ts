// src/lib/stores/viewModeStore.ts
// View mode state management (primanota, account, op)

import { writable, type Writable } from 'svelte/store';
import type { ViewMode } from '../types/ui.js';

/**
 * View mode store state
 */
export interface ViewModeState {
  mode: ViewMode;
  selectedCircle: number;
  selectedAccount: number | null;
  hideStornos: boolean;
}

/**
 * View mode store interface
 */
export interface ViewModeStore extends Writable<ViewModeState> {
  setMode: (mode: ViewMode) => void;
  setCircle: (circle: number) => void;
  setAccount: (account: number | null) => void;
  toggleHideStornos: () => void;
  setHideStornos: (hide: boolean) => void;
  reset: () => void;
}

/**
 * Creates a view mode store
 * @returns View mode store with helper methods
 */
function createViewModeStore(): ViewModeStore {
  const defaultState: ViewModeState = {
    mode: 'primanota',
    selectedCircle: 0,
    selectedAccount: null,
    hideStornos: false
  };

  const { subscribe, set, update } = writable<ViewModeState>(defaultState);

  return {
    subscribe,
    set,
    update,

    /**
     * Set the view mode
     * @param mode View mode ('primanota' | 'account' | 'op')
     */
    setMode: (mode: ViewMode) => {
      update(state => ({
        ...state,
        mode
      }));
    },

    /**
     * Set the selected book circle
     * @param circle Book circle number
     */
    setCircle: (circle: number) => {
      update(state => ({
        ...state,
        selectedCircle: circle
      }));
    },

    /**
     * Set the selected account for account view
     * @param account Account number or null
     */
    setAccount: (account: number | null) => {
      update(state => ({
        ...state,
        selectedAccount: account,
        mode: account !== null ? 'account' : 'primanota'
      }));
    },

    /**
     * Toggle hide stornos (cancelled bookings)
     */
    toggleHideStornos: () => {
      update(state => ({
        ...state,
        hideStornos: !state.hideStornos
      }));
    },

    /**
     * Set hide stornos value
     * @param hide Whether to hide stornos
     */
    setHideStornos: (hide: boolean) => {
      update(state => ({
        ...state,
        hideStornos: hide
      }));
    },

    /**
     * Reset to default state
     */
    reset: () => {
      set(defaultState);
    }
  };
}

/**
 * Global view mode store instance
 */
export const viewModeStore = createViewModeStore();
