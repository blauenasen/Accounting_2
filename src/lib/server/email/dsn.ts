/**
 * File: src/lib/server/email/dsn.ts
 * DSN helpers for Nodemailer (optional)
 * - Controlled via .env (server-side):
 *     MAIL_DSN_ENABLE=true|false
 *     MAIL_DSN_NOTIFY=success,delay,failure    // Comma-separated; valid: success|failure|delay|never
 *     MAIL_DSN_RETURN=headers|full             // Default: headers
 *     MAIL_DSN_RECIPIENT=<email>               // Optional explicit DSN recipient
 * - Export:
 *     buildDsn({ id?: string, recipient?: string }): { dsn?: {...} } | {}
 *     applyDsn(mail, dsnOpts?): MailOptions     // Extends existing mail options object
 */

import { env } from '$env/dynamic/private';

export interface DsnOpts {
  id?: string;
  recipient?: string;
}

export interface DsnResult {
  dsn?: {
    id?: string;
    notify?: string;
    return?: string;
    recipient?: string;
  };
}

/**
 * Normalize booleans from .env
 */
function envBool(v: string | undefined, def: boolean = false): boolean {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return def;
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

/**
 * Prepare DSN structure for Nodemailer (or empty object if disabled)
 */
export function buildDsn(opts: DsnOpts = {}): DsnResult {
  const enabled = envBool(env.MAIL_DSN_ENABLE, false);
  if (!enabled) return {};

  const notifyRaw = String(env.MAIL_DSN_NOTIFY ?? 'success,failure,delay').toLowerCase();
  const valid = new Set(['success', 'failure', 'delay', 'never']);
  const parts = notifyRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => valid.has(s));

  // If empty/invalid, fallback
  const notify = parts.length ? parts.join(',') : 'success,failure,delay';

  const ret = String(env.MAIL_DSN_RETURN ?? 'headers').toLowerCase();
  const retVal = ret === 'full' ? 'full' : 'headers';

  const defaultRecipient = (env.MAIL_DSN_RECIPIENT ?? '').toString().trim() || undefined;

  const out: DsnResult = {
    dsn: {
      id: opts.id || undefined,
      notify,
      return: retVal,
      recipient: opts.recipient || defaultRecipient
    }
  };

  // Recipient may be omitted; Nodemailer accepts dsn without recipient → provider can derive recipient
  if (!out.dsn!.recipient) delete out.dsn!.recipient;
  if (!out.dsn!.id) delete out.dsn!.id;

  return out;
}

/**
 * Extend existing mail options with DSN (if enabled)
 */
export function applyDsn(mail: any, opts: DsnOpts = {}): any {
  const d = buildDsn(opts);
  if (!d.dsn) return mail;
  return { ...(mail || {}), ...d };
}
