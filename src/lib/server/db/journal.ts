// src/lib/server/db/journal.ts
// Journal PDF functions

import type Database from 'better-sqlite3';

/**
 * Helper: Convert value to integer (null-safe)
 */
const toInt = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10));

/**
 * Stores a PDF buffer in the journal.pdf_blob column
 * @param idNr Journal entry IdNr
 * @param pdfBuffer PDF as Buffer
 */
export function storePdfInJournal(db: Database.Database, idNr: number, pdfBuffer: Buffer): void {
  const stmt = db.prepare(`
    UPDATE journal
    SET pdf_blob = ?, pdf_generated_at = ?
    WHERE IdNr = ?
  `);
  const now = new Date().toISOString();
  stmt.run(pdfBuffer, now, toInt(idNr));
}

/**
 * Retrieves the PDF blob from a journal entry
 * @param idNr Journal entry IdNr
 * @returns PDF as Buffer or null if not found
 */
export function getJournalPdf(db: Database.Database, idNr: number): Buffer | null {
  const row = db.prepare(`
    SELECT pdf_blob FROM journal WHERE IdNr = ?
  `).get(toInt(idNr)) as { pdf_blob: Buffer | null } | undefined;
  return row?.pdf_blob || null;
}

/**
 * Checks if a journal entry has a PDF attached (either in journal.pdf_blob or via invoice)
 * @param idNr Journal entry IdNr
 * @returns True if PDF exists, false otherwise
 */
export function hasJournalPdf(db: Database.Database, idNr: number): boolean {
  const row = db.prepare(`
    SELECT
      j.pdf_blob,
      i.pdf_blob as invoice_pdf
    FROM journal j
    LEFT JOIN invoice i ON j.id_invoice = i.id_invoice
    WHERE j.IdNr = ?
  `).get(toInt(idNr)) as { pdf_blob: Buffer | null; invoice_pdf: Buffer | null } | undefined;
  return !!(row?.pdf_blob || row?.invoice_pdf);
}

/**
 * Copies PDF from invoice to journal entry
 * @param idNr Journal entry IdNr
 * @param id_invoice Invoice ID
 * @returns True if PDF was copied, false if no PDF exists in invoice
 */
export function copyPdfFromInvoiceToJournal(db: Database.Database, idNr: number, id_invoice: number): boolean {
  // Get PDF from invoice
  const invoiceRow = db.prepare(`
    SELECT pdf_blob, pdf_generated_at FROM invoice WHERE id_invoice = ?
  `).get(toInt(id_invoice)) as { pdf_blob: Buffer | null; pdf_generated_at: string | null } | undefined;

  if (!invoiceRow?.pdf_blob) {
    return false; // No PDF in invoice
  }

  // Copy to journal
  const stmt = db.prepare(`
    UPDATE journal
    SET pdf_blob = ?, pdf_generated_at = ?
    WHERE IdNr = ?
  `);
  stmt.run(invoiceRow.pdf_blob, invoiceRow.pdf_generated_at, toInt(idNr));
  return true;
}
