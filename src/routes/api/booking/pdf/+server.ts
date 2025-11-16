import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getJournalPdf, getInvoicePdf } from '$lib/server/index.js';
import { db } from '$lib/server/index.js';

interface ErrorResponse {
  ok: false;
  error: string;
}

export async function GET({ url }: RequestEvent): Promise<Response> {
  try {
    const idNr = url.searchParams.get('idNr');

    if (!idNr) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_IDNR' }, { status: 400 });
    }

    const idNrInt = parseInt(idNr, 10);

    let pdfBuffer = getJournalPdf(idNrInt);
    let source = 'journal';

    if (!pdfBuffer) {
      const journalEntry = db.prepare(`
        SELECT id_invoice FROM journal WHERE IdNr = ?
      `).get(idNrInt) as any;

      if (journalEntry?.id_invoice) {
        pdfBuffer = getInvoicePdf(journalEntry.id_invoice);
        source = 'invoice';
      }
    }

    if (!pdfBuffer) {
      return json<ErrorResponse>({ ok: false, error: 'PDF_NOT_FOUND' }, { status: 404 });
    }

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="booking-${idNr}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-PDF-Source': source
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'PDF_DOWNLOAD_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
