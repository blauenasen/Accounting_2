// src/lib/server/booking/primanota.ts
// Data access for primanota (journal) listings filtered by year, month and optional book circle

import db from '../index.js';
import type Database from 'better-sqlite3';

const selectStatements = new Map<string, Database.Statement | null>();

// Clear cache on server restart
selectStatements.clear();

function getSelectStmt(includeBookCircle: boolean, allMonths: boolean): Database.Statement | null {
  const key = allMonths
    ? (includeBookCircle ? 'all-with-circle' : 'all-base')
    : (includeBookCircle ? 'with-circle' : 'base');
  if (!selectStatements.has(key)) {
    let sql: string;
    if (allMonths) {
      sql = includeBookCircle
        ? 'SELECT * FROM journal WHERE Jahr = ? AND BookCircle = ? ORDER BY Monat ASC, Tag ASC, LfdNr ASC'
        : 'SELECT * FROM journal WHERE Jahr = ? ORDER BY Monat ASC, Tag ASC, LfdNr ASC';
    } else {
      sql = includeBookCircle
        ? 'SELECT * FROM journal WHERE Jahr = ? AND Monat = ? AND BookCircle = ? ORDER BY Tag ASC, LfdNr ASC'
        : 'SELECT * FROM journal WHERE Jahr = ? AND Monat = ? ORDER BY Tag ASC, LfdNr ASC';
    }
    try {
      selectStatements.set(key, db.prepare(sql));
    } catch (error) {
      selectStatements.set(key, null);
      if (error instanceof Error) {
        throw new Error(`primanota.getSelectStmt failed: ${error.message}`);
      }
    }
  }
  return selectStatements.get(key) || null;
}

function cloneRow(row: unknown): Record<string, unknown> {
  if (!row || typeof row !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    const value = (row as Record<string, unknown>)[key];
    out[key] = typeof value === 'bigint' ? Number(value) : value;
  }
  return out;
}

function getAvailableYears(): number[] {
  try {
    const rows = db.prepare(`SELECT DISTINCT Jahr FROM journal ORDER BY Jahr DESC`).all() as Array<{ Jahr: number }>;
    return rows
      .map((entry) => Number(entry?.Jahr))
      .filter((value) => Number.isFinite(value));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`primanota.getAvailableYears failed: ${error.message}`);
    }
    return [];
  }
}

function getHighestMonthForYear(year: number): number | null {
  if (!Number.isFinite(year)) return null;
  try {
    const res = db.prepare(`SELECT MAX(Monat) AS month FROM journal WHERE Jahr = ?`).get(year) as { month: number } | undefined;
    const val = Number(res?.month);
    return Number.isFinite(val) ? val : null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`primanota.getHighestMonthForYear failed: ${error.message}`);
    }
    return null;
  }
}

function normalizeYear(input: unknown, fallback: number, yearsList: number[]): number {
  const numeric = Number.parseInt(String(input), 10);
  if (Number.isFinite(numeric) && yearsList.includes(numeric)) {
    return numeric;
  }
  if (yearsList.includes(fallback)) {
    return fallback;
  }
  return yearsList[0] ?? fallback;
}

function normalizeMonth(input: unknown, fallback: number): number | 'All' {
  if (input === null || input === undefined || input === '') {
    return fallback;
  }
  if (String(input).toLowerCase() === 'all') {
    return 'All';
  }
  const numeric = Number.parseInt(String(input), 10);
  if (!Number.isFinite(numeric) || numeric < 1 || numeric > 12) {
    return fallback;
  }
  return numeric;
}

function normalizeBookCircle(input: unknown): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const numeric = Number.parseInt(String(input), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export interface PrimanotaParams {
  year?: number | string;
  Year?: number | string;
  month?: number | string | 'All';
  bookCircle?: number | string;
  BookCircle?: number | string;
  buKreis?: number | string;
  BuKreis?: number | string;
}

export interface PrimanotaResult {
  ok: boolean;
  year: number;
  month: number | 'All';
  bookCircle: number | null;
  years: number[];
  rows: Record<string, unknown>[];
  error?: string;
}

export function fetchPrimanota(params: PrimanotaParams = {}): PrimanotaResult {
  const availableYears = getAvailableYears();
  const currentYear = new Date().getFullYear();
  const fallbackYear = availableYears.length
    ? (availableYears.includes(currentYear) ? currentYear : availableYears[0])
    : currentYear;
  const yearsList = availableYears.length ? availableYears : [fallbackYear];

  const requestedYear = params.year ?? params.Year;
  const resolvedYear = normalizeYear(requestedYear, fallbackYear, yearsList);

  const highestMonth = getHighestMonthForYear(resolvedYear);
  const fallbackMonth = highestMonth ?? 1;
  const resolvedMonth = normalizeMonth(params.month, fallbackMonth);

  const requestedCircle = params.bookCircle ?? params.BookCircle ?? params.buKreis ?? params.BuKreis;
  const resolvedBookCircle = normalizeBookCircle(requestedCircle);

  const includeBookCircle = Number.isFinite(resolvedBookCircle);
  const allMonths = resolvedMonth === 'All';
  const stmt = getSelectStmt(includeBookCircle, allMonths);
  const resultBookCircle = includeBookCircle ? resolvedBookCircle : null;

  if (!stmt) {
    return {
      ok: false,
      year: resolvedYear,
      month: resolvedMonth,
      bookCircle: resultBookCircle,
      years: yearsList,
      rows: [],
      error: 'JOURNAL_QUERY_UNAVAILABLE'
    };
  }

  try {
    let rawRows: unknown[];
    if (allMonths) {
      rawRows = includeBookCircle
        ? stmt.all(resolvedYear, resolvedBookCircle)
        : stmt.all(resolvedYear);
    } else {
      rawRows = includeBookCircle
        ? stmt.all(resolvedYear, resolvedMonth, resolvedBookCircle)
        : stmt.all(resolvedYear, resolvedMonth);
    }
    const rows = (rawRows as Record<string, unknown>[]).map(cloneRow);
    return {
      ok: true,
      year: resolvedYear,
      month: resolvedMonth,
      bookCircle: resultBookCircle,
      years: yearsList,
      rows
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`primanota.fetchPrimanota failed: ${error.message}`);
    }
    return {
      ok: false,
      year: resolvedYear,
      month: resolvedMonth,
      bookCircle: resultBookCircle,
      years: yearsList,
      rows: [],
      error: 'QUERY_FAILED'
    };
  }
}

export function fetchPrimanotaByMonth(month: number | string, year: number | string, bookCircle?: number | string): PrimanotaResult {
  return fetchPrimanota({ month, year, bookCircle });
}
