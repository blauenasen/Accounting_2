import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server/index.js';

interface DeleteResponse {
  ok: true;
  message: string;
  deletedIdNr: number;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = DeleteResponse | ErrorResponse;

export async function DELETE({ url }: RequestEvent): Promise<Response> {
  try {
    const idNr = url.searchParams.get('idNr');

    if (!idNr) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_IDNR' }, { status: 400 });
    }

    const db = getDb();

    const entry = db.prepare(`
      SELECT
        IdNr,
        Gesperrt,
        GU,
        pdf_blob,
        id_invoice
      FROM journal
      WHERE IdNr = ?
    `).get(idNr) as any;

    if (!entry) {
      return json<ErrorResponse>({ ok: false, error: 'BOOKING_NOT_FOUND' }, { status: 404 });
    }

    if (entry.Gesperrt === 1) {
      return json<ErrorResponse>({ ok: false, error: 'ENTRY_LOCKED' }, { status: 403 });
    }

    if (entry.GU && entry.GU.trim() !== '') {
      return json<ErrorResponse>({ ok: false, error: 'STORNO_BOOKING_CANNOT_DELETE' }, { status: 403 });
    }

    if (entry.pdf_blob !== null) {
      return json<ErrorResponse>({ ok: false, error: 'ENTRY_HAS_PDF' }, { status: 403 });
    }

    if (entry.id_invoice !== null) {
      return json<ErrorResponse>({ ok: false, error: 'ENTRY_LINKED_TO_INVOICE' }, { status: 403 });
    }

    const deleteStmt = db.prepare('DELETE FROM journal WHERE IdNr = ?');
    const result = deleteStmt.run(idNr);

    if (result.changes === 0) {
      return json<ErrorResponse>({ ok: false, error: 'DELETE_FAILED' }, { status: 500 });
    }

    return json<DeleteResponse>({
      ok: true,
      message: 'BOOKING_DELETED',
      deletedIdNr: parseInt(idNr, 10)
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'DELETE_BOOKING_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
