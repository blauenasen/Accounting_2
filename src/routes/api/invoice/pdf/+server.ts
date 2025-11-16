/**
 * GET /api/invoice/pdf
 * Retrieves stored PDF for an invoice
 */

import type { RequestEvent } from '@sveltejs/kit';
import { getInvoicePdf, getInvoiceHeaderById } from '$lib/server/index.js';

/**
 * GET handler for retrieving invoice PDF
 */
export async function GET(event: RequestEvent): Promise<Response> {
  try {
    const id_invoice = parseInt(event.url.searchParams.get('id_invoice') || '0');

    // Validate id_invoice parameter
    if (!id_invoice || id_invoice <= 0) {
      return new Response('INVALID_PARAMETER', {
        status: 400,
        headers: { 'content-type': 'text/plain' }
      });
    }

    // Get PDF blob from database
    const pdfBlob = getInvoicePdf(id_invoice);

    if (!pdfBlob) {
      return new Response('NOT_FOUND', {
        status: 404,
        headers: { 'content-type': 'text/plain' }
      });
    }

    // Get invoice header for filename
    const header = getInvoiceHeaderById(id_invoice) as Record<string, unknown> | null;
    const invoiceNr = header ? `I-${header.year}-${header.num}` : `invoice-${id_invoice}`;
    const filename = `${invoiceNr}.pdf`;

    // Return PDF
    return new Response(pdfBlob, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `inline; filename="${filename}"`,
        'cache-control': 'private, max-age=3600'
      }
    });
  } catch (error) {
    return new Response('INTERNAL_ERROR', {
      status: 500,
      headers: { 'content-type': 'text/plain' }
    });
  }
}
