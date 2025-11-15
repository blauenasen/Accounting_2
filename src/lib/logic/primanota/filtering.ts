// src/lib/logic/primanota/filtering.ts
// Filtering logic for Primanota table

const MODE_CONTAINS = 'contains';

/**
 * Column configuration for filtering
 */
export interface FilterColumn {
  key: string;
  type?: 'text' | 'number' | 'date';
  format?: 'money' | 'date' | 'percent' | string;
  [key: string]: unknown;
}

/**
 * Filter state structure
 */
export interface FilterState {
  mode?: string;
  inputValue?: string;
  comparableValue?: unknown;
}

/**
 * Filter value option structure
 */
export interface FilterOption {
  key: string;
  label: string;
  comparable: unknown;
}

/**
 * Data row for filtering
 */
export interface FilterableRow {
  GU?: string | null;
  gu?: string | null;
  BookCircle?: number;
  bookCircle?: number;
  BuKreis?: number;
  bukreis?: number;
  BUKREIS?: number;
  [key: string]: unknown;
}

/**
 * Normalizes text value for comparison (lowercase, trimmed)
 * @param value Raw value to normalize
 * @returns Normalized text
 */
export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim().toLocaleLowerCase('de-DE');
}

/**
 * Converts value to comparable number
 * @param value Raw value
 * @returns Numeric value or null
 */
export function toNumberComparable(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  let str = String(value).trim();
  if (!str) {
    return null;
  }
  str = str.replace(/\s+/g, '').replace(/%/g, '');
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  if (hasComma && hasDot) {
    str = str.replace(/\./g, '').replace(/,/g, '.');
  } else if (hasComma) {
    str = str.replace(/,/g, '.');
  }
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

/**
 * Converts value to comparable date (timestamp)
 * @param value Raw date value
 * @returns Date timestamp or null
 */
export function toDateComparable(value: unknown): number | null {
  if (!value && value !== 0) {
    return null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
    return date.getTime();
  }
  const str = String(value).trim();
  if (!str) {
    return null;
  }

  const dotMatch = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, mm, dd, yyyy] = slashMatch;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  const dashMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dashMatch) {
    const [, yyyy, mm, dd] = dashMatch;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const normalized = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return normalized.getTime();
}

/**
 * Gets comparable value based on column type
 * @param rawValue Raw value
 * @param column Column configuration
 * @returns Comparable value
 */
export function getComparableValue(rawValue: unknown, column: FilterColumn): unknown {
  if (column.format === 'money' || column.key === 'UE' || column.key === 'SumSoll' || column.key === 'SumHaben' || column.key === 'Balance') {
    return toNumberComparable(rawValue);
  }

  if (column.key === 'Datum' && column.format === 'date') {
    return toDateComparable(rawValue);
  }

  if (column.type === 'text') {
    return normalizeText(rawValue);
  }
  if (column.type === 'number') {
    return toNumberComparable(rawValue);
  }
  if (column.type === 'date') {
    return toDateComparable(rawValue);
  }
  return rawValue;
}

/**
 * Checks if row matches a single filter
 * @param row Data row
 * @param column Column configuration
 * @param filter Filter state
 * @param formatDate Date formatting function
 * @param formatMoney Money formatting function
 * @returns True if matches
 */
