// src/routes/api/rates/+server.ts
// API endpoint for rates (service catalog / Leistungskatalog)

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/index.js';

interface Rate {
  id_rate?: number;
  service: string;
  description?: string;
  qty?: number;
  rate?: number;
  blocked?: number;
}

/**
 * GET /api/rates
 * Returns all non-blocked rates
 */
export const GET: RequestHandler = async () => {
  try {
    const stmt = db.prepare(`
      SELECT id_rate, service, description, qty, rate
      FROM rates
      WHERE blocked = 0
      ORDER BY id_rate
    `);
    const rates = stmt.all() as Rate[];
    return json(rates);
  } catch (error) {
    console.error('GET /api/rates failed:', error);
    return json({ error: 'Failed to load rates' }, { status: 500 });
  }
};

/**
 * POST /api/rates
 * Creates a new rate
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const rate = await request.json() as Rate;

    const stmt = db.prepare(`
      INSERT INTO rates (service, description, qty, rate, blocked)
      VALUES (?, ?, ?, ?, 0)
    `);

    const result = stmt.run(
      String(rate.service || ''),
      String(rate.description || ''),
      Number(rate.qty) || 0,
      Number(rate.rate) || 0
    );

    return json({
      ok: true,
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('POST /api/rates failed:', error);
    return json({ ok: false, error: 'Failed to create rate' }, { status: 500 });
  }
};

/**
 * PUT /api/rates
 * Updates an existing rate
 */
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const rate = await request.json() as Rate;

    if (!rate.id_rate) {
      return json({ ok: false, error: 'Missing id_rate' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE rates
      SET service = ?, description = ?, qty = ?, rate = ?
      WHERE id_rate = ?
    `);

    stmt.run(
      String(rate.service || ''),
      String(rate.description || ''),
      Number(rate.qty) || 0,
      Number(rate.rate) || 0,
      Number(rate.id_rate)
    );

    return json({ ok: true });
  } catch (error) {
    console.error('PUT /api/rates failed:', error);
    return json({ ok: false, error: 'Failed to update rate' }, { status: 500 });
  }
};

/**
 * DELETE /api/rates
 * Soft deletes a rate (sets blocked=1)
 */
export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { id_rate } = await request.json();

    if (!id_rate) {
      return json({ ok: false, error: 'Missing id_rate' }, { status: 400 });
    }

    const stmt = db.prepare(`UPDATE rates SET blocked = 1 WHERE id_rate = ?`);
    stmt.run(Number(id_rate));

    return json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/rates failed:', error);
    return json({ ok: false, error: 'Failed to delete rate' }, { status: 500 });
  }
};
