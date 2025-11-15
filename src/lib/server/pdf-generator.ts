// src/lib/server/pdf-generator.ts
import puppeteer from 'puppeteer';
import { render } from 'svelte/server';
import Invoice from '$lib/components/invoice.svelte';
import { db } from './index.js';
import type { Browser, Page } from 'puppeteer';

/**
 * Invoice sender information
 */
interface InvoiceSender {
  name: string;
  line1: string;
  line2: string;
}

/**
 * Invoice receiver/debtor information
 */
interface InvoiceReceiver {
  name: string;
  line1: string;
  line2: string;
  line3: string;
  email: string;
}

/**
 * Invoice line item/position
 */
interface InvoicePosition {
  pos: number;
  service: string;
  description: string;
  tax: number;
  qty: number;
  rate: number;
  amount: number;
}

/**
 * Complete invoice data for PDF generation
 */
interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  sender: InvoiceSender;
  receiver: InvoiceReceiver;
  positions: InvoicePosition[];
  subtotal: number;
  gst: number;
  total: number;
  estimateNumber: string;
}

/**
 * Format date to US format (MM/DD/YYYY)
 * @param dateLike Date string or date-like value
 * @returns Formatted date string
 */
function fmtUS(dateLike: unknown): string {
  if (!dateLike) return '';
  if (typeof dateLike === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(dateLike)) {
    const [dd, mm, yyyy] = dateLike.split('.');
    return `${mm}/${dd}/${yyyy}`;
  }
  const d = new Date(String(dateLike));
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Builds invoice data from database for PDF generation
 * @param id_invoice The invoice ID
 * @returns Invoice data object
 */
async function buildInvoiceData(id_invoice: number): Promise<InvoiceData> {
  const header = db.prepare(`
    SELECT * FROM invoice WHERE id_invoice = ?
  `).get(id_invoice) as Record<string, unknown> | undefined;

  if (!header) {
    throw new Error(`Invoice ${id_invoice} not found`);
  }

  const year = String(header.year ?? '');
  const num = String(header.num ?? '');
  const invoiceNumber = `I-${year}-${num}`;
  const invoiceDate = fmtUS(header.date || new Date());

  let receiver: InvoiceReceiver = { name: '', line1: '', line2: '', line3: '', email: '' };
  if (header.account != null) {
    const debtor = db.prepare(`
      SELECT * FROM debtors WHERE account = ?
    `).get(Number(header.account)) as Record<string, unknown> | undefined;

    if (debtor) {
      const name = [debtor.salutation, debtor.name].filter(Boolean).join(' ').trim() ||
        String(debtor.name1 || debtor.name2 || '');
      receiver = {
        name,
        line1: String(debtor.adress1 ?? debtor.address1 ?? ''),
        line2: String(debtor.adress2 ?? debtor.address2 ?? ''),
        line3: String(debtor.adress3 ?? debtor.address3 ?? ''),
        email: String(debtor.email ?? '')
      };
    }
  }

  let sender: InvoiceSender = { name: 'Apelts Painting', line1: '45 Chaparral St SE', line2: 'Calgary AB T2X 0J2' };
  const stammdaten = db.prepare(`SELECT * FROM stammdaten LIMIT 1`).get() as Record<string, unknown> | undefined;
  if (stammdaten) {
    const line1 = [stammdaten.strasse, stammdaten.hausnr].filter(Boolean).join(' ').trim();
    const line2 = [stammdaten.plz, stammdaten.ort].filter(Boolean).join(' ').trim();
    sender = {
      name: String(stammdaten.firma || sender.name),
      line1: line1 || sender.line1,
      line2: line2 || sender.line2
    };
  }

  const rawLines = db.prepare(`
    SELECT
      d.id_line,
      d.id_invoice,
      d.id_rate,
      r.service,
      COALESCE(d.description, r.description) AS description,
      d.qty,
      r.rate,
      (d.qty * r.rate) AS amount
    FROM invoice_db d
    LEFT JOIN rates r ON d.id_rate = r.id_rate
    WHERE d.id_invoice = ?
    ORDER BY d.id_line
  `).all(id_invoice) as Array<Record<string, unknown>>;

  const globalPct = Number(stammdaten?.gst ?? stammdaten?.gst_pct ?? stammdaten?.tax ?? 0) || 0;

  const positions: InvoicePosition[] = rawLines.map((r, i) => {
    const qty = Number(r?.qty ?? 0);
    const rate = Number(r?.rate ?? 0);
    const amount = Number(r?.amount ?? qty * rate);
    return {
      pos: i + 1,
      service: String(r?.service ?? ''),
      description: String(r?.description ?? ''),
      tax: globalPct,
      qty,
      rate,
      amount
    };
  });

  const subtotal = positions.reduce((s, r) => s + Number(r.amount || 0), 0);
  const gst = positions.reduce((s, r) => {
    const pct = (r.tax != null ? Number(r.tax) : globalPct) || 0;
    return s + (Number(r.amount || 0) * pct) / 100;
  }, 0);
  const total = subtotal + gst;

  return {
    invoiceNumber,
    invoiceDate,
    sender,
    receiver,
    positions,
    subtotal,
    gst,
    total,
    estimateNumber: String(header?.estimateNr || '')
  };
}

/**
 * Wrap HTML body with full document structure
 * @param origin Base URL for assets
 * @param htmlBody HTML body content
 * @returns Complete HTML document
 */
function wrapHtml(origin: string, htmlBody: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <base href="${origin}/" />
  <link rel="stylesheet" href="/css/offer.css" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice</title>
</head>
<body>
  ${htmlBody}
</body>
</html>`;
}

/**
 * Generates a PDF buffer for the given invoice
 * @param id_invoice The invoice ID
 * @param origin Base URL for assets (CSS)
 * @returns PDF as Buffer
 */
export async function generateInvoicePdfBuffer(id_invoice: number, origin: string = 'http://localhost:5173'): Promise<Buffer> {
  const data = await buildInvoiceData(id_invoice);

  const { html } = render(Invoice, {
    props: {
      sender: data.sender,
      receiver: data.receiver,
      offerNumber: data.invoiceNumber,
      offerDate: data.invoiceDate,
      estimateNumber: data.estimateNumber,
      positions: data.positions,
      subtotal: data.subtotal,
      gst: data.gst,
      total: data.total
    }
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(wrapHtml(origin, html), { waitUntil: 'networkidle0' });

    await page.addStyleTag({
      content: `
        @page { size: A4; margin: 0 }
        html,body{margin:0;padding:0;background:#fff}
      `
    });

    const footerTemplate = `
      <div style="width:100%; font-size:10px; text-align:center; padding:4mm 0; color:#444;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`;

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '20mm', left: '0mm', right: '0mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
