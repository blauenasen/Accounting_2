// src/lib/server/db/invoices.ts
// Invoice and Invoice Lines functions

import type Database from 'better-sqlite3';

export interface Invoice {
  id_invoice: number;
  year: number;
  num: number;
  date: string;
  account: number;
  art?: string;
  booked?: number;
  invoiceNr?: string;
  estimateNr?: string;
  blocked?: number;
  pdf_blob?: Buffer;
  pdf_generated_at?: string;
}

export interface InvoiceLine {
  id_line: number;
  id_invoice: number;
  id_rate: number;
  service?: string;
  description: string;
  tax?: number;
  qty: number;
  rate?: number;
  amount?: number;
  blocked?: number;
  _delete?: boolean;
}

const toStr = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const toInt = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10));
const toFloat = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.parseFloat(String(v)));
const toOptStr = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : String(v));

let _db: Database.Database;

export function init(dbInstance: Database.Database): void {
  _db = dbInstance;
}

export function getAllInvoices(db: Database.Database): Invoice[] {
  const stmt = db.prepare(`SELECT * FROM invoice ORDER BY id_invoice`);
  return stmt.all() as Invoice[];
}

export function insertInvoice(db: Database.Database, inv: Partial<Invoice> & { year: number; num: number; date: string; account: number; invoiceNr: string }): number {
  const stmt = db.prepare(`
    INSERT INTO invoice (year, num, date, account, art, booked, invoiceNr, estimateNr, blocked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const res = stmt.run(
    toInt(inv.year),
    toInt(inv.num),
    toStr(inv.date),
    toInt(inv.account),
    toStr(inv.art ?? ''),
    toInt(inv.booked ?? 0),
    toStr(inv.invoiceNr),
    toStr(inv.estimateNr ?? ''),
    toInt(inv.blocked ?? 0)
  );
  return Number(res.lastInsertRowid);
}

export function insertInvoiceAuto(db: Database.Database, inv: { year: number; date: string; account: number; estimateNr?: string }): { id_invoice: number; year: number; num: number; invoiceNr: string } {
  const trx = _db.transaction((v: typeof inv) => {
    const row = _db.prepare(`SELECT COALESCE(MAX(num), 0) + 1 AS nextnum FROM invoice`).get() as { nextnum: number };
    const num = Number(row?.nextnum ?? 1);
    const invoiceNr = `I-${toInt(v.year)}-${num}`;
    const res = _db.prepare(`
      INSERT INTO invoice (year, num, date, account, art, booked, invoiceNr, estimateNr, blocked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(toInt(v.year), num, toStr(v.date), toInt(v.account), 'p', 0, invoiceNr, toStr(v.estimateNr ?? ''), 0);
    return { id_invoice: Number(res.lastInsertRowid), year: toInt(v.year)!, num, invoiceNr };
  });
  return trx(inv);
}

export function updateInvoice(db: Database.Database, inv: Partial<Invoice> & { id_invoice: number }): Database.RunResult {
  const stmt = db.prepare(`
    UPDATE invoice
    SET year = ?, num = ?, date = ?, account = ?,
        invoiceNr = COALESCE(?, invoiceNr),
        estimateNr = COALESCE(?, estimateNr)
    WHERE id_invoice = ?
  `);
  return stmt.run(toInt(inv.year), toInt(inv.num), toStr(inv.date), toInt(inv.account), toOptStr(inv.invoiceNr), toOptStr(inv.estimateNr), toInt(inv.id_invoice));
}

export function updateInvoiceHeaderDateAccount(db: Database.Database, p: { id_invoice: number; date?: string; account?: number; invoiceNr?: string; estimateNr?: string }): Database.RunResult {
  const { id_invoice, date, account, invoiceNr, estimateNr } = p || {};
  const stmt = db.prepare(`
    UPDATE invoice
    SET date = COALESCE(?, date),
        account = COALESCE(?, account),
        invoiceNr = COALESCE(?, invoiceNr),
        estimateNr = COALESCE(?, estimateNr)
    WHERE id_invoice = ?
  `);
  return stmt.run(toOptStr(date), toInt(account), toOptStr(invoiceNr), toOptStr(estimateNr), toInt(id_invoice));
}

