// src/lib/server/db/estimates.ts
// Estimate and Estimate Lines functions (analog to invoices)

import type Database from 'better-sqlite3';

export interface Estimate {
  id_estimate: number;
  year: number;
  num: number;
  date: string;
  account: number;
  estimateNr?: string;
  blocked?: number;
}

export interface EstimateLine {
  id_line: number;
  id_estimate: number;
  id_rate: number;
  service?: string;
  description: string;
  tax?: number;
  qty: number;
  rate?: number;
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

export function getAllEstimates(db: Database.Database): Estimate[] {
  return db.prepare(`SELECT * FROM estimate ORDER BY id_estimate`).all() as Estimate[];
}

export function insertEstimate(db: Database.Database, est: Partial<Estimate> & { year: number; num: number; date: string; account: number }): number {
  const res = db.prepare(`INSERT INTO estimate (year, num, date, account) VALUES (?, ?, ?, ?)`).run(toInt(est.year), toInt(est.num), toStr(est.date), toInt(est.account));
  return Number(res.lastInsertRowid);
}

export function updateEstimate(db: Database.Database, est: Partial<Estimate> & { id_estimate: number }): Database.RunResult {
  return db.prepare(`UPDATE estimate SET year = ?, num = ?, date = ?, account = ? WHERE id_estimate = ?`).run(toInt(est.year), toInt(est.num), toStr(est.date), toInt(est.account), toInt(est.id_estimate));
}

export function updateEstimateHeaderDateAccount(db: Database.Database, { id_estimate, date, account }: { id_estimate: number; date?: string; account?: number }): Database.RunResult {
  return db.prepare(`UPDATE estimate SET date = ?, account = ? WHERE id_estimate = ?`).run(toStr(date), toInt(account), toInt(id_estimate));
}

export function getEstimateLines(db: Database.Database, id_estimate: number): EstimateLine[] {
  return db.prepare(`
    SELECT d.id_line, d.id_estimate, d.id_rate, r.service,
           COALESCE(d.description, r.description) AS description,
           (SELECT tax FROM stammdaten LIMIT 1) AS tax,
           d.qty, r.rate, d.blocked
    FROM estimate_db d
    LEFT JOIN rates r ON d.id_rate = r.id_rate
    WHERE d.id_estimate = ?
    ORDER BY d.id_line
  `).all(toInt(id_estimate)) as EstimateLine[];
}

export function insertEstimateLine(db: Database.Database, line: Partial<EstimateLine> & { id_estimate: number; id_rate: number }): number {
  const res = db.prepare(`INSERT INTO estimate_db (id_estimate, id_rate, description, qty, blocked) VALUES (?, ?, ?, ?, ?)`).run(toInt(line.id_estimate), toInt(line.id_rate), toStr(line.description ?? ''), toFloat(line.qty) ?? 0, toInt(line.blocked) ?? 0);
  return Number(res.lastInsertRowid);
}

export function updateEstimateLine(db: Database.Database, line: Partial<EstimateLine> & { id_line: number }): Database.RunResult {
  return db.prepare(`UPDATE estimate_db SET id_rate = ?, description = ?, qty = ?, blocked = ? WHERE id_line = ?`).run(toInt(line.id_rate), toStr(line.description ?? ''), toFloat(line.qty) ?? 0, toInt(line.blocked) ?? 0, toInt(line.id_line));
}

export function deleteEstimateLine(db: Database.Database, id_line: number): Database.RunResult {
  return db.prepare(`DELETE FROM estimate_db WHERE id_line = ?`).run(toInt(id_line));
}

export function deleteEstimateLines(db: Database.Database, ids: number[]): { changes: number } {
  const del = db.prepare(`DELETE FROM estimate_db WHERE id_line = ?`);
  const trx = _db.transaction((arr: number[]) => {
    for (const id of arr) del.run(toInt(id));
  });
  trx(ids);
  return { changes: ids.length };
}

export function saveEstimateLines(db: Database.Database, lines: Partial<EstimateLine>[]): Array<{ id_line: number; action: 'inserted' | 'updated' | 'deleted' }> {
  const results: Array<{ id_line: number; action: 'inserted' | 'updated' | 'deleted' }> = [];
  const insert = _db.prepare(`INSERT INTO estimate_db (id_estimate, id_rate, description, qty, blocked) VALUES (?, ?, ?, ?, ?)`);
  const update = _db.prepare(`UPDATE estimate_db SET id_rate = ?, description = ?, qty = ?, blocked = ? WHERE id_line = ?`);
  const del = _db.prepare(`DELETE FROM estimate_db WHERE id_line = ?`);
  const trx = _db.transaction((rows: Partial<EstimateLine>[]) => {
    for (const raw of rows) {
      const id_line = toInt(raw.id_line);
      const wantDelete = !!raw._delete;
      if (wantDelete && id_line) {
        del.run(id_line);
        results.push({ id_line, action: 'deleted' });
        continue;
      }
      if (!id_line) {
        const res = insert.run(toInt(raw.id_estimate), toInt(raw.id_rate), toStr(raw.description ?? ''), toFloat(raw.qty) ?? 0, toInt(raw.blocked) ?? 0);
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

export function getNextEstimateNum(db: Database.Database): number {
  return (db.prepare(`SELECT COALESCE(MAX(num), 0) + 1 AS nextnum FROM estimate`).get() as { nextnum: number }).nextnum;
}

export function getEstimateHeaderById(db: Database.Database, id_estimate: number): Estimate | undefined {
  return db.prepare(`SELECT id_estimate, year, num, date, account, blocked FROM estimate WHERE id_estimate = ? LIMIT 1`).get(toInt(id_estimate)) as Estimate | undefined;
}

export function getEstimateLineCount(db: Database.Database, id_estimate: number): number {
  const row = db.prepare(`SELECT COUNT(*) AS cnt FROM estimate_db WHERE id_estimate = ?`).get(toInt(id_estimate)) as { cnt: number } | undefined;
  return row?.cnt ?? 0;
}

export function deleteEstimateLinesByEstimateId(db: Database.Database, id_estimate: number): Database.RunResult {
  return db.prepare(`DELETE FROM estimate_db WHERE id_estimate = ?`).run(toInt(id_estimate));
}

export function deleteEstimateById(db: Database.Database, id_estimate: number): Database.RunResult {
  return db.prepare(`DELETE FROM estimate WHERE id_estimate = ?`).run(toInt(id_estimate));
}

export function deleteEstimateHard(db: Database.Database, id_estimate: number): { changes: number } {
  const delLines = _db.prepare(`DELETE FROM estimate_db WHERE id_estimate = ?`);
  const delHead = _db.prepare(`DELETE FROM estimate WHERE id_estimate = ?`);
  const trx = _db.transaction((id: number) => {
    delLines.run(toInt(id));
    const res = delHead.run(toInt(id));
    return { changes: res.changes ?? 0 };
  });
  return trx(id_estimate);
}

export function lockEstimateAndLinesById(db: Database.Database, id_estimate: number): { header: number; lines: number } {
  const trx = _db.transaction((id: number) => {
    const h = _db.prepare(`UPDATE estimate SET blocked = 1 WHERE id_estimate = ?`).run(id);
    const l = _db.prepare(`UPDATE estimate_db SET blocked = 1 WHERE id_estimate = ?`).run(id);
    return { header: h.changes | 0, lines: l.changes | 0 };
  });
  return trx(Number(id_estimate));
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

export function lockEstimateAndLinesByNr(db: Database.Database, estimateNr: string): { id_estimate: number | null; header: number; lines: number } {
  const id = findEstimateIdByNr(db, estimateNr);
  if (!id) return { id_estimate: null, header: 0, lines: 0 };
  const r = lockEstimateAndLinesById(db, id);
  return { id_estimate: id, ...r };
}

export function setEstimateBlocked(db: Database.Database, year: number, num: number, blocked = 1): Database.RunResult {
  return db.prepare(`UPDATE estimate SET blocked = ? WHERE year = ? AND num = ?`).run(blocked ? 1 : 0, toInt(year), toInt(num));
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

export function lockEstimateCascadeByNr(db: Database.Database, estimateNr: string): { ok: boolean; id_estimate?: number } {
  const p = parseEstimateNr(estimateNr);
  if (!p) return { ok: false };
  const row = db.prepare(`SELECT id_estimate FROM estimate WHERE year = ? AND num = ? LIMIT 1`).get(toInt(p.year), toInt(p.num)) as { id_estimate: number } | undefined;
  if (!row?.id_estimate) return { ok: false };
  const uHead = db.prepare(`UPDATE estimate SET blocked = 1 WHERE id_estimate = ?`);
  const uLines = db.prepare(`UPDATE estimate_db SET blocked = 1 WHERE id_estimate = ?`);
  uHead.run(toInt(row.id_estimate));
  uLines.run(toInt(row.id_estimate));
  return { ok: true, id_estimate: row.id_estimate };
}
