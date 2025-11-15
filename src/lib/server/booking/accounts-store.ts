// src/lib/server/booking/accounts-store.ts
// Data access helpers for SKR04 account management

import db from '../index.js';
import type Database from 'better-sqlite3';

export interface AccountRow {
  account: number;
  designationDE: string;
  designationEN: string;
  category: string;
  jabereich: string;
  japos: string;
  active: boolean;
  available: boolean;
  taxgroup: string;
}

const selectAllStmt = db.prepare(`
  SELECT account, designationDE, designationEN, category, jabereich, japos, active, available, taxgroup
  FROM skr04_accounts
  ORDER BY account
`);

const selectOneStmt = db.prepare(`
  SELECT account, designationDE, designationEN, category, jabereich, japos, active, available, taxgroup
  FROM skr04_accounts
  WHERE account = ?
  LIMIT 1
`);

const insertStmt = db.prepare(`
  INSERT INTO skr04_accounts (account, designationDE, designationEN, category, jabereich, japos, active, available, taxgroup)
  VALUES (@account, @designationDE, @designationEN, @category, @jabereich, @japos, @active, @available, @taxgroup)
`);

const updateStmt = db.prepare(`
  UPDATE skr04_accounts
  SET account = @nextAccount,
      designationDE = @designationDE,
      designationEN = @designationEN,
      category = @category,
      jabereich = @jabereich,
      japos = @japos,
      active = @active,
      available = @available,
      taxgroup = @taxgroup
  WHERE account = @account
`);

const deleteStmt = db.prepare(`
  DELETE FROM skr04_accounts
  WHERE account = ?
`);

const distinctCategoriesStmt = db.prepare(`
  SELECT DISTINCT TRIM(category) AS value
  FROM skr04_accounts
  WHERE category IS NOT NULL AND TRIM(category) != ''
  ORDER BY value
`);

const distinctJaBereichStmt = db.prepare(`
  SELECT DISTINCT TRIM(jabereich) AS value
  FROM skr04_accounts
  WHERE jabereich IS NOT NULL AND TRIM(jabereich) != ''
  ORDER BY value
`);

const distinctJaPosStmt = db.prepare(`
  SELECT DISTINCT TRIM(japos) AS value
  FROM skr04_accounts
  WHERE japos IS NOT NULL AND TRIM(japos) != ''
  ORDER BY value
`);

const distinctTaxgroupStmt = db.prepare(`
  SELECT DISTINCT TRIM(taxgroup) AS value
  FROM skr04_accounts
  WHERE taxgroup IS NOT NULL AND TRIM(taxgroup) != ''
  ORDER BY value
`);

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function normalizeUpper(value: unknown): string {
  return normalizeText(value).toUpperCase();
}

function normalizeAccountRow(row: unknown): AccountRow | null {
  if (!row) return null;
  const r = row as Record<string, unknown>;
  return {
    account: Number(r.account),
    designationDE: normalizeText(r.designationDE),
    designationEN: normalizeText(r.designationEN),
    category: normalizeText(r.category),
    jabereich: normalizeText(r.jabereich),
    japos: normalizeText(r.japos),
    active: toBoolean(r.active),
    available: toBoolean(r.available),
    taxgroup: normalizeText(r.taxgroup)
  };
}

export function listAccounts(): AccountRow[] {
  try {
    return selectAllStmt.all().map(normalizeAccountRow).filter((x): x is AccountRow => x !== null);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`accounts-store.listAccounts failed: ${error.message}`);
    }
    return [];
  }
}

export function getAccount(account: number): AccountRow | null {
  try {
    const row = selectOneStmt.get(account);
    return normalizeAccountRow(row);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`accounts-store.getAccount failed: ${error.message}`);
    }
    return null;
  }
}

export function createAccount(payload: Partial<AccountRow> & { account: number }): AccountRow | null {
  const insert = db.transaction((values: Record<string, unknown>) => {
    insertStmt.run(values);
  });

  insert({
    account: payload.account,
    designationDE: payload.designationDE,
    designationEN: payload.designationEN,
    category: payload.category,
    jabereich: payload.jabereich,
    japos: payload.japos,
    active: payload.active ? 1 : 0,
    available: payload.available ? 1 : 0,
    taxgroup: payload.taxgroup
  });

  return getAccount(payload.account);
}

export function updateAccount(currentAccount: number, payload: Partial<AccountRow> & { account: number }): AccountRow | null {
  updateStmt.run({
    account: currentAccount,
    nextAccount: payload.account,
    designationDE: payload.designationDE,
    designationEN: payload.designationEN,
    category: payload.category,
    jabereich: payload.jabereich,
    japos: payload.japos,
    active: payload.active ? 1 : 0,
    available: payload.available ? 1 : 0,
    taxgroup: payload.taxgroup
  });
  return getAccount(payload.account);
}

export function deleteAccount(account: number): boolean {
  try {
    const info = deleteStmt.run(account);
    return info.changes > 0;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`accounts-store.deleteAccount failed: ${error.message}`);
    }
    return false;
  }
}

function collectDistinct(stmt: Database.Statement): string[] {
  try {
    return stmt.all().map((row) => normalizeText((row as { value: unknown }).value)).filter(Boolean);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`accounts-store.collectDistinct failed: ${error.message}`);
    }
    return [];
  }
}

export function listAccountOptions(): { categories: string[]; jabereiche: string[]; japos: string[]; taxgroups: string[] } {
  return {
    categories: collectDistinct(distinctCategoriesStmt),
    jabereiche: collectDistinct(distinctJaBereichStmt),
    japos: collectDistinct(distinctJaPosStmt),
    taxgroups: collectDistinct(distinctTaxgroupStmt)
  };
}
