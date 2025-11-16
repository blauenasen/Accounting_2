// src/lib/stores/uiStore.ts
// UI state management (modals, sidebars, loading, errors)

import { writable, type Writable } from 'svelte/store';
import type {
  ModalState,
  SidebarState,
  LoadingState,
  ErrorState,
  DialogOptions
} from '../types/ui.js';

/**
 * UI store state
 */
export interface UIStoreState {
  modal: ModalState;
  sidebar: SidebarState;
  loading: LoadingState;
  error: ErrorState;
  dialog: DialogOptions | null;
}

/**
 * UI store interface
 */
export interface UIStore extends Writable<UIStoreState> {
  openModal: (title?: string, size?: ModalState['size']) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  pinSidebar: () => void;
  unpinSidebar: () => void;
  startLoading: (message?: string, progress?: number) => void;
  updateLoadingProgress: (progress: number) => void;
  stopLoading: () => void;
  showError: (message: string, code?: string, details?: unknown) => void;
  clearError: () => void;
  showDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

/**
 * Creates a UI state store
 * @returns UI store with helper methods
 */
function createUIStore(): UIStore {
  const defaultState: UIStoreState = {
    modal: {
      isOpen: false,
      closeable: true
    },
    sidebar: {
      isOpen: true,
      collapsed: false,
      pinned: true
    },
    loading: {
      isLoading: false
    },
    error: {
      hasError: false
    },
    dialog: null
  };

  const { subscribe, set, update } = writable<UIStoreState>(defaultState);

  return {
    subscribe,
    set,
    update,

    /**
     * Open a modal
     * @param title Modal title
     * @param size Modal size
     */
    openModal: (title?: string, size: ModalState['size'] = 'medium') => {
      update(state => ({
        ...state,
        modal: {
          isOpen: true,
          title,
          size,
          closeable: true
        }
      }));
    },

    /**
     * Close the modal
     */
    closeModal: () => {
      update(state => ({
        ...state,
        modal: {
          ...state.modal,
          isOpen: false
        }
      }));
    },

    /**
     * Toggle sidebar open/closed
     */
    toggleSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: !state.sidebar.isOpen
        }
      }));
    },

    /**
     * Open the sidebar
     */
    openSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: true
        }
      }));
    },

    /**
     * Close the sidebar
     */
    closeSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: false
        }
      }));
    },

    /**
     * Collapse the sidebar (icons only)
     */
    collapseSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          collapsed: true
        }
      }));
    },

    /**
     * Expand the sidebar (full width)
     */
    expandSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          collapsed: false
        }
      }));
    },

    /**
     * Pin the sidebar (stays open)
     */
    pinSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          pinned: true
        }
      }));
    },

    /**
     * Unpin the sidebar (auto-collapse)
     */
    unpinSidebar: () => {
      update(state => ({
        ...state,
        sidebar: {
          ...state.sidebar,
          pinned: false
        }
      }));
    },

    /**
     * Start loading state
     * @param message Loading message
     * @param progress Initial progress (0-100)
     */
    startLoading: (message?: string, progress?: number) => {
      update(state => ({
        ...state,
        loading: {
          isLoading: true,
          message,
          progress
        }
      }));
    },

    /**
     * Update loading progress
     * @param progress Progress percentage (0-100)
     */
    updateLoadingProgress: (progress: number) => {
      update(state => ({
        ...state,
        loading: {
          ...state.loading,
          progress: Math.min(Math.max(progress, 0), 100)
        }
      }));
    },

    /**
     * Stop loading state
     */
    stopLoading: () => {
      update(state => ({
        ...state,
        loading: {
          isLoading: false
        }
      }));
    },

    /**
     * Show error state
     * @param message Error message
     * @param code Error code
     * @param details Error details
     */
    showError: (message: string, code?: string, details?: unknown) => {
      update(state => ({
        ...state,
        error: {
          hasError: true,
          message,
          code,
          details
        }
      }));
    },

    /**
     * Clear error state
     */
    clearError: () => {
      update(state => ({
        ...state,
        error: {
          hasError: false
        }
      }));
    },

    /**
     * Show a confirmation dialog
     * @param options Dialog options
     */
    showDialog: (options: DialogOptions) => {
      update(state => ({
        ...state,
        dialog: options
      }));
    },

    /**
     * Close the dialog
     */
    closeDialog: () => {
      update(state => ({
        ...state,
        dialog: null
      }));
    }
  };
}

/**
 * Global UI store instance
 */
export const uiStore = createUIStore();

/**
 * Shorthand functions for common operations
 */

/**
 * Show loading indicator
 * @param message Optional loading message
 */
export function showLoading(message?: string): void {
  uiStore.startLoading(message);
}

/**
 * Hide loading indicator
 */
export function hideLoading(): void {
  uiStore.stopLoading();
}

/**
 * Show error message
 * @param message Error message
 * @param code Optional error code
 */
export function showError(message: string, code?: string): void {
  uiStore.showError(message, code);
}

/**
 * Clear error message
 */
export function clearError(): void {
  uiStore.clearError();
}

/**
 * Show confirmation dialog
 * @param title Dialog title
 * @param message Dialog message
 * @param onConfirm Callback on confirm
 * @param onCancel Callback on cancel
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm?: () => void | Promise<void>,
  onCancel?: () => void
): void {
  uiStore.showDialog({
    title,
    message,
    type: 'confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm,
    onCancel
  });
}

/**
 * Close dialog
 */
export function closeDialog(): void {
  uiStore.closeDialog();
}
