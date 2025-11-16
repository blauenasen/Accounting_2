import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getAllowedAccounts } from '$lib/server/booking/account-rules.js';

interface Account {
  account: number;
  designation: string;
  [key: string]: any;
}

interface AccountsResponse {
  ok: true;
  accounts: Account[];
  meta: {
    total: number;
    range: {
      from: number | null;
      to: number | null;
    };
  };
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type Response = AccountsResponse | ErrorResponse;

function toOptionalInt(value: string | null): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSideParam(value: string | null): 'HK' | 'CK' | null {
  if (typeof value !== 'string') {
    return null;
  }
  const upper = value.trim().toUpperCase();
  return upper === 'HK' || upper === 'CK' ? upper : null;
}

export function GET({ url }: RequestEvent): Response {
  const noParam = url.searchParams.get('no');
  const sideParam = url.searchParams.get('side');

  const bookCircle = toOptionalInt(noParam);
  const side = normalizeSideParam(sideParam);

  if (!Number.isFinite(bookCircle) || bookCircle === null || bookCircle <= 0) {
    return json<ErrorResponse>({ ok: false, error: 'INVALID_BOOK_CIRCLE' }, { status: 400 });
  }

  if (!side) {
    return json<ErrorResponse>({ ok: false, error: 'INVALID_SIDE' }, { status: 400 });
  }

  try {
    const { accounts, meta } = getAllowedAccounts({ bookCircle, side });
    return json<AccountsResponse>({
      ok: true,
      accounts,
      meta: meta ?? { total: accounts.length, range: { from: null, to: null } }
    });
  } catch (error) {
    return json<ErrorResponse>({ ok: false, error: 'ACCOUNT_RESOLUTION_FAILED' }, { status: 500 });
  }
}
