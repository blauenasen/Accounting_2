// src/lib/logic/invoice/invoiceValidation.ts
// Invoice validation logic

import type { InvoiceData, InvoicePosition } from '$lib/types/ui.js';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate invoice header for new invoice
 * @param data - Invoice data
 * @returns Validation result
 */
export function validateHeaderNew(data: Partial<InvoiceData>): ValidationResult {
  const errors: string[] = [];

  if (!data.date || data.date.trim() === '') {
    errors.push('Date is required');
  }

  if (data.account === null || data.account === undefined) {
    errors.push('Account (Debtor) is required');
  }

  if (!data.year || data.year.trim() === '') {
    errors.push('Year is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate invoice header for existing invoice
 * @param data - Invoice data
 * @returns Validation result
 */
export function validateHeaderExisting(data: Partial<InvoiceData>): ValidationResult {
  const errors: string[] = [];

  if (!data.date || data.date.trim() === '') {
    errors.push('Date is required');
  }

  if (data.account === null || data.account === undefined) {
    errors.push('Account (Debtor) is required');
  }

  if (!data.year || data.year.trim() === '') {
    errors.push('Year is required');
  }

  if (!data.num || data.num.trim() === '') {
    errors.push('Invoice number is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate invoice position
 * @param position - Invoice position
 * @returns Validation result
 */
export function validatePosition(position: Partial<InvoicePosition>): ValidationResult {
  const errors: string[] = [];

  if (!position.description || position.description.trim() === '') {
    errors.push('Description is required');
  }

  if (position.quantity === undefined || position.quantity === null || position.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (position.unit_price === undefined || position.unit_price === null) {
    errors.push('Unit price is required');
  }

  if (position.gst_rate === undefined || position.gst_rate === null || position.gst_rate < 0) {
    errors.push('GST rate must be 0 or greater');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate all positions
 * @param positions - Array of positions
 * @returns Validation result
 */
export function validatePositions(positions: InvoicePosition[]): ValidationResult {
  if (!Array.isArray(positions) || positions.length === 0) {
    return {
      valid: false,
      errors: ['At least one position is required']
    };
  }

  const errors: string[] = [];

  positions.forEach((pos, index) => {
    const result = validatePosition(pos);
    if (!result.valid) {
      errors.push(`Position ${index + 1}: ${result.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if invoice can be saved
 * @param data - Invoice data
 * @returns True if can save
 */
export function canSave(data: Partial<InvoiceData>): boolean {
  return data.isNew === true && validateHeaderNew(data).valid;
}

/**
 * Check if invoice can be updated
 * @param data - Invoice data
 * @returns True if can update
 */
export function canUpdate(data: Partial<InvoiceData>): boolean {
  return (
    data.id_invoice !== null &&
    data.id_invoice !== undefined &&
    data.dirty === true &&
    data.blocked !== true
  );
}

/**
 * Check if invoice can be sent
 * @param data - Invoice data
 * @returns True if can send
 */
export function canSend(data: Partial<InvoiceData>): boolean {
  return (
    data.id_invoice !== null &&
    data.id_invoice !== undefined &&
    data.dirty !== true &&
    data.blocked !== true &&
    (data.linesCount ?? 0) > 0
  );
}

/**
 * Check if invoice can be handed over to accounting
 * @param data - Invoice data
 * @returns True if can handover
 */
export function canHandover(data: Partial<InvoiceData>): boolean {
  return (
    data.id_invoice !== null &&
    data.id_invoice !== undefined &&
    data.blocked === true &&
    data.booked !== true &&
    data.dirty !== true
  );
}

/**
 * Check if invoice can be printed
 * @param data - Invoice data
 * @returns True if can print
 */
export function canPrint(data: Partial<InvoiceData>): boolean {
  return (
    data.id_invoice !== null &&
    data.id_invoice !== undefined &&
    data.dirty !== true &&
    (data.linesCount ?? 0) > 0
  );
}
