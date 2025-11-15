// src/lib/server/companycodes.ts
// Company code access helpers (booking)

import db from './index.js';
import type Database from 'better-sqlite3';

/**
 * Company code row structure
 */
export interface CompanyCode {
  idcode: number | null;
  no: number;
  textcode: string;
  account: number | null;
  available: boolean;
}

/**
 * Company code creation/update payload
 */
export interface CompanyCodePayload {
  no?: number | string;
  textcode?: string;
  account?: number | string | null;
  available?: boolean;
}

const selectByNoStmt = db.prepare(`
  SELECT idcode, no, textcode, account, available
  FROM companycodes
  WHERE no = ?
  LIMIT 1
`);

const selectAllStmt = db.prepare(`
  SELECT idcode, no, textcode, account, available
  FROM companycodes
  ORDER BY no
`);

const insertStmt = db.prepare(`
  INSERT INTO companycodes (no, textcode, account, available)
  VALUES (?, ?, ?, ?)
`);

const updateStmt = db.prepare(`
  UPDATE companycodes
  SET no = ?, textcode = ?, account = ?, available = ?
  WHERE idcode = ?
`);

const deleteStmt = db.prepare(`
  DELETE FROM companycodes
  WHERE idcode = ?
`);

/**
 * Convert value to optional integer (null-safe)
 */
function toOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Normalize company code row from database
 */
function normalizeRow(row: unknown): CompanyCode | null {
  if (!row) {
    return null;
  }
  const r = row as Record<string, unknown>;
  const number = toOptionalInt(r.no);
  if (!Number.isFinite(number)) {
    return null;
  }
  return {
    idcode: r.idcode != null ? Number(r.idcode) : null,
    no: number!,
    textcode: r.textcode ? String(r.textcode) : '',
    account: toOptionalInt(r.account),
    available: r.available != null ? Number(r.available) === 1 : true
  };
}

/**
 * Get company code by number (book circle)
 * @param bookCircle Company code number
 * @returns Company code or null
 */
export function getCompanyCodeByNumber(bookCircle: number | string): CompanyCode | null {
  const numericCircle = toOptionalInt(bookCircle);
  if (!Number.isFinite(numericCircle)) {
    return null;
  }
  try {
    const row = selectByNoStmt.get(numericCircle);
    return normalizeRow(row);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`companycodes.getCompanyCodeByNumber failed: ${error.message}`);
    }
    return null;
  }
}

/**
 * Get account number associated with company code
 * @param bookCircle Company code number
 * @returns Account number or null
 */
export function getCompanyCodeAccount(bookCircle: number | string): number | null {
  const entry = getCompanyCodeByNumber(bookCircle);
  return entry?.account ?? null;
}

/**
 * List all company codes
 * @returns Array of company codes
 */
export function listCompanyCodes(): CompanyCode[] {
  try {
    return selectAllStmt.all().map(normalizeRow).filter((x): x is CompanyCode => x !== null);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`companycodes.listCompanyCodes failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * Create new company code
 * @param payload Company code data
 * @returns Created company code or null
 * @throws Error if no is invalid or duplicate
 */
export function createCompanyCode(payload: CompanyCodePayload): CompanyCode | null {
  const numericNo = toOptionalInt(payload?.no);
  if (!Number.isFinite(numericNo) || numericNo! < 0) {
    throw new Error('COMPANYCODE_NO_INVALID');
  }
  const existing = getCompanyCodeByNumber(numericNo!);
  if (existing) {
    throw new Error('COMPANYCODE_NO_DUPLICATE');
  }
  try {
    insertStmt.run(
      numericNo,
      payload?.textcode ? String(payload.textcode).trim() : '',
      toOptionalInt(payload?.account),
      payload?.available ? 1 : 0
    );
    return getCompanyCodeByNumber(numericNo!);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`companycodes.createCompanyCode failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Update existing company code
 * @param idcode Company code ID
 * @param payload Company code data
 * @returns Updated company code or null
 * @throws Error if idcode is missing, no is invalid, or duplicate
 */
export function updateCompanyCode(idcode: number, payload: CompanyCodePayload): CompanyCode | null {
  if (!Number.isFinite(idcode)) {
    throw new Error('COMPANYCODE_ID_REQUIRED');
  }
  const numericNo = toOptionalInt(payload?.no);
  if (!Number.isFinite(numericNo) || numericNo! < 0) {
    throw new Error('COMPANYCODE_NO_INVALID');
  }
  const current = listCompanyCodes().find((entry) => entry?.idcode === idcode);
  if (!current) {
    throw new Error('COMPANYCODE_NOT_FOUND');
  }
  if (numericNo !== current.no) {
    const existing = getCompanyCodeByNumber(numericNo!);
    if (existing) {
      throw new Error('COMPANYCODE_NO_DUPLICATE');
    }
  }
  updateStmt.run(
    numericNo,
    payload?.textcode ? String(payload.textcode).trim() : '',
    toOptionalInt(payload?.account),
    payload?.available ? 1 : 0,
    idcode
  );
  return listCompanyCodes().find((entry) => entry?.idcode === idcode) ?? null;
}

/**
 * Delete company code by ID
 * @param idcode Company code ID
 * @returns true if deleted, false otherwise
 */
export function deleteCompanyCode(idcode: number): boolean {
  try {
    const info = deleteStmt.run(idcode);
    return info.changes > 0;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`companycodes.deleteCompanyCode failed: ${error.message}`);
    }
    return false;
  }
}
