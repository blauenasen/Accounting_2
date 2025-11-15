// src/lib/server/db/debtors.ts
// Debtors (Debitoren) functions

import type Database from 'better-sqlite3';

/**
 * Debtor (Debitor) entry
 */
export interface Debtor {
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
 * Get active debtors (blocked = 0)
 * @returns Array of active debtors
 */
export function getDebtors(db: Database.Database): Debtor[] {
  const stmt = db.prepare(`
    SELECT account, salutation, name, adress1, adress2, adress3, email,
           name1, OPBereich, OPArt, info, blocked
    FROM debtors
    WHERE blocked = 0
    ORDER BY account
  `);
  return stmt.all() as Debtor[];
}

/**
 * Get all debtors (including blocked)
 * @returns Array of all debtors
 */
export function getAllDebtors(db: Database.Database): Debtor[] {
  const stmt = db.prepare(`
    SELECT account, salutation, name, adress1, adress2, adress3, email,
           name1, OPBereich, OPArt, info, blocked
    FROM debtors
    ORDER BY account
  `);
  return stmt.all() as Debtor[];
}

/**
 * Insert new debtor
 * @param d Debtor data to insert
 * @returns ID of inserted debtor
 */
export function insertDebtor(db: Database.Database, d: Partial<Debtor>): number {
  const stmt = db.prepare(`
    INSERT INTO debtors
      (account, salutation, name, adress1, adress2, adress3, email,
       name1, category, OPBereich, OPArt, filterNo, info, blocked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    toStr(d.info),
    toInt(d.blocked) ?? 0
  );
  return Number(res.lastInsertRowid);
}

/**
 * Update existing debtor
 * @param d Debtor data with account number (use original_account if account number changes)
 */
export function updateDebtor(db: Database.Database, d: Partial<Debtor> & { account: number }): Database.RunResult {
  const accWhere = d.original_account ?? d.account;
  const stmt = db.prepare(`
    UPDATE debtors
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
 * Delete debtor (soft delete by setting blocked = 1)
 * @param account Account number to delete
 */
export function deleteDebtor(db: Database.Database, account: number): Database.RunResult {
  const stmt = db.prepare(`UPDATE debtors SET blocked = 1 WHERE account = ?`);
  return stmt.run(toInt(account));
}
