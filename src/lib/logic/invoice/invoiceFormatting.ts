// src/lib/logic/invoice/invoiceFormatting.ts
// Invoice formatting utilities

/**
 * Convert any date format to ISO (YYYY-MM-DD)
 * @param dateStr - Date string in various formats
 * @returns ISO date string or empty string
 */
export function toISODate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const str = String(dateStr).trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Handle DD.MM.YYYY or YYYY.MM.DD formats
  const normalized = str
    .replace(/^(\d{2})\.(\d{2})\.(\d{4})$/, '$1/$2/$3')
    .replace(/^(\d{4})\.(\d{2})\.(\d{2})$/, '$1-$2-$3');

  // MM/DD/YYYY format
  let match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  // YYYY/MM/DD format
  match = normalized.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  // Try parsing with Date object
  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}

/**
 * Convert ISO date to US format (MM/DD/YYYY)
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns US format date string
 */
export function isoToUS(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, yyyy, mm, dd] = match;
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Convert US date to ISO format
 * @param usDate - US date string (MM/DD/YYYY)
 * @returns ISO date string
 */
export function usToISO(usDate: string | null | undefined): string {
  if (!usDate) return '';
  const match = String(usDate).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return toISODate(usDate);
  const [, mm, dd, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Get today's date in ISO format
 * @returns Today's date (YYYY-MM-DD)
 */
export function todayISO(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Format invoice number with leading zeros
 * @param num - Invoice number
 * @param minDigits - Minimum number of digits (default: 4)
 * @returns Formatted invoice number
 */
export function formatInvoiceNumber(num: number | string, minDigits: number = 4): string {
  const numStr = String(num || 0);
  return numStr.padStart(minDigits, '0');
}

/**
 * Generate full invoice identifier
 * @param year - Invoice year
 * @param num - Invoice number
 * @returns Full invoice identifier (e.g., "2025-0001")
 */
export function generateInvoiceIdentifier(year: string | number, num: string | number): string {
  const yearStr = String(year || new Date().getFullYear());
  const numFormatted = formatInvoiceNumber(num);
  return `${yearStr}-${numFormatted}`;
}

/**
 * Format debtor name with salutation
 * @param salutation - Salutation (e.g., "Mr.", "Ms.")
 * @param name - Debtor name
 * @returns Formatted full name
 */
export function formatDebtorName(salutation: string | undefined, name: string | undefined): string {
  const sal = salutation?.trim() || '';
  const nm = name?.trim() || '';
  return [sal, nm].filter(Boolean).join(' ');
}

/**
 * Parse numeric value from string
 * @param value - String value
 * @returns Parsed number or 0
 */
export function parseNumeric(value: string | number | null | undefined): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return !Number.isNaN(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Format percentage
 * @param value - Percentage value (e.g., 5 for 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Normalize line breaks in text
 * @param text - Input text
 * @returns Text with normalized line breaks
 */
export function normalizeLineBreaks(text: string | null | undefined): string {
  if (!text) return '';
  return String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Truncate text to maximum length
 * @param text - Input text
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}
