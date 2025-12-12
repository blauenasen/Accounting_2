// src/routes/api/invoices/[id]/lines/+server.ts
// API endpoint for invoice line items (positions)

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/index.js';

const toStr = (v: any): string => (v === null || v === undefined ? '' : String(v));
const toInt = (v: any): number | null => (v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10));
const toFloat = (v: any): number | null => (v === null || v === undefined || v === '' ? null : Number.parseFloat(String(v)));

interface InvoiceLine {
  id_line?: number | null;
  id_invoice: number;
  id_rate: number | null;
  description?: string;
  qty?: number;
  blocked?: number;
}

/**
 * GET /api/invoices/[id]/lines
 * Load all line items for a specific invoice
 */
export const GET: RequestHandler = async ({ params }) => {
  const id_invoice = toInt(params.id);

  if (!id_invoice) {
    return json({ error: 'Invalid invoice ID' }, { status: 400 });
  }

  try {
    const stmt = db.prepare(`
      SELECT
        d.id_line,
        d.id_invoice,
        d.id_rate,
        r.service,
        COALESCE(d.description, r.description) AS description,
        (SELECT tax FROM stammdaten LIMIT 1) AS tax,
        d.qty,
        r.rate,
        ROUND(COALESCE(d.qty, 0) * COALESCE(r.rate, 0), 2) AS amount,
        d.blocked
      FROM invoice_db d
      LEFT JOIN rates r ON d.id_rate = r.id_rate
      WHERE d.id_invoice = ?
      ORDER BY d.id_line
    `);

    const lines = stmt.all(id_invoice);
    return json(lines);
  } catch (error) {
    console.error('GET /api/invoices/[id]/lines failed:', error);
    return json({ error: 'Failed to load invoice lines' }, { status: 500 });
  }
};

/**
 * PUT /api/invoices/[id]/lines
 * Replace all line items for a specific invoice (transaction-based)
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  const id_invoice = toInt(params.id);

  if (!id_invoice) {
    return json({ error: 'Invalid invoice ID' }, { status: 400 });
  }

  try {
    const { lines } = await request.json() as { lines: InvoiceLine[] };

    if (!Array.isArray(lines)) {
      return json({ error: 'Invalid lines format' }, { status: 400 });
    }

    const results: Array<{ id_line: number | bigint; action: 'inserted' | 'updated' | 'deleted' }> = [];

    // Use transaction for atomic save
    const insertStmt = db.prepare(`
      INSERT INTO invoice_db (id_invoice, id_rate, description, qty, blocked)
      VALUES (?, ?, ?, ?, ?)
    `);

    const updateStmt = db.prepare(`
      UPDATE invoice_db
      SET id_rate = ?, description = ?, qty = ?, blocked = ?
      WHERE id_line = ?
    `);

    const deleteStmt = db.prepare(`DELETE FROM invoice_db WHERE id_line = ?`);

    // Track which lines are being kept/updated
    const processedIds = new Set<number>();

    // Transaction
    const transaction = db.transaction((linesToSave: InvoiceLine[]) => {
      for (const line of linesToSave) {
        const id_line = toInt(line.id_line);

        if (id_line) {
          // Update existing line
          updateStmt.run(
            toInt(line.id_rate),
            toStr(line.description ?? ''),
            toFloat(line.qty) ?? 0,
            toInt(line.blocked) ?? 0,
            id_line
          );
          results.push({ id_line, action: 'updated' });
          processedIds.add(id_line);
        } else {
          // Insert new line
          const res = insertStmt.run(
            id_invoice,
            toInt(line.id_rate),
            toStr(line.description ?? ''),
            toFloat(line.qty) ?? 0,
            toInt(line.blocked) ?? 0
          );
          results.push({ id_line: res.lastInsertRowid, action: 'inserted' });
        }
      }

      // Delete lines that were not included in the update (replace mode)
      const existingLines = db.prepare(`SELECT id_line FROM invoice_db WHERE id_invoice = ?`).all(id_invoice) as Array<{ id_line: number }>;

      for (const existing of existingLines) {
        if (!processedIds.has(existing.id_line)) {
          deleteStmt.run(existing.id_line);
          results.push({ id_line: existing.id_line, action: 'deleted' });
        }
      }
    });

    transaction(lines);

    return json({ ok: true, results });
  } catch (error) {
    console.error('PUT /api/invoices/[id]/lines failed:', error);
    return json({ error: 'Failed to save invoice lines' }, { status: 500 });
  }
};
