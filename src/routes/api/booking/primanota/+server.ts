import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { fetchPrimanota } from '$lib/server/booking/primanota.js';

export async function GET({ url }: RequestEvent): Promise<Response> {
  const yearParam = url.searchParams.get('year');
  const monthParam = url.searchParams.get('month');
  const bookCircleParam = url.searchParams.get('bookCircle');

  const result = fetchPrimanota({
    year: yearParam,
    month: monthParam,
    bookCircle: bookCircleParam
  });

  return json(result, {
    status: result.ok ? 200 : 500
  });
}
