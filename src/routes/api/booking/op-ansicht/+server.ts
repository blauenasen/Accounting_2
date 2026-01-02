// +server.ts
// API endpoint for OP-Ansicht (Open Items View)
// GET /api/booking/op-ansicht?year=X&month=Y&account=Z&filter=open|balanced|all

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { fetchOpAnsicht } from '$lib/server/booking/op-ansicht.js';

export async function GET({ url }: RequestEvent): Promise<Response> {
  const yearParam = url.searchParams.get('year');
  const monthParam = url.searchParams.get('month');
  const accountParam = url.searchParams.get('account');
  const filterParam = url.searchParams.get('filter');

  const result = fetchOpAnsicht({
    year: yearParam ?? undefined,
    month: monthParam ?? undefined,
    account: accountParam ?? undefined,
    filter: (filterParam as 'open' | 'balanced' | 'all') ?? 'all'
  });

  return json(result, {
    status: result.ok ? 200 : 500
  });
}
