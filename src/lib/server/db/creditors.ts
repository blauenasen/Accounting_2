// src/lib/server/db/creditors.ts
// Creditors (Kreditoren) functions

import type Database from 'better-sqlite3';

/**
 * Creditor (Kreditor) entry
 */
export interface Creditor {
  account: number;
  salutation: string;
  name: string;
  adress1: string;
  adress2: string;
  adress3: string;
  email: string;
  name1: string;
  category?: string;
  OPBereich: string;
  OPArt: string;
  filterNo?: string;
  info: string;
  blocked: number;
  original_account?: number; // Used for updates when account number changes
}

/**
 * Helper: Convert value to string (null-safe)
 */
const toStr = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/**
 * Helper: Convert value to integer (null-safe)
 */
const toInt = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10));

/**
 * Get active creditors (blocked = 0)
 * @returns Array of active creditors
 */
export function getCreditors(db: Database.Database): Creditor[] {
  const stmt = db.prepare(`
    SELECT account, salutation, name, adress1, adress2, adress3, email,
           name1, OPBereich, OPArt, filterNo, info, blocked
    FROM creditors
    WHERE blocked = 0
    ORDER BY account
  `);
  return stmt.all() as Creditor[];
}

/**
 * Get all creditors (including blocked)
 * @returns Array of all creditors
 */
export function getAllCreditors(db: Database.Database): Creditor[] {
  const stmt = db.prepare(`
    SELECT account, salutation, name, adress1, adress2, adress3, email,
           name1, OPBereich, OPArt, filterNo, info, blocked
    FROM creditors
    ORDER BY account
  `);
  return stmt.all() as Creditor[];
}

/**
 * Insert new creditor
 * @param d Creditor data to insert
 * @returns ID of inserted creditor
 */
export function insertCreditor(db: Database.Database, d: Partial<Creditor>): number {
  const stmt = db.prepare(`
    INSERT INTO creditors
      (account, salutation, name, adress1, adress2, adress3, email,
       name1, category, OPBereich, OPArt, filterNo, info, blocked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  const res = stmt.run(
    toInt(d.account),
    toStr(d.salutation),
    toStr(d.name),
    toStr(d.adress1),
    toStr(d.adress2),
    toStr(d.adress3),
    toStr(d.email),
    toStr(d.name1),
    toStr(d.category),
    toStr(d.OPBereich),
    toStr(d.OPArt),
    toStr(d.filterNo),
    toStr(d.info)
  );
  return Number(res.lastInsertRowid);
}

/**
 * Update existing creditor
 * @param d Creditor data with account number (use original_account if account number changes)
 */
export function updateCreditor(db: Database.Database, d: Partial<Creditor> & { account: number }): Database.RunResult {
  const accWhere = d.original_account ?? d.account;
  const stmt = db.prepare(`
    UPDATE creditors
    SET account = ?, salutation = ?, name = ?, adress1 = ?, adress2 = ?, adress3 = ?, email = ?,
        name1 = ?, category = ?, OPBereich = ?, OPArt = ?, filterNo = ?, info = ?, blocked = ?
    WHERE account = ?
  `);
  return stmt.run(
    toInt(d.account),
    toStr(d.salutation),
    toStr(d.name),
    toStr(d.adress1),
    toStr(d.adress2),
    toStr(d.adress3),
    toStr(d.email),
    toStr(d.name1),
    toStr(d.category),
    toStr(d.OPBereich),
    toStr(d.OPArt),
    toStr(d.filterNo),
    toStr(d.info),
    toInt(d.blocked) ?? 0,
    toInt(accWhere)
  );
}

/**
 * Delete creditor (soft delete by setting blocked = 1)
 * @param account Account number to delete
 */
export function deleteCreditor(db: Database.Database, account: number): Database.RunResult {
  const stmt = db.prepare(`UPDATE creditors SET blocked = 1 WHERE account = ?`);
  return stmt.run(toInt(account));
}
