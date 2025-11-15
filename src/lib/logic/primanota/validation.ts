// src/lib/logic/primanota/validation.ts
// Validation logic for Primanota table

/**
 * Booking row structure for validation
 */
export interface BookingRow {
  GU?: string | null;
  gu?: string | null;
  Gesperrt?: boolean | number;
  gesperrt?: boolean | number;
  pdf_blob?: unknown;
  id_invoice?: number | null;
  [key: string]: unknown;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  canEdit?: boolean;
  canDelete?: boolean;
  canCancel?: boolean;
  reason: string;
}

/**
 * Checks if a booking row is storno (cancelled)
 * @param row Booking row
 * @returns True if row is storno
 */
export function isRowStorno(row: BookingRow): boolean {
  const gu = String(row?.GU || row?.gu || '').trim();
  return gu !== '';
}

/**
 * Checks if a row can be edited
 * @param row Booking row
 * @returns Object with canEdit boolean and reason string
 */
export function canEditRow(row: BookingRow): ValidationResult {
  if (isRowStorno(row)) {
    return { canEdit: false, reason: 'Cancelled booking cannot be edited' };
  }

  const isLocked = Boolean(row?.Gesperrt ?? row?.gesperrt ?? false);
  if (isLocked) {
    return { canEdit: false, reason: 'Record is locked and cannot be edited' };
  }

  return { canEdit: true, reason: '' };
}

/**
 * Checks if a row can be deleted
 * @param row Booking row
 * @returns Object with canDelete boolean and reason string
 */
export function canDeleteRow(row: BookingRow): ValidationResult {
  const isLocked = Boolean(row?.Gesperrt ?? row?.gesperrt ?? false);
  if (isLocked) {
    return { canDelete: false, reason: 'Locked entries cannot be deleted' };
  }

  const hasGU = Boolean(row?.GU && String(row.GU).trim() !== '');
  if (hasGU) {
    return { canDelete: false, reason: 'Storno bookings cannot be deleted' };
  }

  const hasPDF = Boolean(row?.pdf_blob);
  if (hasPDF) {
    return { canDelete: false, reason: 'Entries with attached PDFs cannot be deleted' };
  }

  const hasInvoice = Boolean(row?.id_invoice);
  if (hasInvoice) {
    return { canDelete: false, reason: 'Entries linked to invoices cannot be deleted' };
  }

  return { canDelete: true, reason: '' };
}

/**
 * Checks if a row can be cancelled
 * @param row Booking row
 * @returns Object with canCancel boolean and reason string
 */
export function canCancelRow(row: BookingRow): ValidationResult {
  const isLocked = Boolean(row?.Gesperrt ?? row?.gesperrt ?? false);
  if (isLocked) {
    return { canCancel: false, reason: 'Booking is locked and cannot be cancelled' };
  }

  if (isRowStorno(row)) {
    return { canCancel: false, reason: 'Booking is already cancelled' };
  }

  return { canCancel: true, reason: '' };
}
