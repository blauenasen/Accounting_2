/**
 * File: src/lib/server/email/eventStore.ts
 * Central helpers for mail_events table: Schema, Upsert, Status/Lock updates (Invoice + linked Estimate)
 * - ensureSchema(db)
 * - upsertEvent(db, { messageId, provider, status, reason, id_invoice? })
 * - tryResolveInvoiceId(db, messageId): number|null
 * - lockInvoiceCascade(db, id_invoice): boolean
 */

interface MailEvent {
  messageId: string;
  provider?: string;
  status?: string;
  reason?: string;
  id_invoice?: number | null;
  updated_at?: string;
}

/**
 * Create mail_events table (idempotent)
 */
export function ensureSchema(db: any): void {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS mail_events (
      messageId   TEXT PRIMARY KEY,
      provider    TEXT,
      status      TEXT,
      reason      TEXT,
      id_invoice  INTEGER,
      updated_at  TEXT
    )
  `).run();
}

/**
 * ISO timestamp now
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Upsert mail event
 */
export function upsertEvent(db: any, ev: MailEvent): void {
  db.prepare(
    `INSERT INTO mail_events (messageId, provider, status, reason, id_invoice, updated_at)
     VALUES (@messageId, @provider, @status, @reason, @id_invoice, @updated_at)
     ON CONFLICT(messageId) DO UPDATE SET
       provider=excluded.provider,
       status=excluded.status,
       reason=excluded.reason,
       id_invoice=COALESCE(mail_events.id_invoice, excluded.id_invoice),
       updated_at=excluded.updated_at`
  ).run({
    ...ev,
    updated_at: nowIso()
  });
}

/**
 * Resolve id_invoice from messageId (if event already linked)
 */
export function tryResolveInvoiceId(db: any, messageId: string): number | null {
  const row = db
    .prepare(`SELECT id_invoice FROM mail_events WHERE messageId = ?`)
    .get(String(messageId || ''));
  return row?.id_invoice ?? null;
}

/**
 * Lock Invoice and linked Estimate based on Invoice ID
 */
export function lockInvoiceCascade(db: any, idInvoice: number): boolean {
  const id = Number(idInvoice);
  if (!Number.isFinite(id) || id <= 0) return false;

  db.prepare(`UPDATE invoice SET blocked = 1 WHERE id_invoice = ?`).run(id);

  const inv = db.prepare(`SELECT estimateNr FROM invoice WHERE id_invoice = ?`).get(id);
  const estNr = inv?.estimateNr ? String(inv.estimateNr) : '';
  const m = /^E-(\d{4})-(\d{3})$/.exec(estNr);

  if (m) {
    const year = Number(m[1]);
    const num = Number(m[2]);
    db.prepare(`UPDATE estimate SET blocked = 1 WHERE year = ? AND num = ?`).run(year, num);
  }

  return true;
}
