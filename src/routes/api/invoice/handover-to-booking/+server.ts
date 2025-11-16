/**
 * POST /api/invoice/handover-to-booking
 * Generates PDF and converts invoice to journal entry
 */

import { json, type RequestEvent } from '@sveltejs/kit';
import { generateInvoicePdfBuffer } from '$lib/server/pdf-generator.js';
import { storePdfInInvoice, getInvoicePdf, getInvoiceHeaderById } from '$lib/server/index.js';
import { convertInvoiceToJournal, type JournalEntry } from '$lib/server/invoice-to-journal.js';
import { db } from '$lib/server/index.js';

interface HandoverRequest {
  id_invoice?: unknown;
}

/**
 * POST handler for preparing invoice for handover to booking
 */
export async function POST(event: RequestEvent): Promise<Response> {
  try {
    const body = (await event.request.json()) as HandoverRequest;
    const { id_invoice } = body;

    // Validate id_invoice parameter
    if (!id_invoice || typeof id_invoice !== 'number') {
      return json({
        ok: false,
        error: 'INVALID_PARAMETER'
      }, { status: 400 });
    }

    // Check if PDF already exists (from Send & Commit)
    let pdfBuffer = getInvoicePdf(id_invoice);

    // Only generate if not already present
    if (!pdfBuffer) {
      pdfBuffer = await generateInvoicePdfBuffer(id_invoice, event.url.origin);
      storePdfInInvoice(id_invoice, pdfBuffer);
    }

    // Convert invoice to journal entry with booking rules applied
    const journalEntry = await convertInvoiceToJournal(id_invoice);

    // Get debtor account for GegKto (counter account)
    const invoice = db.prepare('SELECT account FROM invoice WHERE id_invoice = ?').get(id_invoice) as
      | { account?: string | number | null }
      | undefined;
    const gegKto = invoice?.account || '';

    // Build URL for booking page with pre-filled data
    const params = new URLSearchParams({
      Jahr: String(journalEntry.Jahr),
      Monat: String(journalEntry.Monat),
      Tag: String(journalEntry.Tag),
      LfdNr: String(journalEntry.LfdNr || ''),
      BuKreis: String(journalEntry.BookCircle || 20),
      Konto: journalEntry.Kto ? String(journalEntry.Kto) : '',
      GegKto: gegKto ? String(gegKto) : '',
      Brutto: String(journalEntry.Brutto),
      NettoGes: String(journalEntry.NettoGes),
      Steuer: String(journalEntry.Steuer),
      VStUSt: String(journalEntry.VStUSt),
      SH: journalEntry.SH,
      GU: journalEntry.GU || 'S',
      BelNr: journalEntry.BelNr,
      Buchungstext: journalEntry.Buchungstext,
      Datum: journalEntry.Datum,
      id_invoice: String(id_invoice)
    });

    const bookingUrl = `/booking?${params.toString()}`;

    return json({
      ok: true,
      journalEntry,
      bookingUrl,
      message: 'PDF generated and invoice prepared for accounting'
    });
  } catch (error) {
    let errorMessage = 'INTERNAL_ERROR';

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        errorMessage = 'NOT_FOUND';
      }
    }

    return json({
      ok: false,
      error: errorMessage
    }, { status: 500 });
  }
}
