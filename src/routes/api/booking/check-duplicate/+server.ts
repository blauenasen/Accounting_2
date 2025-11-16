import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface DuplicateCheckResponse {
  ok: true;
  isDuplicate: boolean;
  count: number;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = DuplicateCheckResponse | ErrorResponse;

export async function GET({ url }: RequestEvent): Promise<Response> {
  try {
    const ue = Number(url.searchParams.get('ue'));
    const kto = Number(url.searchParams.get('kto'));
    const gegKto = Number(url.searchParams.get('gegKto'));
    const sh = url.searchParams.get('sh');
    const belNr = url.searchParams.get('belNr');

    if (!ue || !kto || !gegKto || !sh || !belNr) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_PARAMETERS' }, { status: 400 });
    }

    const result = db.prepare(`
      SELECT COUNT(*) as count
      FROM journal
      WHERE UE = ?
        AND Kto = ?
        AND GegKto = ?
        AND SH = ?
        AND BelNr = ?
        AND (GU IS NULL OR GU = '' OR GU = 0)
    `).get(ue, kto, gegKto, sh, belNr) as any;

    const isDuplicate = (result?.count || 0) > 0;

    return json<DuplicateCheckResponse>({
      ok: true,
      isDuplicate,
      count: result?.count || 0
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'CHECK_DUPLICATE_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