export function getInvoiceLines(db: Database.Database, id_invoice: number): InvoiceLine[] {
  const stmt = db.prepare(`
    SELECT
      d.id_line, d.id_invoice, d.id_rate, r.service,
      COALESCE(d.description, r.description) AS description,
      (SELECT tax FROM stammdaten LIMIT 1) AS tax,
      d.qty, r.rate,
      ROUND(COALESCE(d.qty,0) * COALESCE(r.rate,0), 2) AS amount,
      d.blocked
    FROM invoice_db d
    LEFT JOIN rates r ON d.id_rate = r.id_rate
    WHERE d.id_invoice = ?
    ORDER BY d.id_line
  `);
  return stmt.all(toInt(id_invoice)) as InvoiceLine[];
}

export function insertInvoiceLine(db: Database.Database, line: Partial<InvoiceLine> & { id_invoice: number; id_rate: number }): number {
  const stmt = db.prepare(`INSERT INTO invoice_db (id_invoice, id_rate, description, qty, blocked) VALUES (?, ?, ?, ?, ?)`);
  const res = stmt.run(toInt(line.id_invoice), toInt(line.id_rate), toStr(line.description ?? ''), toFloat(line.qty) ?? 0, toInt(line.blocked) ?? 0);
  return Number(res.lastInsertRowid);
}

export function updateInvoiceLine(db: Database.Database, line: Partial<InvoiceLine> & { id_line: number }): Database.RunResult {
  const stmt = db.prepare(`UPDATE invoice_db SET id_rate = ?, description = ?, qty = ?, blocked = ? WHERE id_line = ?`);
  return stmt.run(toInt(line.id_rate), toStr(line.description ?? ''), toFloat(line.qty) ?? 0, toInt(line.blocked) ?? 0, toInt(line.id_line));
}

export function deleteInvoiceLine(db: Database.Database, id_line: number): Database.RunResult {
  const stmt = db.prepare(`DELETE FROM invoice_db WHERE id_line = ?`);
  return stmt.run(toInt(id_line));
}

export function deleteInvoiceLines(db: Database.Database, ids: number[]): { changes: number } {
  const del = db.prepare(`DELETE FROM invoice_db WHERE id_line = ?`);
  const trx = _db.transaction((arr: number[]) => {
    for (const id of arr) del.run(toInt(id));
  });
  trx(ids);
  return { changes: ids.length };
}

export function saveInvoiceLines(db: Database.Database, lines: Partial<InvoiceLine>[]): Array<{ id_line: number; action: 'inserted' | 'updated' | 'deleted' }> {
  const results: Array<{ id_line: number; action: 'inserted' | 'updated' | 'deleted' }> = [];
  const insert = _db.prepare(`INSERT INTO invoice_db (id_invoice, id_rate, description, qty, blocked) VALUES (?, ?, ?, ?, ?)`);
  const update = _db.prepare(`UPDATE invoice_db SET id_rate = ?, description = ?, qty = ?, blocked = ? WHERE id_line = ?`);
  const del = _db.prepare(`DELETE FROM invoice_db WHERE id_line = ?`);
  const trx = _db.transaction((rows: Partial<InvoiceLine>[]) => {
    for (const raw of rows) {
      const id_line = toInt(raw.id_line);
      const wantDelete = !!raw._delete;
      if (wantDelete && id_line) {
        del.run(id_line);
        results.push({ id_line, action: 'deleted' });
        continue;
      }
      if (!id_line) {
        const res = insert.run(toInt(raw.id_invoice), toInt(raw.id_rate), toStr(raw.description ?? ''), toFloat(raw.qty) ?? 0, toInt(raw.blocked) ?? 0);
        results.push({ id_line: Number(res.lastInsertRowid), action: 'inserted' });
      } else {
        update.run(toInt(raw.id_rate), toStr(raw.description ?? ''), toFloat(raw.qty) ?? 0, toInt(raw.blocked) ?? 0, id_line);
        results.push({ id_line, action: 'updated' });
      }
    }
  });
  trx(lines);
  return results;
}

