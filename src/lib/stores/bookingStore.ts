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
  // Keep values for next booking
  keepValues: {
    contraAccount?: string;
    date?: string;
    account?: string;
    tax?: string;
    description?: string;
  };
  // Keep flags
  keepFlags: {
    contraAccount: boolean;
    date: boolean;
    account: boolean;
    tax: boolean;
    description: boolean;
  };
}

function createBookingStore() {
  const { subscribe, set, update } = writable<BookingState>({
    currentView: 'primanota',
    selectedYear: new Date().getFullYear(),
    selectedMonth: 'All',
    selectedBookCircle: '',
    selectedAccount: '',
    hideStornos: false,
    filterActive: false,
    opFilter: 'open',
    keepValues: {},
    keepFlags: {
      contraAccount: false,
      date: false,
      account: false,
      tax: false,
      description: false
    }
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

    setKeepFlag: (field: keyof BookingState['keepFlags'], value: boolean) => {
      update(state => ({
        ...state,
        keepFlags: { ...state.keepFlags, [field]: value }
      }));
    },

    saveKeepValues: (values: Partial<BookingState['keepValues']>, flags: BookingState['keepFlags']) => {
      update(state => {
        const newKeepValues: BookingState['keepValues'] = {};

        if (flags.contraAccount && values.contraAccount) newKeepValues.contraAccount = values.contraAccount;
        if (flags.date && values.date) newKeepValues.date = values.date;
        if (flags.account && values.account) newKeepValues.account = values.account;
        if (flags.tax && values.tax) newKeepValues.tax = values.tax;
        if (flags.description && values.description) newKeepValues.description = values.description;

        return { ...state, keepValues: newKeepValues };
      });
    },

    reset: () => {
      set({
        currentView: 'primanota',
        selectedYear: new Date().getFullYear(),
        selectedMonth: 'All',
        selectedBookCircle: '',
        selectedAccount: '',
        hideStornos: false,
        filterActive: false,
        opFilter: 'open',
        keepValues: {},
        keepFlags: {
          contraAccount: false,
          date: false,
          account: false,
          tax: false,
          description: false
        }
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
