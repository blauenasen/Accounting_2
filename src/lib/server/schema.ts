// src/lib/server/schema.ts
// Schema migration and database initialization

import type Database from 'better-sqlite3';

/**
 * Schema-Selbstheilung (Self-healing schema):
 * Ensures all required columns exist in the database.
 * Adds missing columns if they don't exist (backward compatibility).
 *
 * Features:
 * 1) invoice_db.description (TEXT)
 * 2) invoice columns (invoiceNr, estimateNr, art, booked, blocked, pdf_blob, pdf_generated_at)
 * 3) estimate.blocked
 * 4) skr04_accounts.debit_credit
 * 5) email_account table + IMAP columns
 * 6) journal.id_invoice, pdf_blob, pdf_generated_at (PDF integration)
 * 7) journal.split_* (Split transactions - Feature B & C)
 * 8) journal.Ausziff* (Reconciliation - Feature D & E)
 */
export function ensureSchema(db: Database.Database): void {
  // 1) invoice_db.description
  try {
    const cols = db.prepare(`PRAGMA table_info(invoice_db)`).all() as Array<{ name: string }>;
    const hasDescription = cols.some((c) => c.name === 'description');
    if (!hasDescription) {
      db.prepare(`ALTER TABLE invoice_db ADD COLUMN description TEXT`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(invoice_db.description) failed: ${e.message}`);
    }
  }

  // 2) invoice.* columns (backward compatible)
  try {
    const colsInv = db.prepare(`PRAGMA table_info(invoice)`).all() as Array<{ name: string }>;
    const names = new Set(colsInv.map((c) => c.name));

    if (!names.has('invoiceNr')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN invoiceNr TEXT`).run();
    }
    if (!names.has('estimateNr')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN estimateNr TEXT`).run();
    }
    if (!names.has('art')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN art TEXT`).run();
    }
    if (!names.has('booked')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN booked INTEGER DEFAULT 0`).run();
    }
    if (!names.has('blocked')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN blocked INTEGER DEFAULT 0`).run();
    }
    if (!names.has('pdf_blob')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN pdf_blob BLOB`).run();
    }
    if (!names.has('pdf_generated_at')) {
      db.prepare(`ALTER TABLE invoice ADD COLUMN pdf_generated_at TEXT`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(invoice.*) failed: ${e.message}`);
    }
  }

  // 2b) estimate.blocked
  try {
    const colsEst = db.prepare(`PRAGMA table_info(estimate)`).all() as Array<{ name: string }>;
    const namesEst = new Set(colsEst.map((c) => c.name));
    if (!namesEst.has('blocked')) {
      db.prepare(`ALTER TABLE estimate ADD COLUMN blocked INTEGER DEFAULT 0`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(estimate.blocked) failed: ${e.message}`);
    }
  }

  // 2c) skr04_accounts.debit_credit (Debit/Credit validation)
  try {
    const colsSkr = db.prepare(`PRAGMA table_info(skr04_accounts)`).all() as Array<{ name: string }>;
    const namesSkr = new Set(colsSkr.map((c) => c.name));
    if (!namesSkr.has('debit_credit')) {
      db.prepare(`ALTER TABLE skr04_accounts ADD COLUMN debit_credit TEXT DEFAULT NULL`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(skr04_accounts.debit_credit) failed: ${e.message}`);
    }
  }

  // 3) email_account table (create if missing)
  try {
    const exists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='email_account'`).get();
    if (!exists) {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS email_account (
          SMTP_HOST   TEXT NOT NULL,
          SMTP_PASS   TEXT NOT NULL,
          SMTP_PORT   INTEGER NOT NULL,
          SMTP_USER   TEXT NOT NULL,
          SMTP_SECURE INTEGER NOT NULL,
          SMTP_FROM   TEXT NOT NULL,
          MAIL_BCC    TEXT NOT NULL,
          -- optional IMAP fields
          IMAP_HOST   TEXT,
          IMAP_PASS   TEXT,
          IMAP_PORT   INTEGER,
          IMAP_USER   TEXT,
          IMAP_SECURE INTEGER,
          IMAP_SENT   TEXT
        )
      `).run();
    }
    // Add missing IMAP columns to existing table
    const colsEa = db.prepare(`PRAGMA table_info(email_account)`).all() as Array<{ name: string }>;
    const namesEa = new Set(colsEa.map(c => c.name));
    if (!namesEa.has('IMAP_HOST'))   db.prepare(`ALTER TABLE email_account ADD COLUMN IMAP_HOST   TEXT`).run();
    if (!namesEa.has('IMAP_PASS'))   db.prepare(`ALTER TABLE email_account ADD COLUMN IMAP_PASS   TEXT`).run();
    if (!namesEa.has('IMAP_PORT'))   db.prepare(`ALTER TABLE email_account ADD COLUMN IMAP_PORT   INTEGER`).run();
    if (!namesEa.has('IMAP_USER'))   db.prepare(`ALTER TABLE email_account ADD COLUMN IMAP_USER   TEXT`).run();
    if (!namesEa.has('IMAP_SECURE')) db.prepare(`ALTER TABLE email_account ADD COLUMN IMAP_SECURE INTEGER`).run();
    if (!namesEa.has('IMAP_SENT'))   db.prepare(`ALTER TABLE email_account ADD COLUMN IMAP_SENT   TEXT`).run();
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(email_account) failed: ${e.message}`);
    }
  }

  // 4) journal.id_invoice (PDF-Booking Integration)
  try {
    const colsJournal = db.prepare(`PRAGMA table_info(journal)`).all() as Array<{ name: string }>;
    const namesJournal = new Set(colsJournal.map((c) => c.name));

    if (!namesJournal.has('id_invoice')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN id_invoice INTEGER`).run();
    }
    if (!namesJournal.has('pdf_blob')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN pdf_blob BLOB`).run();
    }
    if (!namesJournal.has('pdf_generated_at')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN pdf_generated_at TEXT`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(journal.*) failed: ${e.message}`);
    }
  }

  // 5) journal.split_* (Feature B & C: Split transactions)
  try {
    const colsJournal = db.prepare(`PRAGMA table_info(journal)`).all() as Array<{ name: string }>;
    const namesJournal = new Set(colsJournal.map((c) => c.name));

    if (!namesJournal.has('split_type')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN split_type VARCHAR(20)`).run();
    }
    if (!namesJournal.has('split_group_id')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN split_group_id VARCHAR(50)`).run();
    }
    if (!namesJournal.has('split_total')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN split_total DECIMAL(15,2)`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(journal.split_*) failed: ${e.message}`);
    }
  }

  // 6) journal.Ausziff* (Feature D/E: OP-Reconciliation)
  try {
    const colsJournal = db.prepare(`PRAGMA table_info(journal)`).all() as Array<{ name: string }>;
    const namesJournal = new Set(colsJournal.map((c) => c.name));

    if (!namesJournal.has('AusziffNr')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN AusziffNr VARCHAR(50)`).run();
    }
    if (!namesJournal.has('AusziffArt')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN AusziffArt CHAR(1)`).run();
    }
    if (!namesJournal.has('AusziffDatum')) {
      db.prepare(`ALTER TABLE journal ADD COLUMN AusziffDatum DATE`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureSchema(journal.Ausziff*) failed: ${e.message}`);
    }
  }

  // 7) Create performance indexes
  ensureIndexes(db);
}