export function getNextInvoiceNum(db: Database.Database, year?: number): number {
  if (year != null && Number.isFinite(Number(year))) {
    const stmt = db.prepare(`SELECT COALESCE(MAX(num), 0) + 1 AS nextnum FROM invoice WHERE year = ?`);
    return (stmt.get(toInt(year)) as { nextnum: number }).nextnum;
  }
  const stmt = db.prepare(`SELECT COALESCE(MAX(num), 0) + 1 AS nextnum FROM invoice`);
  return (stmt.get() as { nextnum: number }).nextnum;
}

export function getInvoiceHeaderById(db: Database.Database, id_invoice: number): Invoice | undefined {
  const stmt = db.prepare(`SELECT id_invoice, account, art, year, num, date, booked, invoiceNr, estimateNr, blocked FROM invoice WHERE id_invoice = ? LIMIT 1`);
  return stmt.get(toInt(id_invoice)) as Invoice | undefined;
}

export function getInvoiceLineCount(db: Database.Database, id_invoice: number): number {
  const stmt = db.prepare(`SELECT COUNT(*) AS cnt FROM invoice_db WHERE id_invoice = ?`);
  const row = stmt.get(toInt(id_invoice)) as { cnt: number } | undefined;
  return row?.cnt ?? 0;
}

export function deleteInvoiceLinesByInvoiceId(db: Database.Database, id_invoice: number): Database.RunResult {
  const stmt = db.prepare(`DELETE FROM invoice_db WHERE id_invoice = ?`);
  return stmt.run(toInt(id_invoice));
}

export function deleteInvoiceById(db: Database.Database, id_invoice: number): Database.RunResult {
  const stmt = db.prepare(`DELETE FROM invoice WHERE id_invoice = ?`);
  return stmt.run(toInt(id_invoice));
}

export function deleteInvoiceHard(db: Database.Database, id_invoice: number): { changes: number } {
  const delLines = _db.prepare(`DELETE FROM invoice_db WHERE id_invoice = ?`);
  const delHead = _db.prepare(`DELETE FROM invoice WHERE id_invoice = ?`);
  const trx = _db.transaction((id: number) => {
    delLines.run(toInt(id));
    const res = delHead.run(toInt(id));
    return { changes: res.changes ?? 0 };
  });
  return trx(id_invoice);
}

export function lockInvoiceAndLines(db: Database.Database, id_invoice: number): { header: number; lines: number } {
  const trx = _db.transaction((id: number) => {
    const h = _db.prepare(`UPDATE invoice SET blocked = 1 WHERE id_invoice = ?`).run(id);
    const l = _db.prepare(`UPDATE invoice_db SET blocked = 1 WHERE id_invoice = ?`).run(id);
    return { header: h.changes | 0, lines: l.changes | 0 };
  });
  return trx(Number(id_invoice));
}

export function findEstimateIdByNr(db: Database.Database, estimateNr: string): number | null {
  const s = String(estimateNr || '').trim();
  if (!s) return null;
  const r1 = db.prepare(`SELECT id_estimate FROM estimate WHERE estimateNr = ? LIMIT 1`).get(s) as { id_estimate: number } | undefined;
  if (r1?.id_estimate) return r1.id_estimate;
  const m = /^E-(\d{4})-(\d{1,3})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]), n = Number(m[2]);
  const r2 = db.prepare(`SELECT id_estimate FROM estimate WHERE year = ? AND num = ? LIMIT 1`).get(y, n) as { id_estimate: number } | undefined;
  return r2?.id_estimate ?? null;
}

export function lockEstimateAndLinesById(db: Database.Database, id_estimate: number): { header: number; lines: number } {
  const trx = _db.transaction((id: number) => {
    const h = _db.prepare(`UPDATE estimate SET blocked = 1 WHERE id_estimate = ?`).run(id);
    const l = _db.prepare(`UPDATE estimate_db SET blocked = 1 WHERE id_estimate = ?`).run(id);
    return { header: h.changes | 0, lines: l.changes | 0 };
  });
  return trx(Number(id_estimate));
}

