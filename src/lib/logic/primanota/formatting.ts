// src/lib/logic/primanota/formatting.ts
// Formatting logic for Primanota table display values

/**
 * Column configuration for formatting
 */
export interface ColumnConfig {
  format?: 'money' | 'date' | 'percent' | string;
  [key: string]: unknown;
}

/**
 * Formats money value
 * @param value Raw money value
 * @returns Formatted money string
 */
export function formatMoney(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value).replace(/\s+/g, '').replace(/,/g, '');
  const num = Number(str);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formats date value
 * @param value Raw date value
 * @returns Formatted date string
 */
export function formatDate(value: unknown): string {
  if (!value && value !== 0) return '';
  const trimmed = String(value).trim();

  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    return mm + ' / ' + dd + ' / ' + yyyy;
  }

  const dashMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dashMatch) {
    const [, yyyy, mm, dd] = dashMatch;
    return mm + ' / ' + dd + ' / ' + yyyy;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return toDateString(parsed);
  }

  return trimmed;
}

/**
 * Converts date to string format
 * @param date Date object
 * @returns Date string in MM / DD / YYYY format
 */
export function toDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm} / ${dd} / ${yyyy}`;
}

/**
 * Formats percent value
 * @param value Raw percent value
 * @returns Formatted percent string
 */
export function formatPercent(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value).replace('%', '').trim();
  const num = Number(str);
  if (!Number.isFinite(num)) return String(value);
  const pct = num <= 1 ? num * 100 : num;
  return pct.toFixed(2) + '%';
}

/**
 * Formats column value based on column format
 * @param raw Raw value
 * @param column Column configuration
 * @returns Formatted value
 */
export function formatColumnValue(raw: unknown, column: ColumnConfig): string {
  switch (column.format) {
    case 'money':
      return formatMoney(raw);
    case 'date':
      return formatDate(raw);
    case 'percent':
      return formatPercent(raw);
    default:
      return raw != null ? String(raw) : '';
  }
}
