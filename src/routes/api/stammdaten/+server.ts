// src/routes/api/stammdaten/+server.ts
// API endpoint for master data (company information)

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/index.js';

interface Stammdaten {
  firma?: string;
  adress1?: string;
  adress2?: string;
  email?: string;
  tax?: string;
  registration?: string;
  bcc?: string;
}

/**
 * GET /api/stammdaten
 * Returns company master data from stammdaten table + email BCC
 */
export const GET: RequestHandler = async () => {
  try {
    // Get company data from stammdaten table
    const stammdatenStmt = db.prepare(`
      SELECT firma, adress1, adress2, email, tax, registration
      FROM stammdaten
      LIMIT 1
    `);
    const base = stammdatenStmt.get() as Stammdaten || {};

    // Get BCC from email_account table
    const emailStmt = db.prepare(`SELECT MAIL_BCC AS bcc FROM email_account LIMIT 1`);
    const mail = emailStmt.get() as { bcc?: string } || {};

    // Combine both
    const result: Stammdaten = {
      ...base,
      bcc: mail.bcc ?? ''
    };

    return json(result);
  } catch (error) {
    console.error('GET /api/stammdaten failed:', error);
    return json({ error: 'Failed to load master data' }, { status: 500 });
  }
};
