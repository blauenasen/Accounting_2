// src/routes/api/invoices/+server.ts
// API endpoint for invoice list

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/index.js';

/**
 * GET /api/invoices
 * Returns all invoices ordered by id_invoice
 */
export const GET: RequestHandler = async () => {
  try {
    const stmt = db.prepare(`SELECT * FROM invoice ORDER BY id_invoice`);
    const invoices = stmt.all();
    return json(invoices);
  } catch (error) {
    console.error('GET /api/invoices failed:', error);
    return json({ error: 'Failed to load invoices' }, { status: 500 });
  }
};
