import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCompanyCodes } from '$lib/server/companycodes';

/**
 * GET /api/booking/bookcircle
 * Returns list of available book circles (company codes)
 *
 * @returns {CompanyCode[]} Array of book circles with idcode, no, textcode, account, available
 */
export const GET: RequestHandler = () => {
  try {
    // Get all company codes and filter for available ones
    const bookCircles = listCompanyCodes().filter(cc => cc.available);
    return json(bookCircles);
  } catch (error) {
    console.error('Failed to fetch book circles:', error);
    return json(
      { error: 'BOOK_CIRCLE_FETCH_FAILED' },
      { status: 500 }
    );
  }
};
