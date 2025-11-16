import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface TaxgroupResponse {
  ok: true;
  taxgroup: string | number;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = TaxgroupResponse | ErrorResponse;

function toOptionalInt(value: string | null): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function GET({ url }: RequestEvent): Response {
  const accountParam = url.searchParams.get('account');
  const account = toOptionalInt(accountParam);

  if (!Number.isFinite(account) || account === null || account <= 0) {
    return json<ErrorResponse>({ ok: false, error: 'INVALID_ACCOUNT' }, { status: 400 });
  }

  try {
    const stmt = db.prepare(`
      SELECT taxgroup
      FROM skr04_accounts
      WHERE account = ?
    `);

    const row = stmt.get(account) as any;

    if (!row) {
      return json<ErrorResponse>({ ok: false, error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
    }

    const taxgroup = row.taxgroup !== null && row.taxgroup !== undefined ? row.taxgroup : '?';
    return json<TaxgroupResponse>({ ok: true, taxgroup });
  } catch (error) {
    return json<ErrorResponse>({ ok: false, error: 'TAXGROUP_FETCH_FAILED' }, { status: 500 });
  }
}
