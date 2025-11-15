// src/lib/logic/primanota/sorting.ts
// Sorting logic for Primanota table

import { toNumberComparable, type FilterColumn } from './filtering.js';

/**
 * Sort state structure
 */
export interface SortState {
  key: string;
  direction: 'asc' | 'desc' | null;
}

/**
 * Sortable row wrapper
 */
interface EnrichedRow<T> {
  row: T;
  index: number;
}

/**
 * Parsed date components
 */
interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Compares two values for sorting
 * @param a First value
 * @param b Second value
 * @param type Column type ('text', 'number', 'date')
 * @returns Comparison result
 */
export function compareForSort(a: unknown, b: unknown, type: string | undefined): number {
  const isANullish = a === null || a === undefined || Number.isNaN(a);
  const isBNullish = b === null || b === undefined || Number.isNaN(b);

  if (isANullish && isBNullish) {
    return 0;
  }
  if (isANullish) {
    return 1;
  }
  if (isBNullish) {
    return -1;
  }

  if (type === 'text') {
    return String(a ?? '').localeCompare(String(b ?? ''), 'de-DE', { sensitivity: 'base' });
  }

  return (Number(a) ?? 0) - (Number(b) ?? 0);
}

/**
 * Parses date string in DD.MM.YYYY or YYYY-MM-DD format
 * @param dateStr Date string
 * @returns Parsed date object with year, month, day
 */
function parseDate(dateStr: string): ParsedDate {
  if (!dateStr) return { year: 0, month: 0, day: 0 };

  const dotMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const day = Number(dotMatch[1]) || 0;
    const month = Number(dotMatch[2]) || 0;
    const year = Number(dotMatch[3]) || 0;
    return { year, month, day };
  }

  const dashMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashMatch) {
    const year = Number(dashMatch[1]) || 0;
    const month = Number(dashMatch[2]) || 0;
    const day = Number(dashMatch[3]) || 0;
    return { year, month, day };
  }

  return { year: 0, month: 0, day: 0 };
}

/**
 * Sorts rows based on sort state
 * @param rowsToSort Array of rows to sort
 * @param sortState Sort state object with key, direction
 * @param columns Column definitions
 * @param getComparableValue Function to get comparable value for a column
 * @returns Sorted rows
 */
export function sortRows<T extends Record<string, unknown>>(
  rowsToSort: T[],
  sortState: SortState,
  columns: FilterColumn[],
  getComparableValue: (value: unknown, column: FilterColumn) => unknown
): T[] {
  const column = columns.find((col) => col.key === sortState.key);
  if (!column || !sortState.direction) {
    return rowsToSort;
  }

  const factor = sortState.direction === 'asc' ? 1 : -1;
  const enriched: EnrichedRow<T>[] = rowsToSort.map((row, index) => ({ row, index }));

  enriched.sort((a, b) => {
    if (column.key === 'Datum') {
      const aDatum = String(a.row?.Datum ?? a.row?.datum ?? '');
      const bDatum = String(b.row?.Datum ?? b.row?.datum ?? '');

      const aDate = parseDate(aDatum);
      const bDate = parseDate(bDatum);

      if (aDate.year !== bDate.year) {
        return (aDate.year - bDate.year) * factor;
      }
      if (aDate.month !== bDate.month) {
        return (aDate.month - bDate.month) * factor;
      }
      if (aDate.day !== bDate.day) {
        return (aDate.day - bDate.day) * factor;
      }
      return a.index - b.index;
    }

    if (column.format === 'money' || column.key === 'UE' || column.key === 'SumSoll' || column.key === 'SumHaben' || column.key === 'Balance') {
      const aNum = toNumberComparable(a.row?.[column.key]);
      const bNum = toNumberComparable(b.row?.[column.key]);
      if (!Number.isFinite(aNum) && !Number.isFinite(bNum)) return a.index - b.index;
      if (!Number.isFinite(aNum)) return 1 * factor;
      if (!Number.isFinite(bNum)) return -1 * factor;
      const comparison = aNum! - bNum!;
      if (comparison !== 0) {
        return comparison * factor;
      }
      return a.index - b.index;
    }

    if (column.key === 'LfdNr') {
      const aNum = Number(a.row?.LfdNr ?? a.row?.lfdnr ?? 0);
      const bNum = Number(b.row?.LfdNr ?? b.row?.lfdnr ?? 0);
      const comparison = aNum - bNum;
      if (comparison !== 0) {
        return comparison * factor;
      }
      return a.index - b.index;
    }

    if (column.key === 'Kto' || column.key === 'GegKto' || column.key === 'ContraAccDynamic') {
      const aNum = Number(a.row?.[column.key] ?? 0);
      const bNum = Number(b.row?.[column.key] ?? 0);
      const comparison = aNum - bNum;
      if (comparison !== 0) {
        return comparison * factor;
      }
      return a.index - b.index;
    }

    const aValue = getComparableValue(a.row?.[column.key], column);
    const bValue = getComparableValue(b.row?.[column.key], column);
    const comparison = compareForSort(aValue, bValue, column.type);
    if (comparison !== 0) {
      return comparison * factor;
    }
    return a.index - b.index;
  });

  return enriched.map((entry) => entry.row);
}
