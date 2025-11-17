/**
 * Rates validation logic
 * Extracted from rates page for testability
 *
 * IMPORTANT: Uses decimal.js for all currency calculations (CLAUDE.md requirement)
 */

import Decimal from 'decimal.js';

export interface RateFormData {
  service: string;
  description: string;
  qty: string;
  rate: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ParsedRateData {
  service: string;
  description: string;
  qty: number;
  rate: number;
}

/**
 * Validate rate form data
 */
export function validateRateForm(data: RateFormData): ValidationResult {
  const errors: string[] = [];

  // Validate service
  if (!data.service || !data.service.trim()) {
    errors.push('Service is required');
  }

  // Validate description
  if (!data.description || !data.description.trim()) {
    errors.push('Description is required');
  }

  // Validate qty (using decimal.js for precision)
  try {
    const qtyDecimal = new Decimal(data.qty);
    const qtyNum = qtyDecimal.toNumber();

    if (isNaN(qtyNum)) {
      errors.push('Quantity must be a valid number');
    } else if (qtyDecimal.lessThanOrEqualTo(0)) {
      errors.push('Quantity must be greater than 0');
    }
  } catch {
    errors.push('Quantity must be a valid number');
  }

  // Validate rate (using decimal.js for precision)
  const rateNum = parseRateValue(data.rate);
  if (isNaN(rateNum)) {
    errors.push('Rate must be a valid number');
  } else {
    const rateDecimal = new Decimal(rateNum);
    if (rateDecimal.lessThan(0)) {
      errors.push('Rate cannot be negative');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Parse rate value, removing currency symbols
 * Uses decimal.js for precision (CLAUDE.md requirement)
 */
export function parseRateValue(rateStr: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = rateStr.replace(/[^0-9.-]/g, '');

  try {
    // Use Decimal.js for precise parsing
    return new Decimal(cleaned).toDecimalPlaces(2).toNumber();
  } catch {
    // Return NaN if parsing fails
    return NaN;
  }
}

/**
 * Format rate for display with currency
 * Uses decimal.js for precision (CLAUDE.md requirement)
 */
export function formatRateValue(rate: number): string {
  const decimal = new Decimal(rate);
  return decimal.toDecimalPlaces(2).toFixed(2) + ' $';
}

/**
 * Parse form data to API payload
 */
export function parseRateFormData(data: RateFormData): ParsedRateData | null {
  const validation = validateRateForm(data);

  if (!validation.valid) {
    return null;
  }

  // Use decimal.js for precise parsing
  const qtyDecimal = new Decimal(data.qty);
  const rateDecimal = new Decimal(parseRateValue(data.rate));

  return {
    service: data.service.trim(),
    description: data.description.trim(),
    qty: qtyDecimal.toDecimalPlaces(2).toNumber(),
    rate: rateDecimal.toDecimalPlaces(2).toNumber()
  };
}
