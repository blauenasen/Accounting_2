/**
 * Rates validation logic
 * Extracted from rates page for testability
 */

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

  // Validate qty
  const qtyNum = parseFloat(data.qty);
  if (isNaN(qtyNum)) {
    errors.push('Quantity must be a valid number');
  } else if (qtyNum <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  // Validate rate
  const rateNum = parseRateValue(data.rate);
  if (isNaN(rateNum)) {
    errors.push('Rate must be a valid number');
  } else if (rateNum < 0) {
    errors.push('Rate cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Parse rate value, removing currency symbols
 */
export function parseRateValue(rateStr: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = rateStr.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
}

/**
 * Format rate for display with currency
 */
export function formatRateValue(rate: number): string {
  return rate.toFixed(2) + ' $';
}

/**
 * Parse form data to API payload
 */
export function parseRateFormData(data: RateFormData): ParsedRateData | null {
  const validation = validateRateForm(data);

  if (!validation.valid) {
    return null;
  }

  return {
    service: data.service.trim(),
    description: data.description.trim(),
    qty: parseFloat(data.qty),
    rate: parseRateValue(data.rate)
  };
}
