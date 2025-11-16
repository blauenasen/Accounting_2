import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { storePdfInJournal, getJournalPdf, getInvoicePdf } from '$lib/server/index.js';
import { db } from '$lib/server/index.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface SuccessResponse {
  ok: true;
  message: string;
}

interface ConfirmationResponse {
  ok: false;
  requiresConfirmation: true;
  message: string;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = SuccessResponse | ConfirmationResponse | ErrorResponse;

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const formData = await request.formData();
    const idNr = formData.get('idNr');
    const pdfFile = formData.get('pdf');
    const force = formData.get('force') === 'true';

    if (!idNr) {
      return json<ErrorResponse>({ ok: false, error: 'IDNR_REQUIRED' }, { status: 400 });
    }

    if (!pdfFile || !(pdfFile instanceof File)) {
      return json<ErrorResponse>({ ok: false, error: 'PDF_FILE_REQUIRED' }, { status: 400 });
    }

    if (pdfFile.type !== 'application/pdf') {
      return json<ErrorResponse>({ ok: false, error: 'INVALID_FILE_TYPE' }, { status: 400 });
    }

    if (pdfFile.size > MAX_FILE_SIZE) {
      return json<ErrorResponse>({ ok: false, error: 'FILE_TOO_LARGE' }, { status: 400 });
    }

    const journalEntry = db.prepare(`
      SELECT IdNr, id_invoice FROM journal WHERE IdNr = ?
    `).get(parseInt(String(idNr), 10)) as any;

    if (!journalEntry) {
      return json<ErrorResponse>({ ok: false, error: 'JOURNAL_ENTRY_NOT_FOUND' }, { status: 404 });
    }

    const existingJournalPdf = getJournalPdf(parseInt(String(idNr), 10));
    const existingInvoicePdf = journalEntry.id_invoice
      ? getInvoicePdf(journalEntry.id_invoice)
      : null;

    if ((existingJournalPdf || existingInvoicePdf) && !force) {
      return json<ConfirmationResponse>({
        ok: false,
        requiresConfirmation: true,
        message: 'PDF_ALREADY_EXISTS'
      });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    storePdfInJournal(parseInt(String(idNr), 10), pdfBuffer);

    return json<SuccessResponse>({
      ok: true,
      message: 'PDF_UPLOADED_SUCCESSFULLY'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'INTERNAL_ERROR';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