export function matchesFilter(
  row: FilterableRow,
  column: FilterColumn,
  filter: FilterState | undefined,
  formatDate: (value: unknown) => string,
  formatMoney: (value: unknown) => string
): boolean {
  if (!filter || !filter.mode) {
    return true;
  }

  const mode = filter.mode;

  if (column.key === 'Datum' && column.format === 'date') {
    if (mode === MODE_CONTAINS) {
      const target = normalizeText(filter.inputValue);
      if (!target) {
        return true;
      }
      const formatted = formatDate(row?.[column.key]);
      const source = normalizeText(formatted);
      return source.includes(target);
    }
    const target = filter.comparableValue as number | null;
    if (target === null || Number.isNaN(target)) {
      return true;
    }
    const source = toDateComparable(row?.[column.key]);
    if (source === null) {
      return false;
    }
    if (mode === '=') return source === target;
    if (mode === '>') return source > target;
    if (mode === '<') return source < target;
    return true;
  }

  if (column.format === 'money' || column.key === 'UE' || column.key === 'SumSoll' || column.key === 'SumHaben' || column.key === 'Balance') {
    if (mode === MODE_CONTAINS) {
      const target = normalizeText(filter.inputValue);
      if (!target) {
        return true;
      }
      const formatted = formatMoney(row?.[column.key]);
      const source = normalizeText(formatted);
      return source.includes(target);
    }
    const target = filter.comparableValue as number;
    if (!Number.isFinite(target)) {
      return true;
    }
    const source = toNumberComparable(row?.[column.key]);
    if (!Number.isFinite(source)) {
      return false;
    }
    if (mode === '=') return source === target;
    if (mode === '>') return source! > target;
    if (mode === '<') return source! < target;
    return true;
  }

  if (column.type === 'text') {
    const target = filter.comparableValue as string;
    if (!target) {
      return true;
    }
    const source = normalizeText(row?.[column.key]);
    if (mode === '=') {
      return source === target;
    }
    if (mode === MODE_CONTAINS) {
      return source.includes(target);
    }
    return true;
  }

  if (column.type === 'number') {
    const target = filter.comparableValue as number;
    if (!Number.isFinite(target)) {
      return true;
    }
    const source = toNumberComparable(row?.[column.key]);
    if (!Number.isFinite(source)) {
      return false;
    }
    if (mode === '=') return source === target;
    if (mode === '>') return source! > target;
    if (mode === '<') return source! < target;
    return true;
  }

  if (column.type === 'date') {
    const target = filter.comparableValue as number | null;
    if (target === null || Number.isNaN(target)) {
      return true;
    }
    const source = toDateComparable(row?.[column.key]);
    if (source === null) {
      return false;
    }

    if (mode === '=') return source === target;
    if (mode === '>') return source > target;
    if (mode === '<') return source < target;
    return true;
  }

  return true;
}

/**
 * Filters rows based on filter state
 * @param sourceRows Array of data rows
 * @param state Filter state object
 * @param active Whether filters are active
 * @param columns Column definitions
 * @param skipColumnKey Column to skip (optional)
 * @param formatDate Date formatting function
 * @param formatMoney Money formatting function
 * @returns Filtered rows
 */
