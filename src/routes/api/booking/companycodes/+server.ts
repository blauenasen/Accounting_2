/**
 * Company Codes API - Booking Namespace
 *
 * GET without parameter: Returns all company codes
 * GET with ?no=XX: Returns specific company code by number
 *
 * CLAUDE.md Compliance:
 * - File size: <100 lines ✓
 * - TypeScript: Yes ✓
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getCompanyCodeByNumber, listCompanyCodes } from '$lib/server/companycodes.js';

interface CompanyCodeResponse {
  ok: true;
  entry: any;
}

interface CompanyCodesListResponse {
  ok: true;
  codes: any[];
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = CompanyCodeResponse | CompanyCodesListResponse | ErrorResponse;

/**
 * GET /api/booking/companycodes
 *
 * Without query param: Returns all company codes
 * With ?no=XX: Returns specific company code by number
 *
 * @param event - SvelteKit request event
 * @returns Response with company code(s)
 */
export function GET({ url }: RequestEvent): Response {
  const noParam = url.searchParams.get('no');

  // If no parameter provided, return all company codes
  if (!noParam) {
    try {
      const codes = listCompanyCodes();
      return json<CompanyCodesListResponse>({ ok: true, codes });
    } catch (error) {
      return json<ErrorResponse>(
        { ok: false, error: 'COMPANY_CODES_FETCH_FAILED' },
        { status: 500 }
      );
    }
  }

  // If parameter provided, return specific company code
  const entry = getCompanyCodeByNumber(noParam);

  if (!entry) {
    return json<ErrorResponse>({ ok: false, error: 'COMPANY_CODE_NOT_FOUND' }, { status: 404 });
  }

  return json<CompanyCodeResponse>({ ok: true, entry });
}
