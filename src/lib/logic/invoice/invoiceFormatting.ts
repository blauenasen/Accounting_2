// File: src/lib/logic/invoice/invoiceFormatting.ts
// Date formatting utilities for invoice module
// Copied from estimate/+page.svelte:85-118

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Convert any date format to ISO (YYYY-MM-DD)
 * Supports: ISO, DD.MM.YYYY, MM.DD.YYYY, DD/MM/YYYY, MM/DD/YYYY
 */
export function toISOAny(s: string): string {
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  let m = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (m) {
    const [, a, b, y] = m;
    const mm = Number(a) > 12 ? b : a;
    const dd = Number(a) > 12 ? a : b;
    return `${y}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }
  return '';
}

/**
 * Convert ISO date (YYYY-MM-DD) to US format (MM/DD/YYYY)
 */
export function isoToUS(iso: string): string {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const [, y, mm, dd] = m;
  return `${mm}/${dd}/${y}`;
}

/**
 * Convert US date (MM/DD/YYYY) to ISO format (YYYY-MM-DD)
 */
export function usToISO(us: string): string {
  if (!us) return '';
  const m = String(us).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return toISOAny(us);
  const [, mm, dd, y] = m;
  return `${y}-${mm}-${dd}`;
}
