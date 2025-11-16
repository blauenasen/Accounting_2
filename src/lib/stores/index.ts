// src/lib/stores/index.ts
// Central store exports

// Selection store
export {
  selectionStore,
  selectionCount,
  selectedIds,
  hasSelection,
  type SelectionStore,
  type InternalSelectionState
} from './selectionStore.js';

// View mode store
export {
  viewModeStore,
  type ViewModeStore,
  type ViewModeState
} from './viewModeStore.js';

// Split transaction store
export {
  splitStore,
  isSplitValid,
  splitErrors,
  splitRemaining,
  splitPositionCount,
  type SplitStore,
  type SplitStoreState
} from './splitStore.js';

// Matching/Auszifferung store
export {
  matchingStore,
  isMatchingValid,
  matchingErrors,
  matchingItemCount,
  matchingTotalSoll,
  matchingTotalHaben,
  matchingDifference,
  type MatchingStore,
  type MatchingStoreState
} from './matchingStore.js';

// UI store
export {
  uiStore,
  showLoading,
  hideLoading,
  showError,
  clearError,
  showConfirmDialog,
  closeDialog,
  type UIStore,
  type UIStoreState
} from './uiStore.js';
