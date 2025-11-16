/**
 * File: src/lib/server/email/provider.ts
 * SMTP sending + IMAP append to "Sent" folder
 * - All config from SQLite (email_account table), no .env
 * - BCC always included (fallback: MAIL_BCC from DB)
 * - IMAP: connect → append (TRYCREATE if needed) → logout
 * - NO IMAP logs (silent logger)
 * - Sent folder candidates: IMAP_SENT (DB) → "Sent Items" → "Sent"
 * - Returns append: { ok, mailbox, uid } for verification
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { ImapFlow } from 'imapflow';
import * as dbmod from '$lib/server/index.js';

export interface Attachment {
  filename?: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
  bcc: string;
}

interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  sent: string;
}

interface EmailConfig {
  smtp: SmtpConfig;
  imap: ImapConfig;
}

interface AppendResult {
  ok: boolean;
  mailbox?: string;
  uid?: number;
  skipped?: string;
  code?: string;
  message?: string;
}

interface VerifyResult {
  ok: boolean;
  provider?: string;
  code?: string;
  message?: string;
  cause?: unknown;
}

interface SendOptions {
  to: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  headers?: Record<string, string>;
  requestId?: string;
}

interface SendResult {
  ok: boolean;
  provider: string;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
  append?: AppendResult;
  code?: string;
  message?: string;
  cause?: unknown;
}

/**
 * Resolve DB connection from $lib/server/index.js
 */
function resolveDb(): any {
  const m = dbmod || {};
  const cands = [
    m.default,
    m.db,
    m.connection,
    typeof (m as any).getDb === 'function' ? (m as any).getDb() : undefined
  ].filter(Boolean);

  for (const c of cands) {
    if (c && typeof c.prepare === 'function') return c;
  }
  throw new Error('SQLite connection not available from $lib/server/index.js');
}

function truthy(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return /^(1|true|yes|on)$/i.test(v.trim());
  return false;
}

function loadEmailConfig(db: any): EmailConfig | null {
  const row = db.prepare(`
    SELECT
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM, MAIL_BCC,
      IMAP_HOST, IMAP_PORT, IMAP_SECURE, IMAP_USER, IMAP_PASS, IMAP_SENT
    FROM email_account
    LIMIT 1
  `).get();

  if (!row) return null;

  return {
    smtp: {
      host: String(row.SMTP_HOST ?? '').trim(),
      port: Number(row.SMTP_PORT ?? 0),
      user: String(row.SMTP_USER ?? '').trim(),
      pass: String(row.SMTP_PASS ?? '').trim(),
      secure: truthy(row.SMTP_SECURE),
      from: String(row.SMTP_FROM ?? '').trim(),
      bcc: String(row.MAIL_BCC ?? '').trim()
    },
    imap: {
      host: String(row.IMAP_HOST ?? '').trim(),
      port: Number(row.IMAP_PORT ?? 0),
      secure: truthy(row.IMAP_SECURE),
      user: String(row.IMAP_USER ?? '').trim(),
      pass: String(row.IMAP_PASS ?? '').trim(),
      sent: String(row.IMAP_SENT ?? '').trim()
    }
  };
}

function normalizeAddress(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.filter(Boolean).join(', ') : String(value);
}

function normalizeAttachments(list: Attachment[] | undefined): Attachment[] {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean).map((a) => {
    const out: Attachment = {};
    if (a.filename) out.filename = a.filename;
    if (a.content) out.content = a.content;
    if (a.path) out.path = a.path;
    if (a.contentType) out.contentType = a.contentType;
    return out;
  });
}

function requireSmtp(cfg: SmtpConfig | undefined): asserts cfg is SmtpConfig {
  const missing: string[] = [];
  if (!cfg?.host) missing.push('SMTP_HOST');
  if (!cfg?.port) missing.push('SMTP_PORT');
  if (!cfg?.user) missing.push('SMTP_USER');
  if (!cfg?.pass) missing.push('SMTP_PASS');
  if (!cfg?.from) missing.push('SMTP_FROM');

  if (missing.length) {
    const err = new Error(`SMTP configuration incomplete: ${missing.join(', ')}`) as Error & { code: string };
    err.code = 'SMTP_CONFIG_MISSING';
    throw err;
  }
}

function createTransport(smtp: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: !!smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass }
  });
}

async function buildRawFromMail(mailLike: any): Promise<Buffer> {
  const composer = new MailComposer(mailLike);
  return await composer.compile().build();
}

/**
 * Silent IMAP logger (no logs)
 */
const silentLogger = {
  debug() {},
  info() {},
  warn() {},
  error() {}
};

