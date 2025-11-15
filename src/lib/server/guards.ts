// src/lib/server/guards.ts
// Lock checks and guards for Invoice/Estimate

import type Database from 'better-sqlite3';

/**
 * Custom error with code property
 */
export class GuardError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message || code);
    this.code = code;
    this.name = 'GuardError';
  }
}

/**
 * Parsed estimate number structure
 */
export interface ParsedEstimateNr {
  year: number;
  num: number;
}

/**
 * Check if invoice is locked
 * @param db Database connection
 * @param id_invoice Invoice ID
 * @returns true if locked, false otherwise
 */
export function isInvoiceLocked(db: Database.Database, id_invoice: number): boolean {
  if (!db || typeof db.prepare !== 'function') {
    throw new GuardError('DB_MISSING', 'Database connection missing');
  }
  const row = db.prepare(`SELECT blocked FROM invoice WHERE id_invoice = ?`).get(Number(id_invoice)) as { blocked?: number } | undefined;
  return !!Number(row?.blocked || 0);
}

/**
 * Assert that invoice is not locked, throw error if locked
 * @param db Database connection
 * @param id_invoice Invoice ID
 * @throws GuardError if invoice is locked
 */
export function assertInvoiceNotLocked(db: Database.Database, id_invoice: number): void {
  if (isInvoiceLocked(db, id_invoice)) {
    throw new GuardError('LOCKED', `Invoice ${id_invoice} is locked`);
  }
}

/**
 * Parse estimate number from format E-YYYY-NNN
 * @param estimateNr Estimate number string (e.g. 'E-2025-007')
 * @returns Parsed year and num or null if invalid
 */
export function parseEstimateNr(estimateNr: string): ParsedEstimateNr | null {
  const m = /^E-(\d{4})-(\d{3})$/.exec(String(estimateNr || ''));
  if (!m) return null;
  return { year: Number(m[1]), num: Number(m[2]) };
}

/**
 * Check if estimate is locked by estimate number
 * @param db Database connection
 * @param estimateNr Estimate number (e.g. 'E-2025-007')
 * @returns true if locked, false otherwise
 */
export function isEstimateLockedByNr(db: Database.Database, estimateNr: string): boolean {
  const parsed = parseEstimateNr(estimateNr);
  if (!parsed) return false;
  const row = db.prepare(`SELECT blocked FROM estimate WHERE year = ? AND num = ?`).get(parsed.year, parsed.num) as { blocked?: number } | undefined;
  return !!Number(row?.blocked || 0);
}

/**
 * Assert that estimate is not locked, throw error if locked
 * @param db Database connection
 * @param estimateNr Estimate number (e.g. 'E-2025-007')
 * @throws GuardError if estimate is locked
 */
export function assertEstimateNotLockedByNr(db: Database.Database, estimateNr: string): void {
  if (isEstimateLockedByNr(db, estimateNr)) {
    throw new GuardError('LOCKED', `Estimate ${estimateNr} is locked`);
  }
}
