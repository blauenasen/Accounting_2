// File: src/routes/print-offer/+server.ts
// Svelte 4 compatible version - 1:1 copy from Original with minimal adaptations
import puppeteer from 'puppeteer';
import Offer from '$lib/components/offer.svelte';
import type { RequestHandler } from './$types';

/* ---------- helpers ---------- */

function fmtUS(dateLike: any): string {
  if (!dateLike) return '';
  // accept "MM/DD/YYYY" pass-through
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateLike)) return dateLike;
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

async function buildOfferData(event: any) {
  const { url, fetch } = event;
  const q = url.searchParams;

  const id_estimate = Number(q.get('id') ?? q.get('id_estimate') ?? 0) || 0;
  let year = (q.get('year') ?? '').toString();
  let num = (q.get('num') ?? '').toString();
  const dateParam = q.get('date') ?? '';

  // Load estimate list to resolve header
  const estimates = (await safeJson(fetch, '/api/estimates')) || [];
  const header = Array.isArray(estimates)
    ? estimates.find((r: any) => Number(r?.id_estimate) === id_estimate)
    : null;

  if (header) {
    year ||= String(header.year ?? '');
    num ||= String(header.num ?? '');
  }

  const offerNumber = `E-${year}-${num}`;
  const offerDate = fmtUS(dateParam || header?.date || new Date());

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
  // provide alternate keys for component input
  const receiverCompat = {
    name: receiver.name,
    line1: receiver.adress1,
    line2: receiver.adress2,
    line3: receiver.adress3,
    email: receiver.email
  };

  // Sender (from stammdaten if available)
  let sender = { name: 'Apelts Painting', line1: '45 Chaparral St SE', line2: 'Calgary AB T2X 0J2' };
  const stammdaten = await safeJson(fetch, '/stammdaten');
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
  const rawLines = (await safeJson(fetch, `/api/estimates/${id_estimate}/lines`)) || [];
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
    .sort((a: any, b: any) => (a.pos ?? 0) - (b.pos ?? 0));

  // Totals
  const subtotal = positions.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
  const globalPct = Number(stammdaten?.gst ?? stammdaten?.gst_pct ?? 0) || 0;
  const gst = positions.reduce((s: number, r: any) => {
    const pct = (r.tax != null ? Number(r.tax) : globalPct) || 0;
    return s + (Number(r.amount || 0) * pct) / 100;
  }, 0);
  const total = subtotal + gst;

  return {
    offerNumber,
    offerDate,
    sender,
    receiver: receiverCompat,
    positions,
    subtotal,
    gst,
    total
  };
}

/* ---------- HTML shell for Puppeteer setContent ---------- */

function wrapHtml(origin: string, htmlBody: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <base href="${origin}/" />
  <link rel="stylesheet" href="/css/offer.css" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Offer</title>
</head>
<body>
  ${htmlBody}
</body>
</html>`;
}

/* ---------- endpoint ---------- */

export const GET: RequestHandler = async (event) => {
  const { url } = event;

  // Build data
  const data = await buildOfferData(event);

  // SSR to string (Svelte 4 API)
  const rendered = Offer.render({
    sender: data.sender,
    receiver: data.receiver,
    offerNumber: data.offerNumber,
    offerDate: data.offerDate,
    positions: data.positions,
    subtotal: data.subtotal,
    gst: data.gst,
    total: data.total
  });
  const html = rendered.html;

  // Debug preview
  if ((url.searchParams.get('view') ?? '') === 'html') {
    return new Response(wrapHtml(url.origin, html), {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }

  // Launch headless Chrome
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(wrapHtml(url.origin, html), { waitUntil: 'networkidle0' });

    // Minimal isolation (site chrome ausblenden – wir liefern nur Offer-Markup)
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
      margin: { top: '10mm', bottom: '20mm', left: '0mm', right: '0mm' }, // Top 10mm bleibt (Seite 1 unverändert)
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate
    });

    const filename = `${data.offerNumber} Date ${data.offerDate || fmtUS(new Date())}.pdf`;

    return new Response(pdf, {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Print offer PDF generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    await browser.close();
  }
};
