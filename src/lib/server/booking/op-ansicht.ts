// op-ansicht.ts
// Server-side filtering for OP-Ansicht (Open Items View)
// Filters by account AND OP status at database level (NO BookCircle filter!)
// CLAUDE.md compliant: ≤500 lines

import db from '../index.js';
import type Database from 'better-sqlite3';

export interface OpAnsichtParams {
  year?: number | string;
  month?: number | string | 'All';
  account?: number | string;
  filter?: 'open' | 'balanced' | 'all';
}

export interface OpAnsichtResult {
  ok: boolean;
  rows: Record<string, unknown>[];
  year?: number;
  month?: number | 'All';
  years?: number[];
  error?: string;
}

/**
 * Fetches journal entries for OP-Ansicht
 * Filters by:
 * - Account (debtor/creditor: 10000-99999)
 * - OP status (open/balanced/all)
 * CRITICAL: NO BookCircle filtering!
 */
export function fetchOpAnsicht(params: OpAnsichtParams = {}): OpAnsichtResult {
  try {
    // Parse and validate parameters
    const currentYear = new Date().getFullYear();
    let year: number;
    let month: number | 'All';

    // Year handling
    if (params.year === undefined) {
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

    // OP-Ansicht: Only show debtors/creditors (10000-99999)
    if (account !== null && (account < 10000 || account > 99999)) {
      return {
        ok: false,
        rows: [],
        error: 'INVALID_OP_ACCOUNT'
      };
    }

    // Filter parsing
    const filter = params.filter || 'all';
    if (!['open', 'balanced', 'all'].includes(filter)) {
      return {
        ok: false,
        rows: [],
        error: 'INVALID_FILTER'
      };
    }

    // Build OP filter condition
    let opCondition = '';
    if (filter === 'open') {
      opCondition = ' AND (AusziffNr IS NULL OR AusziffNr = 0)';
    } else if (filter === 'balanced') {
      opCondition = ' AND AusziffNr IS NOT NULL AND AusziffNr > 0';
    }

    // Build SQL query
    let sql: string;
    let queryParams: any[];

    if (account !== null && Number.isFinite(account)) {
      // Filter by specific debtor/creditor account
      if (month === 'All') {
        sql = `SELECT * FROM journal
               WHERE Jahr = ?
               AND (Kto = ? OR GegKto = ?)
               AND ((Kto >= 10000 AND Kto <= 99999) OR (GegKto >= 10000 AND GegKto <= 99999))
               ${opCondition}
               ORDER BY Monat ASC, Tag ASC, LfdNr ASC`;
        queryParams = [year, account, account];
      } else {
        sql = `SELECT * FROM journal
               WHERE Jahr = ? AND Monat = ?
               AND (Kto = ? OR GegKto = ?)
               AND ((Kto >= 10000 AND Kto <= 99999) OR (GegKto >= 10000 AND GegKto <= 99999))
               ${opCondition}
               ORDER BY Tag ASC, LfdNr ASC`;
        queryParams = [year, month, account, account];
      }
    } else {
      // No account selected - load all OP entries (debtors/creditors)
      if (month === 'All') {
        sql = `SELECT * FROM journal
               WHERE Jahr = ?
               AND ((Kto >= 10000 AND Kto <= 99999) OR (GegKto >= 10000 AND GegKto <= 99999))
               ${opCondition}
               ORDER BY Monat ASC, Tag ASC, LfdNr ASC`;
        queryParams = [year];
      } else {
        sql = `SELECT * FROM journal
               WHERE Jahr = ? AND Monat = ?
               AND ((Kto >= 10000 AND Kto <= 99999) OR (GegKto >= 10000 AND GegKto <= 99999))
               ${opCondition}
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
    console.error('fetchOpAnsicht error:', error);
    return {
      ok: false,
      rows: [],
      error: error instanceof Error ? error.message : 'QUERY_FAILED'
    };
  }
}
