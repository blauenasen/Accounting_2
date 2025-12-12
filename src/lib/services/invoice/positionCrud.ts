import type { InvoicePosition } from '$lib/types/ui.js';
import { calculatePositionTotals } from './positionCalculator.js';

export const MAX_POSITIONS = 20;

/**
 * Create a new invoice position with default values
 */
export function createNewPosition(
  currentLength: number,
  defaultGstRate: number
): InvoicePosition {
  return {
    id: null,
    id_invoice: null,
    pos: currentLength + 1,
    quantity: 1,
    description: '',
    unit_price: 0,
    gst_rate: defaultGstRate,
    subtotal: 0,
    gst: 0,
    total: 0
  };
}

/**
 * Add a new position to the positions array
 * Returns success status and updated positions array
 */
export function addPosition(
  positions: InvoicePosition[],
  defaultGstRate: number
): { success: boolean; positions: InvoicePosition[]; error?: string } {
  if (positions.length >= MAX_POSITIONS) {
    return {
      success: false,
      positions,
      error: `Maximum ${MAX_POSITIONS} positions allowed`
    };
  }

  const newPos = createNewPosition(positions.length, defaultGstRate);
  return { success: true, positions: [...positions, newPos] };
}

/**
 * Remove a position at the specified index
 * Returns new positions array with renumbered positions
 */
export function removePosition(
  positions: InvoicePosition[],
  index: number
): InvoicePosition[] {
  return positions
    .filter((_, i) => i !== index)
    .map((p, i) => ({ ...p, pos: i + 1 }))
    .map(pos => ({ ...pos, ...calculatePositionTotals(pos) }));
}

/**
 * Move a position up or down in the array
 * Returns new positions array with renumbered positions
 */
export function movePosition(
  positions: InvoicePosition[],
  index: number,
  direction: 'up' | 'down'
): InvoicePosition[] {
  if (direction === 'up' && index === 0) return positions;
  if (direction === 'down' && index === positions.length - 1) return positions;

  const newPositions = [...positions];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  [newPositions[index], newPositions[targetIndex]] =
    [newPositions[targetIndex], newPositions[index]];

  return newPositions.map((p, i) => ({ ...p, pos: i + 1 }));
}
