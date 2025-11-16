// src/lib/utils/toast.ts
// Toast notification system with auto-dismiss

import { writable, type Writable } from 'svelte/store';

const TOAST_DURATION = 5000; // 5 seconds

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification structure
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

/**
 * Toast store interface
 */
export interface ToastStore extends Writable<Toast[]> {
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Creates a toast notification store
 * @returns Toast store with helper methods
 */
function createToastStore(): ToastStore {
  const { subscribe, update } = writable<Toast[]>([]);

  let idCounter = 0;

  /**
   * Adds a new toast notification
   * @param message Message to display
   * @param type Toast type
   * @param duration Duration in ms
   * @returns Toast ID
   */
  function addToast(message: string, type: ToastType = 'info', duration: number = TOAST_DURATION): string {
    const id = `toast-${++idCounter}-${Date.now()}`;
    const toast: Toast = { id, message, type, duration };

    update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }

  /**
   * Removes a toast notification
   * @param id Toast ID
   */
  function dismissToast(id: string): void {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    dismiss: dismissToast,
    clear: () => update(() => []),
    set: () => {
      throw new Error('Use toast store methods instead of set()');
    },
    update: () => {
      throw new Error('Use toast store methods instead of update()');
    }
  };
}

export const toastStore = createToastStore();
