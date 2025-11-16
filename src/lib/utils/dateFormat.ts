// src/lib/utils/dateFormat.ts
// Date format conversion utilities (DE ↔ US formats)

/**
 * Converts YYYY-MM-DD to MM / DD / YYYY for display
 * @param isoDate Date in YYYY-MM-DD format
 * @returns Date in MM / DD / YYYY format
 */
export function formatDateForDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) return '';

  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${mm} / ${dd} / ${yyyy}`;
  }

  return String(isoDate);
}

/**
 * Converts MM / DD / YYYY to YYYY-MM-DD for storage
 * @param displayDate Date in MM / DD / YYYY format
 * @returns Date in YYYY-MM-DD format
 */
export function formatDateForStorage(displayDate: string | null | undefined): string {
  if (!displayDate) return '';

  const slashMatch = String(displayDate).trim().match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);
  if (slashMatch) {
    const [, mm, dd, yyyy] = slashMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  const compactMatch = String(displayDate).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (compactMatch) {
    const [, mm, dd, yyyy] = compactMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  if (String(displayDate).match(/^\d{4}-\d{2}-\d{2}$/)) {
    return String(displayDate);
  }

  return String(displayDate);
}

/**
 * Converts DD.MM.YYYY (German format) to YYYY-MM-DD for storage
 * @param germanDate Date in DD.MM.YYYY format
 * @returns Date in YYYY-MM-DD format
 */
export function formatGermanDateForStorage(germanDate: string | null | undefined): string {
  if (!germanDate) return '';

  const dotMatch = String(germanDate).trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  return String(germanDate);
}

/**
 * Converts YYYY-MM-DD to DD.MM.YYYY (German format) for display
 * @param isoDate Date in YYYY-MM-DD format
 * @returns Date in DD.MM.YYYY format
 */
export function formatDateForGermanDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) return '';

  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${dd}.${mm}.${yyyy}`;
  }

  return String(isoDate);
}

/**
 * Validates if a date string is valid
 * @param dateStr Date string to validate
 * @returns True if valid
 */
export function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;

  const isoDate = formatDateForStorage(dateStr);
  const date = new Date(isoDate);
  return !isNaN(date.getTime());
}

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns Today's date
 */
export function getTodayISO(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Gets today's date in MM / DD / YYYY format
 * @returns Today's date for display
 */
export function getTodayDisplay(): string {
  return formatDateForDisplay(getTodayISO());
}

/**
 * Gets today's date in DD.MM.YYYY format
 * @returns Today's date in German format
 */
export function getTodayGerman(): string {
  return formatDateForGermanDisplay(getTodayISO());
}

/**
 * Parses any date format and returns YYYY-MM-DD
 * Supports: YYYY-MM-DD, MM/DD/YYYY, DD.MM.YYYY
 * @param dateStr Date string in any supported format
 * @returns Date in YYYY-MM-DD format or empty string
 */
export function parseToISO(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  if (String(dateStr).match(/^\d{4}-\d{2}-\d{2}$/)) {
    return String(dateStr);
  }

  const germanMatch = String(dateStr).trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (germanMatch) {
    const [, dd, mm, yyyy] = germanMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  const usMatch = String(dateStr).trim().match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);
  if (usMatch) {
    const [, mm, dd, yyyy] = usMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}
