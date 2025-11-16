/**
 * File: src/lib/email/signature.shared.ts
 * Shared signature helpers for UI preview & server (DB-free)
 */

function escHtml(s: string = ''): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface SignatureData {
  firma: string;
  owner: string;
  adress1: string;
  adress2: string;
  email: string;
  registration: string;
}

export const DEFAULT_SIGNATURE: SignatureData = {
  firma: 'Apelts Painting',
  owner: 'Gilbert Apelt',
  adress1: '45 Chapalina Sq SE',
  adress2: 'Calgary AB T2X 0J4',
  email: 'apelts.painting@gmail.com',
  registration: '794274803RC0001'
};

export function signatureHtmlFrom(data: SignatureData = DEFAULT_SIGNATURE): string {
  const emailLink = data.email
    ? `<a href="mailto:${escHtml(data.email)}" style="color:#0a5;text-decoration:underline">${escHtml(data.email)}</a>`
    : '';

  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0"
  style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#111">
  <tr><td style="font-weight:700">${escHtml(data.firma)}</td></tr>
  ${data.owner ? `<tr><td>${escHtml(data.owner)}</td></tr>` : ''}
  ${data.adress1 ? `<tr><td>${escHtml(data.adress1)}</td></tr>` : ''}
  ${data.adress2 ? `<tr><td>${escHtml(data.adress2)}</td></tr>` : ''}
  ${data.email ? `<tr><td>${emailLink}</td></tr>` : ''}
  ${data.registration ? `<tr><td style="font-size:12px;color:#555">GST/HST Registration No.: ${escHtml(data.registration)}</td></tr>` : ''}
</table>`.trim();
}

export function signatureTextFrom(data: SignatureData = DEFAULT_SIGNATURE): string {
  return [
    data.firma ? data.firma.toUpperCase() : '',
    data.owner || '',
    data.adress1 || '',
    data.adress2 || '',
    data.email || '',
    data.registration ? `GST/HST Registration No.: ${data.registration}` : ''
  ].filter(Boolean).join('\n');
}
