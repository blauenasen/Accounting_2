// bookingStore.ts
// Store for Booking page state management
// CLAUDE.md compliant: ≤300 lines

import { writable, derived } from 'svelte/store';

export type BookingView = 'primanota' | 'kontoansicht' | 'op';

export interface BookingState {
  currentView: BookingView;
  selectedYear: number;
  selectedMonth: number | 'All';
  selectedBookCircle: string;
  selectedAccount: string;
  hideStornos: boolean;
  filterActive: boolean;
  opFilter: 'open' | 'balanced' | 'all';
}

function createBookingStore() {
  const { subscribe, set, update } = writable<BookingState>({
    currentView: 'primanota',
    selectedYear: new Date().getFullYear(),
    selectedMonth: 'All',
    selectedBookCircle: 'Bank 1',
    selectedAccount: '',
    hideStornos: false,
    filterActive: false,
    opFilter: 'open'
  });

  return {
    subscribe,

    setView: (view: BookingView) => {
      update(state => ({ ...state, currentView: view }));
    },

    setYear: (year: number) => {
      update(state => ({ ...state, selectedYear: year }));
    },

    setMonth: (month: number | 'All') => {
      update(state => ({ ...state, selectedMonth: month }));
    },

    setBookCircle: (circle: string) => {
      update(state => ({ ...state, selectedBookCircle: circle }));
    },

    setAccount: (account: string) => {
      update(state => ({ ...state, selectedAccount: account }));
    },

    toggleHideStornos: () => {
      update(state => ({ ...state, hideStornos: !state.hideStornos }));
    },

    toggleFilter: () => {
      update(state => ({ ...state, filterActive: !state.filterActive }));
    },

    setOPFilter: (filter: 'open' | 'balanced' | 'all') => {
      update(state => ({ ...state, opFilter: filter }));
    },

    reset: () => {
      set({
        currentView: 'primanota',
        selectedYear: new Date().getFullYear(),
        selectedMonth: 'All',
        selectedBookCircle: 'Bank 1',
        selectedAccount: '',
        hideStornos: false,
        filterActive: false,
        opFilter: 'open'
      });
    }
  };
}

export const bookingStore = createBookingStore();

// Derived stores for convenience
export const currentView = derived(bookingStore, $store => $store.currentView);
export const selectedPeriod = derived(bookingStore, $store => ({
  year: $store.selectedYear,
  month: $store.selectedMonth
}));
