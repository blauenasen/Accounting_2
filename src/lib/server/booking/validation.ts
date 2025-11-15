// src/lib/server/booking/validation.ts
// Provides helpers to validate booking payloads against account rules

import { assertAccountAllowed } from './account-rules.js';

/**
 * Booking payload structure (partial)
 */
export interface BookingPayload {
  BookCircle?: number | string;
  bookCircle?: number | string;
  no?: number | string;
  companyCode?: number | string;
  account?: number | string | null;
  contra?: number | string | null;
}

/**
 * Convert value to optional integer (null-safe)
 */
function toOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Validate booking accounts against account rules
 * @param payload Booking payload with account and contra
 * @throws Error if book circle is missing or accounts are not allowed
 * @returns true if validation passes
 */
export function validateBookingAccounts(payload: BookingPayload = {}): boolean {
  const bookCircle = toOptionalInt(payload.BookCircle ?? payload.bookCircle ?? payload.no ?? payload.companyCode);

  if (!Number.isFinite(bookCircle) || bookCircle! <= 0) {
    throw new Error('BOOK_CIRCLE_REQUIRED');
  }

  if (payload.account !== null && payload.account !== undefined && payload.account !== '') {
    assertAccountAllowed({
      bookCircle: bookCircle!,
      side: 'HK',
      account: payload.account,
      field: 'account'
    });
  }

  if (payload.contra !== null && payload.contra !== undefined && payload.contra !== '') {
    assertAccountAllowed({
      bookCircle: bookCircle!,
      side: 'CK',
      account: payload.contra,
      field: 'contra'
    });
  }

  return true;
}
