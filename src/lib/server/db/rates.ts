// src/lib/server/db/rates.ts
// Rates (Leistungskatalog / Service Catalog) functions

import type Database from 'better-sqlite3';

/**
 * Service rate entry
 */
export interface Rate {
  id_rate: number;
  service: string;
  description: string;
  qty: number;
  rate: number;
  blocked?: number;
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
 * Helper: Convert value to float (null-safe)
 */
const toFloat = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.parseFloat(String(v)));

/**
 * Get all active rates
 * @returns Array of rates (blocked rates excluded)
 */
export function getAllRates(db: Database.Database): Rate[] {
  const stmt = db.prepare(`
    SELECT id_rate, service, description, qty, rate
    FROM rates
    WHERE blocked = 0
    ORDER BY id_rate
  `);
  return stmt.all() as Rate[];
}

/**
 * Insert new rate
 * @param rate Rate data to insert
 * @returns ID of inserted rate
 */
export function insertRate(db: Database.Database, rate: Partial<Rate>): number {
  const stmt = db.prepare(`
    INSERT INTO rates (service, description, qty, rate, blocked)
    VALUES (?, ?, ?, ?, 0)
  `);
  const res = stmt.run(
    toStr(rate.service),
    toStr(rate.description ?? ''),
    toFloat(rate.qty) ?? 0,
    toFloat(rate.rate) ?? 0
  );
  return Number(res.lastInsertRowid);
}

/**
 * Update existing rate
 * @param rate Rate data with id_rate
 */
export function updateRate(db: Database.Database, rate: Partial<Rate> & { id_rate: number }): Database.RunResult {
  const stmt = db.prepare(`
    UPDATE rates
    SET service = ?, description = ?, qty = ?, rate = ?
    WHERE id_rate = ?
  `);
  return stmt.run(
    toStr(rate.service),
    toStr(rate.description ?? ''),
    toFloat(rate.qty) ?? 0,
    toFloat(rate.rate) ?? 0,
    toInt(rate.id_rate)
  );
}

/**
 * Delete rate (soft delete by setting blocked = 1)
 * @param id_rate ID of rate to delete
 */
export function deleteRate(db: Database.Database, id_rate: number): Database.RunResult {
  const stmt = db.prepare(`UPDATE rates SET blocked = 1 WHERE id_rate = ?`);
  return stmt.run(toInt(id_rate));
}
