// src/lib/server/db/stammdaten.ts
// Master data and email account functions

import type Database from 'better-sqlite3';

/**
 * Company master data
 */
export interface Stammdaten {
  firma: string;
  adress1: string;
  adress2: string;
  email: string;
  tax: string;
  registration: string;
  bcc: string;
}

/**
 * Email account configuration (SMTP + IMAP)
 */
export interface EmailAccount {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
  bcc: string;
  imapHost: string | null;
  imapPort: number | null;
  imapUser: string | null;
  imapPass: string | null;
  imapSecure: boolean | null;
  imapSent: string | null;
}

/**
 * Database row type for email_account table
 */
interface EmailAccountRow {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_SECURE: number;
  SMTP_FROM: string;
  MAIL_BCC: string;
  IMAP_HOST: string | null;
  IMAP_PORT: number | null;
  IMAP_USER: string | null;
  IMAP_PASS: string | null;
  IMAP_SECURE: number | null;
  IMAP_SENT: string | null;
}

/**
 * Helper: Convert value to string (null-safe)
 */
const toStr = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/**
 * Helper: Convert value to integer (null-safe)
 */
const toInt = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10));

/**
 * Get company master data with BCC email
 */
export function getStammdaten(db: Database.Database): Stammdaten {
  const base = db.prepare(`
    SELECT firma, adress1, adress2, email, tax, registration
    FROM stammdaten
    LIMIT 1
  `).get() as Partial<Stammdaten> | undefined || {};

  const mail = db.prepare(`SELECT MAIL_BCC AS bcc FROM email_account LIMIT 1`).get() as { bcc?: string } | undefined || {};

  return {
    firma: base.firma || '',
    adress1: base.adress1 || '',
    adress2: base.adress2 || '',
    email: base.email || '',
    tax: base.tax || '',
    registration: base.registration || '',
    bcc: mail.bcc ?? ''
  };
}

/**
 * Get email account configuration (SMTP + IMAP)
 * @returns EmailAccount or undefined if not configured
 */
export function getEmailAccount(db: Database.Database): EmailAccount | undefined {
  const row = db.prepare(`
    SELECT SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM, MAIL_BCC,
           IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS, IMAP_SECURE, IMAP_SENT
    FROM email_account
    LIMIT 1
  `).get() as EmailAccountRow | undefined;

  if (!row) return undefined;

  return {
    host: String(row.SMTP_HOST ?? ''),
    port: Number(row.SMTP_PORT ?? 0),
    user: String(row.SMTP_USER ?? ''),
    pass: String(row.SMTP_PASS ?? ''),
    secure: Number(row.SMTP_SECURE ?? 0) === 1,
    from: String(row.SMTP_FROM ?? ''),
    bcc: String(row.MAIL_BCC ?? ''),
    imapHost: row.IMAP_HOST ? String(row.IMAP_HOST) : null,
    imapPort: row.IMAP_PORT != null ? Number(row.IMAP_PORT) : null,
    imapUser: row.IMAP_USER ? String(row.IMAP_USER) : null,
    imapPass: row.IMAP_PASS ? String(row.IMAP_PASS) : null,
    imapSecure: row.IMAP_SECURE != null ? Number(row.IMAP_SECURE) === 1 : null,
    imapSent: row.IMAP_SENT ? String(row.IMAP_SENT) : null
  };
}

/**
 * Set email account configuration (replaces existing)
 * @param cfg Email account configuration
 */
export function setEmailAccount(db: Database.Database, cfg: Partial<EmailAccount>): void {
  const trx = db.transaction((c: Partial<EmailAccount>) => {
    db.prepare(`DELETE FROM email_account`).run();
    db.prepare(`
      INSERT INTO email_account (SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, SMTP_SECURE, SMTP_FROM, MAIL_BCC)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      toStr(c.host),
      toStr(c.pass),
      toInt(c.port) ?? 0,
      toStr(c.user),
      (c.secure === true || Number(c.secure) === 1) ? 1 : 0,
      toStr(c.from),
      toStr(c.bcc)
    );
  });
  trx(cfg);
}

/**
 * Get BCC email address (from email_account or stammdaten)
 * @returns BCC email address
 */
export function getMailBcc(db: Database.Database): string {
  const ea = getEmailAccount(db);
  if (ea && ea.bcc) return ea.bcc;
  const sd = getStammdaten(db);
  return String(sd?.bcc ?? '').trim();
}
