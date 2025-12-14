// File: src/routes/print-invoice/+server.ts
import puppeteer from 'puppeteer';
import Invoice from '$lib/components/invoice.svelte';
import type { RequestEvent } from '@sveltejs/kit';

/* ---------- types ---------- */

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  sender: {
    name: string;
    line1: string;
    line2: string;
  };
  receiver: {
    name: string;
    line1: string;
    line2: string;
    line3: string;
    email: string;
  };
  positions: Array<{
    pos: number;
    service: string;
    description: string;
    tax: number;
    qty: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  gst: number;
  total: number;
  estimateNumber: string;
}

/* ---------- helpers ---------- */

function fmtUS(dateLike: string | Date | null | undefined): string {
  if (!dateLike) return '';
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(String(dateLike))) {
    const [dd, mm, yyyy] = String(dateLike).split('.');
    return `${mm}/${dd}/${yyyy}`;
  }
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

async function safeJson(fetchFn: typeof fetch, url: string): Promise<any> {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------- data assembly ---------- */

async function buildInvoiceData(event: RequestEvent): Promise<InvoiceData> {
  const { url, fetch } = event;
  const q = url.searchParams;

  const id_invoice = Number(q.get('id') ?? q.get('id_invoice') ?? 0) || 0;
  let year = (q.get('year') ?? '').toString();
  let num = (q.get('num') ?? '').toString();
  const dateParam = q.get('date') ?? '';

  // Load invoice list to resolve header
  const invoices = (await safeJson(fetch, '/api/invoices')) || [];
  const header = Array.isArray(invoices)
    ? invoices.find((r: any) => Number(r?.id_invoice) === id_invoice)
    : null;

  if (header) {
    year ||= String(header.year ?? '');
    num ||= String(header.num ?? '');
  }

  const invoiceNumber = `I-${year}-${num}`;
  const invoiceDate = fmtUS(dateParam || header?.date || new Date());

  // Debtor details
  let receiver = { name: '', adress1: '', adress2: '', adress3: '', email: '' };
  if (header?.account != null) {
    const debtors = (await safeJson(fetch, '/api/debtors')) || [];
    const d = Array.isArray(debtors)
      ? debtors.find((x: any) => Number(x.account) === Number(header.account))
      : null;
    if (d) {
      const name =
        [d.salutation, d.name].filter(Boolean).join(' ').trim() ||
        d.name1 ||
        d.name2 ||
        '';
      receiver = {
        name,
        adress1: d.adress1 ?? d.address1 ?? '',
        adress2: d.adress2 ?? d.address2 ?? '',
        adress3: d.adress3 ?? d.address3 ?? '',
        email: d.email ?? ''
      };
    }
  }
  const receiverCompat = {
    name: receiver.name,
    line1: receiver.adress1,
    line2: receiver.adress2,
    line3: receiver.adress3,
    email: receiver.email
  };

  // Sender
  let sender = { name: 'Apelts Painting', line1: '45 Chaparral St SE', line2: 'Calgary AB T2X 0J2' };
  const stammdaten = await safeJson(fetch, '/api/stammdaten');
  if (stammdaten) {
    const line1 = [stammdaten.strasse, stammdaten.hausnr].filter(Boolean).join(' ').trim();
    const line2 = [stammdaten.plz, stammdaten.ort].filter(Boolean).join(' ').trim();
    sender = {
      name: stammdaten.firma || sender.name,
      line1: line1 || sender.line1,
      line2: line2 || sender.line2
    };
  }

  // Lines
  const rawLines = (await safeJson(fetch, `/api/invoices/${id_invoice}/lines`)) || [];
  const positions = (Array.isArray(rawLines) ? rawLines : [])
    .map((r: any, i: number) => {
      const qty = Number(r?.qty ?? r?.quantity ?? 0);
      const rate = Number(r?.rate ?? 0);
      const amount = Number(r?.amount ?? qty * rate);
      const tax = Number(r?.tax ?? r?.gst ?? r?.gst_pct ?? 0);
      return {
        pos: Number(r?.pos ?? r?.position ?? i + 1),
        service: r?.service ?? r?.text1 ?? '',
        description: r?.description ?? r?.text2 ?? '',
        tax,
        qty,
        rate,
        amount
      };
    })
    .sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));

  // Totals
  const subtotal = positions.reduce((s, r) => s + Number(r.amount || 0), 0);
  const globalPct = Number(stammdaten?.gst ?? stammdaten?.gst_pct ?? 0) || 0;
  const gst = positions.reduce((s, r) => {
    const pct = (r.tax != null ? Number(r.tax) : globalPct) || 0;
    return s + (Number(r.amount || 0) * pct) / 100;
  }, 0);
  const total = subtotal + gst;

  return {
    invoiceNumber,
    invoiceDate,
    sender,
    receiver: receiverCompat,
    positions,
    subtotal,
    gst,
    total,
    estimateNumber: header?.estimateNr || ''
  };
}

/* ---------- HTML shell ---------- */

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

/* ---------- endpoint ---------- */

export async function GET(event: RequestEvent): Promise<Response> {
  const { url } = event;

  const data = await buildInvoiceData(event);

  const rendered = Invoice.render({
    sender: data.sender,
    receiver: data.receiver,
    offerNumber: data.invoiceNumber,
    offerDate: data.invoiceDate,
    estimateNumber: data.estimateNumber,
    positions: data.positions,
    subtotal: data.subtotal,
    gst: data.gst,
    total: data.total
  });
  const html = rendered.html;

  if ((url.searchParams.get('view') ?? '') === 'html') {
    return new Response(wrapHtml(url.origin, html), {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(wrapHtml(url.origin, html), { waitUntil: 'networkidle0' });

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

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '20mm', left: '0mm', right: '0mm' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate
    });

    const filename = `${data.invoiceNumber} Date ${data.invoiceDate || fmtUS(new Date())}.pdf`;

    return new Response(pdf, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${filename}"`
      }
    });
  } finally {
    await browser.close();
  }
}