export function filterRows<T extends FilterableRow>(
  sourceRows: T[],
  state: Record<string, FilterState>,
  active: boolean,
  columns: FilterColumn[],
  skipColumnKey: string | null,
  formatDate: (value: unknown) => string,
  formatMoney: (value: unknown) => string
): T[] {
  if (!active) {
    return sourceRows;
  }

  return sourceRows.filter((row) => {
    for (const column of columns) {
      if (skipColumnKey && column.key === skipColumnKey) {
        continue;
      }
      if (!matchesFilter(row, column, state[column.key], formatDate, formatMoney)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Applies circle filter to rows
 * @param rows Array of data rows
 * @param circle Circle number to filter by
 * @returns Filtered rows
 */
export function applyCircleFilter<T extends FilterableRow>(rows: T[], circle: number): T[] {
  if (!Number.isFinite(circle) || circle <= 0) {
    return rows;
  }
  return rows.filter((row) => {
    const rowCircle = Number.parseInt(
      String(row?.BookCircle ?? row?.bookCircle ?? row?.BuKreis ?? row?.bukreis ?? row?.BUKREIS ?? 0),
      10
    );
    return rowCircle === circle;
  });
}

/**
 * Applies cancelled (storno) filter to rows
 * @param rows Array of data rows
 * @param hide Whether to hide cancelled bookings
 * @returns Filtered rows
 */
export function applyCancelledFilter<T extends FilterableRow>(rows: T[], hide: boolean): T[] {
  if (!hide) {
    return rows;
  }
  return rows.filter((row) => {
    const gu = String(row?.GU || row?.gu || '').trim();
    return gu === '';
  });
}

/**
 * Computes comparable value from raw input based on column type
 * @param column Column configuration
 * @param rawValue Raw input value
 * @returns Comparable value
 */
export function computeComparableFromRaw(column: FilterColumn, rawValue: unknown): unknown {
  if (!rawValue && rawValue !== 0) {
    return column.type === 'text' ? '' : null;
  }

  if (column.format === 'money' || column.key === 'UE' || column.key === 'SumSoll' || column.key === 'SumHaben' || column.key === 'Balance') {
    return toNumberComparable(rawValue);
  }

  if (column.key === 'Datum' && column.format === 'date') {
    return toDateComparable(rawValue);
  }

  if (column.type === 'text') {
    return normalizeText(rawValue);
  }

  if (column.type === 'number') {
    return toNumberComparable(rawValue);
  }

  if (column.type === 'date') {
    return toDateComparable(rawValue);
  }

  return rawValue;
}

/**
 * Derives value options for filter dropdowns
 * @param sourceRows Array of data rows
 * @param state Filter state
 * @param active Whether filters are active
 * @param columns Column definitions
 * @param formatColumnValue Function to format column values
 * @param filterRowsFn Filter function to use (with formatters bound)
 * @returns Map of column keys to option arrays
 */
export function deriveValueOptions(
  sourceRows: FilterableRow[],
  state: Record<string, FilterState>,
  active: boolean,
  columns: FilterColumn[],
  formatColumnValue: (value: unknown, column: FilterColumn) => string,
  filterRowsFn?: (rows: FilterableRow[], state: Record<string, FilterState>, active: boolean, skipKey: string) => FilterableRow[]
): Record<string, FilterOption[]> {
  const options: Record<string, FilterOption[]> = {};
  for (const column of columns) {
    let subset: FilterableRow[];
    if (filterRowsFn) {
      subset = filterRowsFn(sourceRows, state, active, column.key);
    } else {
      subset = sourceRows;
    }

    const seen = new Set<string>();
    const entries: FilterOption[] = [];
    for (const row of subset) {
      const rawValue = row?.[column.key];
      const comparable = getComparableValue(rawValue, column);
      if (column.type !== 'text' && !Number.isFinite(comparable)) {
        if (comparable === null) {
          continue;
        }
      }
      const key = buildOptionKey(column, comparable);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      entries.push({
        key,
        label: formatColumnValue(rawValue, column),
        comparable
      });
    }

    entries.sort((a, b) => {
      if (column.type === 'text') {
        return String(a.label ?? '').localeCompare(String(b.label ?? ''), 'de-DE', { sensitivity: 'base' });
      }
      const aValue = Number.isFinite(a.comparable) ? (a.comparable as number) : Number.POSITIVE_INFINITY;
      const bValue = Number.isFinite(b.comparable) ? (b.comparable as number) : Number.POSITIVE_INFINITY;
      return aValue - bValue;
    });

    options[column.key] = entries;
  }
  return options;
}

/**
 * Builds option key for filter value
 * @param column Column configuration
 * @param comparable Comparable value
 * @returns Option key
 */
export function buildOptionKey(column: FilterColumn, comparable: unknown): string {
  if (column.type === 'text') {
    return 'text|' + encodeURIComponent(String(comparable ?? ''));
  }
  if (column.type === 'number') {
    return 'number|' + (Number.isFinite(comparable) ? comparable : '');
  }
  if (column.type === 'date') {
    return 'date|' + (Number.isFinite(comparable) ? comparable : '');
  }
  return 'text|' + encodeURIComponent(String(comparable ?? ''));
}

/**
 * Parses option key to get comparable value
 * @param column Column configuration
 * @param key Option key
 * @returns Comparable value
 */
export function parseOptionKey(column: FilterColumn, key: string): unknown {
  if (!key) {
    return column.type === 'text' ? '' : null;
  }
  const parts = key.split('|');
  if (parts.length !== 2) {
    return column.type === 'text' ? '' : null;
  }
  const [type, encoded] = parts;
  if (type !== column.type) {
    return column.type === 'text' ? '' : null;
  }
  if (column.type === 'text') {
    return decodeURIComponent(encoded ?? '').trim().toLocaleLowerCase('de-DE');
  }
  const numeric = Number(encoded);
  return Number.isFinite(numeric) ? numeric : null;
}