export function lockEstimateAndLinesByNr(db: Database.Database, estimateNr: string): { id_estimate: number | null; header: number; lines: number } {
  const id = findEstimateIdByNr(db, estimateNr);
  if (!id) return { id_estimate: null, header: 0, lines: 0 };
  const r = lockEstimateAndLinesById(db, id);
  return { id_estimate: id, ...r };
}

export function storePdfInInvoice(db: Database.Database, id_invoice: number, pdfBuffer: Buffer): void {
  const stmt = _db.prepare(`UPDATE invoice SET pdf_blob=?, pdf_generated_at=? WHERE id_invoice=?`);
  const now = new Date().toISOString();
  stmt.run(pdfBuffer, now, toInt(id_invoice));
}

export function getInvoicePdf(db: Database.Database, id_invoice: number): Buffer | null {
  const row = _db.prepare(`SELECT pdf_blob FROM invoice WHERE id_invoice=?`).get(toInt(id_invoice)) as { pdf_blob: Buffer | null } | undefined;
  return row?.pdf_blob || null;
}

export function setInvoiceBooked(db: Database.Database, id_invoice: number, booked = 1): void {
  _db.prepare(`UPDATE invoice SET booked=? WHERE id_invoice=?`).run(toInt(booked), toInt(id_invoice));
}

export function setInvoiceBlocked(db: Database.Database, id_invoice: number, blocked = 1): Database.RunResult {
  const stmt = db.prepare(`UPDATE invoice SET blocked = ? WHERE id_invoice = ?`);
  return stmt.run(blocked ? 1 : 0, toInt(id_invoice));
}

export function setEstimateBlocked(db: Database.Database, year: number, num: number, blocked = 1): Database.RunResult {
  const stmt = db.prepare(`UPDATE estimate SET blocked = ? WHERE year = ? AND num = ?`);
  return stmt.run(blocked ? 1 : 0, toInt(year), toInt(num));
}

export function setEstimateBlockedByNr(db: Database.Database, estimateNr: string, blocked = 1): { changes: number } {
  const t = (estimateNr ?? '').toString().trim();
  const m = t.match(/(\d{4})\D+(\d{1,3})$/);
  if (!m) return { changes: 0 };
  const year = Number(m[1]);
  const num = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(num)) return { changes: 0 };
  const res = setEstimateBlocked(db, year, num, blocked);
  return { changes: res.changes ?? 0 };
}

function parseEstimateNr(nr: string): { year: number; num: number } | null {
  const m = String(nr || '').match(/^E-(\d{4})-(\d{3,})$/);
  return m ? { year: Number(m[1]), num: Number(m[2]) } : null;
}

export function lockInvoiceCascade(db: Database.Database, id_invoice: number): { ok: boolean } {
  const uHead = _db.prepare(`UPDATE invoice SET blocked = 1 WHERE id_invoice = ?`);
  const uLines = _db.prepare(`UPDATE invoice_db SET blocked = 1 WHERE id_invoice = ?`);
  uHead.run(toInt(id_invoice));
  uLines.run(toInt(id_invoice));
  return { ok: true };
}

export function lockEstimateCascadeByNr(db: Database.Database, estimateNr: string): { ok: boolean; id_estimate?: number } {
  const p = parseEstimateNr(estimateNr);
  if (!p) return { ok: false };
  const row = _db.prepare(`SELECT id_estimate FROM estimate WHERE year = ? AND num = ? LIMIT 1`).get(toInt(p.year), toInt(p.num)) as { id_estimate: number } | undefined;
  if (!row?.id_estimate) return { ok: false };
  const uHead = _db.prepare(`UPDATE estimate SET blocked = 1 WHERE id_estimate = ?`);
  const uLines = _db.prepare(`UPDATE estimate_db SET blocked = 1 WHERE id_estimate = ?`);
  uHead.run(toInt(row.id_estimate));
  uLines.run(toInt(row.id_estimate));
  return { ok: true, id_estimate: row.id_estimate };
}
