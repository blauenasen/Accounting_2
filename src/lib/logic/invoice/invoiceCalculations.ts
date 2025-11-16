// src/lib/logic/invoice/invoiceCalculations.ts
// Invoice calculation logic using Decimal.js for precision

import Decimal from 'decimal.js';
import type { InvoicePosition, InvoiceTotals } from '$lib/types/ui.js';

/**
 * Calculate position totals
 * @param quantity - Quantity of items
 * @param unitPrice - Price per unit
 * @param gstRate - GST rate (e.g., 5 for 5%)
 * @returns Object with subtotal, gst, and total
 */
export function calculatePositionTotals(
  quantity: number,
  unitPrice: number,
  gstRate: number
): { subtotal: number; gst: number; total: number } {
  const qty = new Decimal(quantity || 0);
  const price = new Decimal(unitPrice || 0);
  const rate = new Decimal(gstRate || 0);

  // Subtotal = quantity * unit_price
  const subtotal = qty.times(price).toDecimalPlaces(2);

  // GST = subtotal * (gst_rate / 100)
  const gst = subtotal.times(rate).dividedBy(100).toDecimalPlaces(2);

  // Total = subtotal + gst
  const total = subtotal.plus(gst).toDecimalPlaces(2);

  return {
    subtotal: subtotal.toNumber(),
    gst: gst.toNumber(),
    total: total.toNumber()
  };
}

/**
 * Calculate invoice totals from positions
 * @param positions - Array of invoice positions
 * @returns Invoice totals
 */
export function calculateInvoiceTotals(positions: InvoicePosition[]): InvoiceTotals {
  if (!Array.isArray(positions) || positions.length === 0) {
    return {
      subtotal: 0,
      gstSum: 0,
      gstPct: 0,
      total: 0
    };
  }

  let subtotalSum = new Decimal(0);
  let gstSum = new Decimal(0);

  for (const pos of positions) {
    const qty = new Decimal(pos.quantity || 0);
    const price = new Decimal(pos.unit_price || 0);
    const rate = new Decimal(pos.gst_rate || 0);

    const posSubtotal = qty.times(price);
    const posGst = posSubtotal.times(rate).dividedBy(100);

    subtotalSum = subtotalSum.plus(posSubtotal);
    gstSum = gstSum.plus(posGst);
  }

  const totalSum = subtotalSum.plus(gstSum);

  // Calculate average GST percentage
  const gstPct = subtotalSum.greaterThan(0)
    ? gstSum.dividedBy(subtotalSum).times(100).toDecimalPlaces(2)
    : new Decimal(0);

  return {
    subtotal: subtotalSum.toDecimalPlaces(2).toNumber(),
    gstSum: gstSum.toDecimalPlaces(2).toNumber(),
    gstPct: gstPct.toNumber(),
    total: totalSum.toDecimalPlaces(2).toNumber()
  };
}

/**
 * Recalculate all position totals in place
 * @param positions - Array of invoice positions (will be mutated)
 * @returns Updated positions array
 */
export function recalculatePositions(positions: InvoicePosition[]): InvoicePosition[] {
  if (!Array.isArray(positions)) return [];

  return positions.map((pos) => {
    const calcs = calculatePositionTotals(pos.quantity, pos.unit_price, pos.gst_rate);
    return {
      ...pos,
      subtotal: calcs.subtotal,
      gst: calcs.gst,
      total: calcs.total
    };
  });
}

/**
 * Validate numeric value for calculations
 * @param value - Value to validate
 * @returns Valid number or 0
 */
export function validateNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !Number.isNaN(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Format money value
 * @param value - Numeric value
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted money string
 */
export function formatMoney(value: number, currency: string = '$'): string {
  const formatter = new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatter.format(value || 0)} ${currency}`;
}

/**
 * Parse money string to number
 * @param value - Money string (e.g., "123.45 $")
 * @returns Numeric value
 */
export function parseMoney(value: string): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return !Number.isNaN(parsed) ? parsed : 0;
}
