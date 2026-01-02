// kontoansicht.ts
// Server-side filtering for Kontoansicht (Account View)
// Filters by account at database level (NO BookCircle filter!)
// CLAUDE.md compliant: ≤500 lines

import db from '../index.js';
import type Database from 'better-sqlite3';

export interface KontoansichtParams {
  year?: number | string;
  month?: number | string | 'All';
  account?: number | string;
}

export interface KontoansichtResult {
  ok: boolean;
  rows: Record<string, unknown>[];
  year?: number;
  month?: number | 'All';
  years?: number[];
  error?: string;
}

/**
 * Fetches journal entries for Kontoansicht
 * Filters by account (Kto OR GegKto) at database level
 * CRITICAL: NO BookCircle filtering!
 */
export function fetchKontoansicht(params: KontoansichtParams = {}): KontoansichtResult {
  try {
    // Parse and validate parameters
    const currentYear = new Date().getFullYear();
    let year: number;
    let month: number | 'All';

    // Year handling
    if (params.year === undefined) {
      // Default: Use highest available year
      const yearStmt = db.prepare('SELECT DISTINCT Jahr FROM journal ORDER BY Jahr DESC LIMIT 1');
      const yearRow = yearStmt.get() as { Jahr?: number } | undefined;
      year = yearRow?.Jahr ?? currentYear;
    } else {
      year = typeof params.year === 'number' ? params.year : parseInt(String(params.year));
      if (!Number.isFinite(year)) {
        return {
          ok: false,
          rows: [],
          error: 'INVALID_YEAR'
        };
      }
    }

    // Month handling
    if (params.month === undefined) {
      // Default: Use highest available month in year
      const monthStmt = db.prepare(
        'SELECT DISTINCT Monat FROM journal WHERE Jahr = ? ORDER BY Monat DESC LIMIT 1'
      );
      const monthRow = monthStmt.get(year) as { Monat?: number } | undefined;
      month = monthRow?.Monat ?? 1;
    } else if (params.month === 'All' || String(params.month).toLowerCase() === 'all') {
      month = 'All';
    } else {
      const parsedMonth = parseInt(String(params.month));
      if (Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
        month = parsedMonth;
      } else {
        return {
          ok: false,
          rows: [],
          error: 'INVALID_MONTH'
        };
      }
    }

    // Account parsing (optional)
    const account = params.account ? parseInt(String(params.account)) : null;

    // Build SQL query
    let sql: string;
    let queryParams: any[];

    if (account !== null && Number.isFinite(account)) {
      // Filter by account at database level
      if (month === 'All') {
        sql = `SELECT * FROM journal
               WHERE Jahr = ?
               AND (Kto = ? OR GegKto = ?)
               ORDER BY Monat ASC, Tag ASC, LfdNr ASC`;
        queryParams = [year, account, account];
      } else {
        sql = `SELECT * FROM journal
               WHERE Jahr = ? AND Monat = ?
               AND (Kto = ? OR GegKto = ?)
               ORDER BY Tag ASC, LfdNr ASC`;
        queryParams = [year, month, account, account];
      }
    } else {
      // No account filter - load all entries for year/month
      if (month === 'All') {
        sql = `SELECT * FROM journal
               WHERE Jahr = ?
               ORDER BY Monat ASC, Tag ASC, LfdNr ASC`;
        queryParams = [year];
      } else {
        sql = `SELECT * FROM journal
               WHERE Jahr = ? AND Monat = ?
               ORDER BY Tag ASC, LfdNr ASC`;
        queryParams = [year, month];
      }
    }

    // Execute query
    const stmt = db.prepare(sql);
    const rows = stmt.all(...queryParams) as Record<string, unknown>[];

    // Get available years
    const yearsStmt = db.prepare('SELECT DISTINCT Jahr FROM journal ORDER BY Jahr ASC');
    const yearsRows = yearsStmt.all() as { Jahr: number }[];
    const years = yearsRows.map(r => r.Jahr);

    return {
      ok: true,
      rows,
      year,
      month,
      years
    };
  } catch (error) {
    console.error('fetchKontoansicht error:', error);
    return {
      ok: false,
      rows: [],
      error: error instanceof Error ? error.message : 'QUERY_FAILED'
    };
  }
}
