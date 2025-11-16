/**
 * File: src/lib/server/email/composeInvoiceMail.ts
 * Compose invoice email (subject, body text, body HTML)
 * Includes inline signature logic (no separate signature.js module)
 */

import { getStammdaten } from '$lib/server/index.js';
import {
  DEFAULT_SIGNATURE,
  signatureHtmlFrom,
  signatureTextFrom,
  type SignatureData
} from '$lib/email/signature.shared.js';

function pad3(n: number | string | null | undefined): string {
  return String(n ?? '').padStart(3, '0');
}

function toUsDate(iso: string | null | undefined): string {
  // Expects YYYY-MM-DD; falls back to original if invalid
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

interface InvoiceHeader {
  year?: string | number;
  num?: string | number;
  date?: string;
  invoiceNr?: string;
  estimateNr?: string;
}

export function buildInvoiceNr(h: InvoiceHeader): string {
  // Uses stored invoiceNr, otherwise "I-YYYY-NNN"
  if (h?.invoiceNr) return String(h.invoiceNr);
  return `I-${h.year}-${pad3(h.num)}`;
}

export function buildEstimateNr(h: InvoiceHeader): string {
  if (h?.estimateNr) return String(h.estimateNr);
  return h?.year && h?.num ? `E-${h.year}-${pad3(h.num)}` : '';
}

export interface SubjectOptions {
  invoiceHeader: InvoiceHeader;
  estimateNr?: string;
}

export function buildSubject({ invoiceHeader, estimateNr }: SubjectOptions): string {
  const invNr = buildInvoiceNr(invoiceHeader);
  const date = toUsDate(invoiceHeader?.date);
  const est = estimateNr || invoiceHeader?.estimateNr || '';
  return `Invoice ${invNr} Date ${date}${est ? ` - based on the offer ${est}` : ''}`;
}

/**
 * Build signature data from Stammdaten (fallback to defaults)
 */
function buildSignatureData(): SignatureData {
  const sd = getStammdaten() || {};
  return {
    firma: sd.firma || DEFAULT_SIGNATURE.firma,
    owner: DEFAULT_SIGNATURE.owner, // owner not in DB, use default
    adress1: sd.adress1 || DEFAULT_SIGNATURE.adress1,
    adress2: sd.adress2 || DEFAULT_SIGNATURE.adress2,
    email: sd.email || DEFAULT_SIGNATURE.email,
    registration: sd.registration || DEFAULT_SIGNATURE.registration
  };
}

export interface BodyOptions {
  recipientLine: string;
  overridesForSignature?: Partial<SignatureData>;
}

export function buildBodyText({ recipientLine, overridesForSignature }: BodyOptions): string {
  const sigData = { ...buildSignatureData(), ...overridesForSignature };
  const top = [
    recipientLine,
    '',
    'Enclosed you will find my invoice for the services and materials provided.',
    '',
    'Kind regards',
    ''
  ].join('\n');
  return `${top}${signatureTextFrom(sigData)}\n`;
}

export function buildBodyHtml({ recipientLine, overridesForSignature }: BodyOptions): string {
  const sigData = { ...buildSignatureData(), ...overridesForSignature };
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size:15px; line-height:1.55; color:#111">
      <p>${recipientLine}</p>
      <p>Enclosed you will find my invoice for the services and materials provided.</p>
      <p>Kind regards</p>
      <div style="margin-top:14px">${signatureHtmlFrom(sigData)}</div>
    </div>
  `.trim();
}
