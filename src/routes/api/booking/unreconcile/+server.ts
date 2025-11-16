import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface UnreconcileRequest {
  ausziffNr: string;
}

interface UnreconcileResponse {
  ok: true;
  affected: number;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = UnreconcileResponse | ErrorResponse;

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const body: UnreconcileRequest = await request.json();
    const { ausziffNr } = body;

    if (!ausziffNr) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_AUSZIFFNR' }, { status: 400 });
    }

    const result = db.prepare(`
      UPDATE journal
      SET AusziffNr = NULL, AusziffArt = NULL
      WHERE AusziffNr = ?
    `).run(ausziffNr);

    if (result.changes === 0) {
      return json<ErrorResponse>({ ok: false, error: 'NO_ENTRIES_FOUND' }, { status: 404 });
    }

    return json<UnreconcileResponse>({ ok: true, affected: result.changes });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'UNRECONCILE_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