async function appendToSentRaw(rawBuffer: Buffer, imapCfg: ImapConfig): Promise<AppendResult> {
  if (!imapCfg?.host || !imapCfg?.port || !imapCfg?.user || !imapCfg?.pass) {
    return { ok: false, skipped: 'disabled' };
  }

  const candidates = Array.from(
    new Set([imapCfg.sent, 'Sent Items', 'Sent'].filter((v) => v && v.trim()))
  );
  if (candidates.length === 0) candidates.push('Sent Items', 'Sent');

  const client = new ImapFlow({
    host: imapCfg.host,
    port: Number(imapCfg.port),
    secure: !!imapCfg.secure,
    auth: { user: imapCfg.user, pass: imapCfg.pass },
    logger: silentLogger as any
  });

  try {
    await client.connect();

    for (const mailbox of candidates) {
      const tryAppend = async () => client.append(mailbox, rawBuffer);

      try {
        const res = await tryAppend();
        const uid = res && typeof res === 'object' && 'uid' in res ? Number(res.uid) : undefined;
        return { ok: true, mailbox, uid };
      } catch (e: any) {
        const msg = String(e?.message || '');
        // Mailbox doesn't exist → TRYCREATE
        if (/TRYCREATE|CREATE/i.test(msg)) {
          try {
            await client.mailboxCreate(mailbox);
            const res2 = await tryAppend();
            const uid2 = res2 && typeof res2 === 'object' && 'uid' in res2 ? Number(res2.uid) : undefined;
            return { ok: true, mailbox, uid: uid2 };
          } catch {
            // Continue to next candidate
          }
        }
        // Other error → try next candidate
      }
    }

    return { ok: false, code: 'IMAP_APPEND_FAILED', message: 'No Sent folder accepted.' };
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}

/**
 * Verify SMTP connection
 */
export async function verifySmtpConnection(): Promise<VerifyResult> {
  try {
    const db = resolveDb();
    const cfg = loadEmailConfig(db);
    requireSmtp(cfg?.smtp);
    const transporter = createTransport(cfg.smtp);
    await transporter.verify();
    return { ok: true };
  } catch (e: any) {
    return {
      ok: false,
      provider: 'smtp',
      code: e?.code || 'SMTP_VERIFY_FAILED',
      message: e?.message || 'SMTP verify failed',
      cause: e
    };
  }
}

/**
 * Send invoice email via SMTP and append to IMAP Sent folder
 */
export async function sendInvoiceEmail(options: SendOptions): Promise<SendResult> {
  const { to, bcc, subject, text, html, attachments, headers, requestId } = options || {};

  try {
    const db = resolveDb();
    const cfg = loadEmailConfig(db);
    requireSmtp(cfg?.smtp);

    const transporter = createTransport(cfg.smtp);

    const finalTo = normalizeAddress(to);
    if (!finalTo) {
      const err = new Error('Field "to" is missing or empty.') as Error & { code: string };
      err.code = 'TO_MISSING';
      throw err;
    }
    if (!subject) {
      const err = new Error('Field "subject" is missing or empty.') as Error & { code: string };
      err.code = 'SUBJECT_MISSING';
      throw err;
    }

    const finalBcc = normalizeAddress(bcc || cfg.smtp.bcc || '');

    // Fixed Message-ID so SMTP & IMAP have same ID
    const messageId = `<${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}@${(cfg.smtp.from.split('@')[1] || 'local').trim()}>`;

    const baseHeaders: Record<string, string> = { ...(headers || {}) };
    if (requestId) baseHeaders['X-Request-Id'] = String(requestId);

    const mail = {
      from: cfg.smtp.from,
      to: finalTo,
      subject,
      ...(finalBcc ? { bcc: finalBcc } : {}),
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
      attachments: normalizeAttachments(attachments),
      headers: baseHeaders,
      messageId,
      date: new Date()
    };

    // 1) Build RAW (for IMAP APPEND)
    const raw = await buildRawFromMail(mail);

    // 2) Send via SMTP
    const info = await transporter.sendMail(mail);
    const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
    const rejected = Array.isArray(info?.rejected) ? info.rejected : [];
    const response = info?.response || '';

    // 3) IMAP APPEND (no flags, silent)
    const append = await appendToSentRaw(raw, cfg.imap);

    return {
      ok: true,
      provider: 'smtp',
      messageId: info?.messageId || messageId,
      accepted,
      rejected,
      response,
      append
    };
  } catch (e: any) {
    return {
      ok: false,
      provider: 'smtp',
      code: e?.code || 'SMTP_SEND_FAILED',
      message: e?.message || 'SMTP send failed',
      cause: e
    };
  }
}

/**
 * Convert PDF buffer to email attachment
 */
export function pdfBufferToAttachment(pdfBuffer: Buffer, filename: string = 'invoice.pdf'): Attachment {
  return { filename, content: pdfBuffer, contentType: 'application/pdf' };
}
