// src/routes/api/invoices/[id]/+server.ts
// API endpoint for single invoice operations

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/index.js';

const toStr = (v: any): string => (v === null || v === undefined ? '' : String(v));
const toInt = (v: any): number | null => (v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10));
const toOptStr = (v: any): string | null => (v === null || v === undefined || v === '' ? null : String(v));

interface Invoice {
  id_invoice?: number;
  year: number;
  num: number;
  date: string;
  account: number;
  art?: string;
  booked?: number;
  invoiceNr?: string;
  estimateNr?: string;
  blocked?: number;
}

/**
 * GET /api/invoices/[id]
 * Load a single invoice header by ID
 */
export const GET: RequestHandler = async ({ params }) => {
  const id_invoice = toInt(params.id);

  if (!id_invoice) {
    return json({ error: 'Invalid invoice ID' }, { status: 400 });
  }

  try {
    const stmt = db.prepare(`
      SELECT id_invoice, account, art, year, num, date, booked, invoiceNr, estimateNr, blocked
      FROM invoice
      WHERE id_invoice = ?
      LIMIT 1
    `);

    const invoice = stmt.get(id_invoice);

    if (!invoice) {
      return json({ error: 'Invoice not found' }, { status: 404 });
    }

    return json(invoice);
  } catch (error) {
    console.error('GET /api/invoices/[id] failed:', error);
    return json({ error: 'Failed to load invoice' }, { status: 500 });
  }
};

/**
 * PUT /api/invoices/[id]
 * Update an existing invoice header
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  const id_invoice = toInt(params.id);

  if (!id_invoice) {
    return json({ error: 'Invalid invoice ID' }, { status: 400 });
  }

  try {
    const invoice = await request.json() as Invoice;

    const stmt = db.prepare(`
      UPDATE invoice
      SET year = ?, num = ?, date = ?, account = ?,
          invoiceNr = COALESCE(?, invoiceNr),
          estimateNr = COALESCE(?, estimateNr)
      WHERE id_invoice = ?
    `);

    stmt.run(
      toInt(invoice.year),
      toInt(invoice.num),
      toStr(invoice.date),
      toInt(invoice.account),
      toOptStr(invoice.invoiceNr),
      toOptStr(invoice.estimateNr),
      id_invoice
    );

    return json({ ok: true });
  } catch (error) {
    console.error('PUT /api/invoices/[id] failed:', error);
    return json({ error: 'Failed to update invoice' }, { status: 500 });
  }
};

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice and all its lines (cascade)
 */
export const DELETE: RequestHandler = async ({ params }) => {
  const id_invoice = toInt(params.id);

  if (!id_invoice) {
    return json({ error: 'Invalid invoice ID' }, { status: 400 });
  }

  try {
    // Use transaction for atomic delete
    const transaction = db.transaction((id: number) => {
      const deleteLinesStmt = db.prepare(`DELETE FROM invoice_db WHERE id_invoice = ?`);
      const deleteHeaderStmt = db.prepare(`DELETE FROM invoice WHERE id_invoice = ?`);

      deleteLinesStmt.run(id);
      const result = deleteHeaderStmt.run(id);

      return { changes: result.changes ?? 0 };
    });

    const result = transaction(id_invoice);

    return json({ ok: true, ...result });
  } catch (error) {
    console.error('DELETE /api/invoices/[id] failed:', error);
    return json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
};
