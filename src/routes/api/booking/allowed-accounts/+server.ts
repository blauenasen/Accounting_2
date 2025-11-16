import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getAllowedAccounts } from '$lib/server/booking/account-rules.js';

interface Account {
  account: number;
  designation: string;
  [key: string]: any;
}

interface Meta {
  total: number;
  range: {
    from: number | null;
    to: number | null;
  };
}

interface AllowedAccountsResponse {
  ok: true;
  accounts: Account[];
  meta: Meta;
}

interface ErrorResponse {
  ok: false;
  error: string;
  accounts: Account[];
  meta: Meta;
}

type ApiResponse = AllowedAccountsResponse | ErrorResponse;

export async function GET({ url }: RequestEvent): Promise<Response> {
  try {
    const bookCircleParam = url.searchParams.get('bookCircle');
    const sideParam = url.searchParams.get('side');

    const bookCircle = bookCircleParam ? Number.parseInt(bookCircleParam, 10) : null;
    const side = sideParam ? String(sideParam).trim().toUpperCase() : null;

    if (!Number.isFinite(bookCircle) || bookCircle === null || bookCircle <= 0) {
      return json<ErrorResponse>({
        ok: false,
        error: 'INVALID_BOOK_CIRCLE',
        accounts: [],
        meta: { total: 0, range: { from: null, to: null } }
      }, { status: 400 });
    }

    if (!side || (side !== 'HK' && side !== 'CK')) {
      return json<ErrorResponse>({
        ok: false,
        error: 'INVALID_SIDE',
        accounts: [],
        meta: { total: 0, range: { from: null, to: null } }
      }, { status: 400 });
    }

    const result = getAllowedAccounts({ bookCircle, side: side as 'HK' | 'CK' });

    return json<AllowedAccountsResponse>({
      ok: true,
      accounts: result.accounts || [],
      meta: result.meta || { total: 0, range: { from: null, to: null } }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'INTERNAL_ERROR';
    return json<ErrorResponse>({
      ok: false,
      error: errorMessage,
      accounts: [],
      meta: { total: 0, range: { from: null, to: null } }
    }, { status: 500 });
  }
}
