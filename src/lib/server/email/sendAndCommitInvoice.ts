/**
 * File: src/lib/server/email/sendAndCommitInvoice.ts
 * Send invoice and lock only AFTER success
 */

import { db, getInvoiceHeaderById, getMailBcc, storePdfInInvoice } from '$lib/server/index.js';
import { sendInvoiceEmail } from '$lib/server/email/provider.js';
import { buildSubject, buildBodyHtml, buildBodyText } from '$lib/server/email/composeInvoiceMail.js';
import { generateInvoicePdfBuffer } from '$lib/server/pdf-generator.js';
import type { Attachment } from '$lib/server/email/provider.js';
import type { SignatureData } from '$lib/email/signature.shared.js';

const toInt = (v: string | number | null | undefined): number | null =>
  v === null || v === undefined || v === '' ? null : Number.parseInt(String(v), 10);
const pad3 = (n: number | string | null | undefined): string => String(n ?? '').padStart(3, '0');

interface Debtor {
  salutation?: string;
  name?: string;
  email?: string;
}

interface InvoiceHeader {
  year: string | number;
  num: string | number;
  date?: string;
  account: number;
  estimateNr?: string;
}

interface SendOptions {
  to?: string;
  bcc?: string | string[];
  note?: string;
  signatureOverrides?: Partial<SignatureData>;
  origin?: string;
  attachments?: Attachment[];
}

interface SendResult {
  ok: boolean;
  code?: string;
  message?: string;
  send?: any;
  subject?: string;
}

/**
 * Load debtor for recipient line
 */
function loadDebtor(account: number | null): Debtor {
  return (
    db
      .prepare(`SELECT salutation, name, email FROM debtors WHERE account = ? LIMIT 1`)
      .get(toInt(account)) || {}
  );
}

function recipientLineOf(debtor: Debtor): string {
  // Example: "Dear Mr. Jamie Myers,"
  const sal = String(debtor?.salutation || '').replace(/\.$/, '');
  const name = String(debtor?.name || '').trim();
  return `Dear ${sal ? `${sal}. ` : ''}${name},`;
}

/**
 * Lock invoice after successful send
 * NOTE: booked is NOT set - only when actually booked!
 */
function lockAfterSend({ id_invoice, header }: { id_invoice: number; header: InvoiceHeader }): void {
  const trx = db.transaction(() => {
    db.prepare(`UPDATE invoice SET blocked = 1 WHERE id_invoice = ?`).run(toInt(id_invoice));

    // If invoice is linked to an estimate: lock it
    const est = header?.estimateNr || '';
    if (est && /^E-(\d{4})-(\d{3})$/.test(est)) {
      const match = est.match(/^E-(\d{4})-(\d{3})$/);
      if (match) {
        const [, y, n] = match;
        db.prepare(`UPDATE estimate SET blocked = 1 WHERE year = ? AND num = ?`).run(toInt(y), toInt(n));
      }
    }
  });
  trx();
}

/**
 * Send invoice and lock only AFTER success
 * options: { to?, bcc?, note?, signatureOverrides?, origin? }
 */
export async function sendAndCommitInvoice(
  id_invoice: number,
  options: SendOptions = {}
): Promise<SendResult> {
  const header = getInvoiceHeaderById(id_invoice) as InvoiceHeader | null;
  if (!header) return { ok: false, code: 'NOT_FOUND', message: 'Invoice not found' };

  const debtor = loadDebtor(header.account);
  const to = (options.to || debtor.email || '').trim();
  if (!to) return { ok: false, code: 'TO_MISSING', message: 'Recipient e-mail missing' };

  // Generate PDF and store in database
  const origin = options.origin || 'http://localhost:5174';
  const pdfBuffer = await generateInvoicePdfBuffer(id_invoice, origin);
  storePdfInInvoice(id_invoice, pdfBuffer);

  // Create PDF attachment for email
  const invoiceNr = `I-${header.year}-${pad3(header.num)}`;
  const pdfAttachment: Attachment = {
    filename: `${invoiceNr}.pdf`,
    content: pdfBuffer
  };

  const subject = buildSubject({ invoiceHeader: header, estimateNr: header.estimateNr });
  const recipientLine = recipientLineOf(debtor);

  const html = buildBodyHtml({ recipientLine, overridesForSignature: options.signatureOverrides });
  const text = buildBodyText({ recipientLine, overridesForSignature: options.signatureOverrides });

  const sendRes = await sendInvoiceEmail({
    to,
    bcc: options.bcc || getMailBcc(),
    subject,
    text,
    html,
    attachments: [pdfAttachment, ...(options.attachments || [])]
  });

  if (sendRes?.ok) {
    lockAfterSend({ id_invoice, header });
  }

  return { ok: !!sendRes?.ok, send: sendRes, subject };
}
