import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface DeletePdfResponse {
  ok: true;
  message: string;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = DeletePdfResponse | ErrorResponse;

export async function DELETE({ url }: RequestEvent): Promise<Response> {
  try {
    const idNr = url.searchParams.get('idNr');

    if (!idNr) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_IDNR' }, { status: 400 });
    }

    const idNrInt = parseInt(idNr, 10);

    const journalEntry = db.prepare(`
      SELECT IdNr, pdf_blob FROM journal WHERE IdNr = ?
    `).get(idNrInt) as any;

    if (!journalEntry) {
      return json<ErrorResponse>({ ok: false, error: 'JOURNAL_ENTRY_NOT_FOUND' }, { status: 404 });
    }

    if (!journalEntry.pdf_blob) {
      return json<ErrorResponse>({ ok: false, error: 'NO_PDF_FOUND' }, { status: 404 });
    }

    db.prepare(`
      UPDATE journal
      SET pdf_blob = NULL, pdf_generated_at = NULL
      WHERE IdNr = ?
    `).run(idNrInt);

    return json<DeletePdfResponse>({
      ok: true,
      message: 'PDF_DELETED'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'DELETE_PDF_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
