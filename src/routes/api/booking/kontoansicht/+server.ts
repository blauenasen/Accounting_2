// +server.ts
// API endpoint for Kontoansicht (Account View)
// GET /api/booking/kontoansicht?year=X&month=Y&account=Z

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { fetchKontoansicht } from '$lib/server/booking/kontoansicht.js';

export async function GET({ url }: RequestEvent): Promise<Response> {
  const yearParam = url.searchParams.get('year');
  const monthParam = url.searchParams.get('month');
  const accountParam = url.searchParams.get('account');

  const result = fetchKontoansicht({
    year: yearParam ?? undefined,
    month: monthParam ?? undefined,
    account: accountParam ?? undefined
  });

  return json(result, {
    status: result.ok ? 200 : 500
  });
}