/**
 * Creates performance indexes for Split and Reconciliation features.
 * Only creates indexes if they don't already exist.
 *
 * Note: Database uses German column names with capital letters:
 * - Jahr, Monat (not jahr, monat)
 * - BookCircle (not bookCircle)
 * - Kto, GegKto (not creditor_id, debtor_id)
 */
export function ensureIndexes(db: Database.Database): void {
  try {
    // Check existing indexes
    const existingIndexes = db.prepare(`SELECT name FROM sqlite_master WHERE type='index'`).all() as Array<{ name: string }>;
    const indexNames = new Set(existingIndexes.map(idx => idx.name));

    // Create indexes if they don't exist
    if (!indexNames.has('idx_split_group')) {
      db.prepare(`CREATE INDEX idx_split_group ON journal(split_group_id)`).run();
    }
    if (!indexNames.has('idx_ausziff_nr')) {
      db.prepare(`CREATE INDEX idx_ausziff_nr ON journal(AusziffNr)`).run();
    }
    if (!indexNames.has('idx_year_month')) {
      db.prepare(`CREATE INDEX idx_year_month ON journal(Jahr, Monat)`).run();
    }
    if (!indexNames.has('idx_book_circle')) {
      db.prepare(`CREATE INDEX idx_book_circle ON journal(BookCircle)`).run();
    }
    if (!indexNames.has('idx_kto_ausziff')) {
      db.prepare(`CREATE INDEX idx_kto_ausziff ON journal(Kto, AusziffNr)`).run();
    }
    if (!indexNames.has('idx_gegkto_ausziff')) {
      db.prepare(`CREATE INDEX idx_gegkto_ausziff ON journal(GegKto, AusziffNr)`).run();
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`ensureIndexes failed: ${e.message}`);
    }
  }
}
