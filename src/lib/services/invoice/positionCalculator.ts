import Decimal from 'decimal.js';
import type { InvoicePosition } from '$lib/types/ui.js';

export interface PositionTotals {
  subtotal: number;
  gst: number;
  total: number;
}

/**
 * Calculate position totals (subtotal, GST, total)
 * Uses Decimal.js for precise decimal calculations
 */
export function calculatePositionTotals(position: InvoicePosition): PositionTotals {
  const quantity = new Decimal(position.quantity || 0);
  const unitPrice = new Decimal(position.unit_price || 0);
  const gstRate = new Decimal(position.gst_rate || 0).div(100);

  const subtotal = quantity.times(unitPrice);
  const gst = subtotal.times(gstRate);
  const total = subtotal.plus(gst);

  return {
    subtotal: subtotal.toDecimalPlaces(2).toNumber(),
    gst: gst.toDecimalPlaces(2).toNumber(),
    total: total.toDecimalPlaces(2).toNumber()
  };
}

/**
 * Format currency for display (German locale, EUR)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(value || 0);
}
