import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface TaxgroupsResponse {
  ok: true;
  taxgroups: (string | number)[];
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = TaxgroupsResponse | ErrorResponse;

export function GET(): Response {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT taxgroup
      FROM skr04_accounts
      WHERE taxgroup IS NOT NULL
      ORDER BY taxgroup
    `);

    const rows = stmt.all() as any[];
    const taxgroups = rows
      .map(row => row.taxgroup)
      .filter(tg => tg !== '?');

    return json<TaxgroupsResponse>({ ok: true, taxgroups });
  } catch (error) {
    return json<ErrorResponse>({ ok: false, error: 'TAXGROUPS_FETCH_FAILED' }, { status: 500 });
  }
}
