// src/lib/server/booking/account-sources.ts
// Provides normalized access to account master data across SKR04, debtors, and creditors

import db from '../index.js';
import type Database from 'better-sqlite3';

const SOURCE_SKR = 'skr04_accounts';
const SOURCE_DEBTORS = 'debtors';
const SOURCE_CREDITORS = 'creditors';

/**
 * Normalized account entry from any source
 */
export interface NormalizedAccount {
  account: number;
  designation: string;
  category: string;
  source: string;
  filterNo: number | null;
}

/**
 * SKR04 account row structure
 */
interface SkrRow {
  account: number;
  designationDE: string;
  designationEN: string;
  category: string;
  active: number;
  available: number;
}

/**
 * Debtor/Creditor row structure
 */
interface PartnerRow {
  account: number;
  info: string;
  name: string;
  filterNo: number | null;
  category: string;
  blocked: number;
}

const skrStmt = db.prepare(`
  SELECT account, designationDE, designationEN, category, active, available
  FROM skr04_accounts
  WHERE COALESCE(active, 1) != 0
`);

const debtorsStmt = db.prepare(`
  SELECT account, info, name, filterNo, category, blocked
  FROM debtors
  WHERE COALESCE(blocked, 0) = 0
    AND account >= 10000 AND account <= 99999
`);

const creditorsStmt = db.prepare(`
  SELECT account, info, name, filterNo, category, blocked
  FROM creditors
  WHERE COALESCE(blocked, 0) = 0
    AND account >= 10000 AND account <= 99999
`);

/**
 * Convert value to account number (null-safe)
 */
function toAccountNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Resolve designation from primary or secondary value
 */
function resolveDesignation(primary: unknown, secondary: unknown): string {
  const first = primary != null ? String(primary).trim() : '';
  if (first) {
    return first;
  }
  return secondary != null ? String(secondary).trim() : '';
}

/**
 * Normalize SKR04 row to standard format
 */
function normalizeSkrRow(row: SkrRow): NormalizedAccount | null {
  const account = toAccountNumber(row?.account);
  if (!Number.isFinite(account) || account! <= 0) {
    return null;
  }
  return {
    account: account!,
    designation: resolveDesignation(row?.designationEN, row?.designationDE),
    category: row?.category ? String(row.category).trim().toUpperCase() : '',
    source: SOURCE_SKR,
    filterNo: null
  };
}

/**
 * Normalize debtor/creditor row to standard format
 */
function normalizePartnerRow(row: PartnerRow, source: string): NormalizedAccount | null {
  const account = toAccountNumber(row?.account);
  if (!Number.isFinite(account) || account! <= 0) {
    return null;
  }
  const info = row?.info != null ? String(row.info).trim() : '';
  const name = row?.name != null ? String(row.name).trim() : '';
  const designation = info || name;
  return {
    account: account!,
    designation,
    category: row?.category ? String(row.category).trim().toUpperCase() : '',
    source,
    filterNo: row?.filterNo ?? null
  };
}

/**
 * Collect rows from statement (with error handling)
 */
function collectRows(stmt: Database.Statement): unknown[] {
  try {
    return stmt.all();
  } catch (error) {
    // Error logged for debugging (will be removed in production)
    if (error instanceof Error) {
      throw new Error(`account-sources.collectRows failed: ${error.message}`);
    }
    return [];
  }
}

let cached: {
  [SOURCE_SKR]: NormalizedAccount[] | null;
  [SOURCE_DEBTORS]: NormalizedAccount[] | null;
  [SOURCE_CREDITORS]: NormalizedAccount[] | null;
} = {
  [SOURCE_SKR]: null,
  [SOURCE_DEBTORS]: null,
  [SOURCE_CREDITORS]: null,
};

/**
 * Get SKR04 accounts (cached)
 */
export function getSkrAccounts(): NormalizedAccount[] {
  if (!cached[SOURCE_SKR]) {
    const rows = collectRows(skrStmt) as SkrRow[];
    cached[SOURCE_SKR] = rows.map(normalizeSkrRow).filter((x): x is NormalizedAccount => x !== null);
  }
  return cached[SOURCE_SKR]!;
}

/**
 * Get debtor accounts (cached)
 */
export function getDebtorAccounts(): NormalizedAccount[] {
  if (!cached[SOURCE_DEBTORS]) {
    const rows = collectRows(debtorsStmt) as PartnerRow[];
    cached[SOURCE_DEBTORS] = rows.map((row) => normalizePartnerRow(row, SOURCE_DEBTORS)).filter((x): x is NormalizedAccount => x !== null);
  }
  return cached[SOURCE_DEBTORS]!;
}

/**
 * Get creditor accounts (cached)
 */
export function getCreditorAccounts(): NormalizedAccount[] {
  if (!cached[SOURCE_CREDITORS]) {
    const rows = collectRows(creditorsStmt) as PartnerRow[];
    cached[SOURCE_CREDITORS] = rows.map((row) => normalizePartnerRow(row, SOURCE_CREDITORS)).filter((x): x is NormalizedAccount => x !== null);
  }
  return cached[SOURCE_CREDITORS]!;
}

/**
 * Get dataset by source name
 */
export function getDatasetBySource(source: string): NormalizedAccount[] {
  const normalized = String(source ?? '').toLowerCase();
  if (normalized === SOURCE_DEBTORS) {
    return getDebtorAccounts();
  }
  if (normalized === SOURCE_CREDITORS) {
    return getCreditorAccounts();
  }
  return getSkrAccounts();
}

/**
 * Find account in specific source
 */
export function findInSource(source: string, accountNumber: number | string): NormalizedAccount | null {
  const dataset = getDatasetBySource(source);
  const numeric = toAccountNumber(accountNumber);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return dataset.find((entry) => entry.account === numeric) ?? null;
}

/**
 * Reset all account caches (for testing or data reload)
 */
export function resetAccountCaches(): void {
  cached = {
    [SOURCE_SKR]: null,
    [SOURCE_DEBTORS]: null,
    [SOURCE_CREDITORS]: null,
  };
}

/**
 * Account source constants
 */
export const ACCOUNT_SOURCES = {
  SKR: SOURCE_SKR,
  DEBTORS: SOURCE_DEBTORS,
  CREDITORS: SOURCE_CREDITORS,
} as const;
