import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getCompanyCodeByNumber } from '$lib/server/companycodes.js';

interface CompanyCodeResponse {
  ok: true;
  entry: any;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = CompanyCodeResponse | ErrorResponse;

export function GET({ url }: RequestEvent): Response {
  const noParam = url.searchParams.get('no');
  const entry = getCompanyCodeByNumber(noParam);

  if (!entry) {
    return json<ErrorResponse>({ ok: false, error: 'COMPANY_CODE_NOT_FOUND' }, { status: 404 });
  }

  return json<CompanyCodeResponse>({ ok: true, entry });
}
