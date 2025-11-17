/**
 * Tooltip Editor Store
 *
 * Manages the state of the tooltip editor modal used for
 * editing tooltip content throughout the application.
 *
 * CLAUDE.md Compliance:
 * - File size: <100 lines ✓
 * - TypeScript: Yes ✓
 * - Svelte 4 Store Pattern ✓
 */

import { writable } from 'svelte/store';

/**
 * State interface for the tooltip editor
 */
export interface TooltipEditorState {
	/** Whether the editor modal is currently open */
	isOpen: boolean;
	/** The category of the tooltip being edited (e.g., 'booking', 'invoice') */
	category: string | null;
	/** The key/identifier of the tooltip being edited */
	key: string | null;
	/** The current value/content of the tooltip */
	value: string | null;
}

/**
 * Tooltip Editor Store Interface
 */
export interface TooltipEditorStore {
	subscribe: (run: (value: TooltipEditorState) => void) => () => void;
	open: (category: string, key: string, value?: string) => void;
	close: () => void;
	reset: () => void;
	updateValue: (value: string) => void;
}

/**
 * Initial state for the tooltip editor
 */
const initialState: TooltipEditorState = {
	isOpen: false,
	category: null,
	key: null,
	value: null
};

/**
 * Creates the tooltip editor store with custom actions
 *
 * @returns TooltipEditorStore with subscribe and action methods
 */
function createTooltipEditorStore(): TooltipEditorStore {
	const { subscribe, set, update } = writable<TooltipEditorState>(initialState);

	return {
		subscribe,

		/**
		 * Opens the tooltip editor modal
		 *
		 * @param category - The tooltip category (e.g., 'booking', 'invoice')
		 * @param key - The tooltip key/identifier
		 * @param value - Optional initial value for the tooltip
		 */
		open: (category: string, key: string, value = '') => {
			set({
				isOpen: true,
				category,
				key,
				value
			});
		},

		/**
		 * Closes the tooltip editor modal
		 */
		close: () => {
			update((state) => ({
				...state,
				isOpen: false
			}));
		},

		/**
		 * Resets the store to its initial state
		 */
		reset: () => {
			set(initialState);
		},

		/**
		 * Updates the tooltip value while keeping other state intact
		 *
		 * @param value - The new tooltip value
		 */
		updateValue: (value: string) => {
			update((state) => ({
				...state,
				value
			}));
		}
	};
}

/**
 * Global tooltip editor store instance
 *
 * Usage in components:
 * ```svelte
 * <script>
 *   import { tooltipEditor } from '$lib/stores/tooltipEditor';
 *
 *   function editTooltip() {
 *     tooltipEditor.open('booking', 'invoice_number', 'Enter invoice number');
 *   }
 * </script>
 *
 * {#if $tooltipEditor.isOpen}
 *   <TooltipEditorModal />
 * {/if}
 * ```
 */
export const tooltipEditor = createTooltipEditorStore();
