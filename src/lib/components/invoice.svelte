<!-- File: src/lib/components/invoice.svelte -->
<script lang="ts">
  // Props (compatible with offer.svelte; both naming variants supported)
  export let sender: { name: string; line1: string; line2: string } = {
    name: 'Apelts Painting',
    line1: '45 Chaparral St SE',
    line2: 'Calgary AB T2X 0J2'
  };
  export let receiver: { name: string; line1: string; line2: string; line3: string; email: string } = {
    name: '',
    line1: '',
    line2: '',
    line3: '',
    email: ''
  };

  // Prefers invoiceNumber/invoiceDate; fallback to offerNumber/offerDate
  export let invoiceNumber: string = '';
  export let invoiceDate: string = ''; // MM/DD/YYYY
  export let offerNumber: string = '';
  export let offerDate: string = '';
  export let estimateNumber: string = '';

  export let positions: Array<{
    pos?: number;
    service?: string;
    description?: string;
    tax?: number;
    qty?: number;
    rate?: number;
    amount?: number;
  }> = [];
  export let subtotal: number = 0;
  export let gst: number = 0;
  export let total: number = 0;

  const nf = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (n: number): string => `${nf.format(Number(n || 0))} $`;

  $: numberText = String(invoiceNumber || offerNumber || '');
  $: dateText = String(invoiceDate || offerDate || '');
</script>

<link rel="stylesheet" href="/css/offer.css" />

<div class="offer-root">
  <div class="a4-container">
    <!-- Header (only visible on page 1; following pages show thead) -->
    <div class="offer-header">
      <div class="leftcol">
        <div class="sender">
          <div class="s-name">{sender.name}</div>
          <div class="s-line">{sender.line1}</div>
          <div class="s-line">{sender.line2}</div>
        </div>
        <div class="receiver">
          <div class="r-name">{receiver.name}</div>
          {#if receiver.line1}<div class="r-line">{receiver.line1}</div>{/if}
          {#if receiver.line2}<div class="r-line">{receiver.line2}</div>{/if}
          {#if receiver.line3}<div class="r-line">{receiver.line3}</div>{/if}
          {#if receiver.email}
            <div class="r-line"><a class="email" href={`mailto:${receiver.email}`}>{receiver.email}</a></div>
          {/if}
        </div>
      </div>

      <div class="rightcol">
        <img class="logo" src="/img/logo.png" alt="Company logo" />
        <div class="meta">
          <div class="title">INVOICE</div>
          <div class="meta-row"><span class="lbl">INVOICE No.:</span><span class="val">{numberText}</span></div>
          <div class="meta-row"><span class="lbl">DATE:</span><span class="val">{dateText}</span></div>
          {#if estimateNumber}
            <div class="meta-row estimate-ref">
              <span class="lbl"></span><span class="val">Service based on Estimate-No {estimateNumber}</span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="offer-body">
      <div class="table-box">
        <table class="pos-table">
          <thead>
            <tr>
              <th class="th-pos">POS</th>
              <th class="th-service">SERVICE</th>
              <th class="th-desc">DESCRIPTION</th>
              <th class="th-tax">GST %</th>
              <th class="th-qty">QTY</th>
              <th class="th-rate">RATE</th>
              <th class="th-amount">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {#each positions as r, i}
              <tr>
                <td class="td-pos">{r?.pos ?? i + 1}</td>
                <td class="td-service">{r?.service ?? ''}</td>
                <td class="td-desc">{r?.description ?? ''}</td>
                <td class="td-tax">{Number(r?.tax ?? 0).toFixed(2)}</td>
                <td class="td-qty">{Number(r?.qty ?? 0).toFixed(2)}</td>
                <td class="td-rate">{money(r?.rate ?? 0)}</td>
                <td class="td-amount">{money(r?.amount ?? Number(r?.qty ?? 0) * Number(r?.rate ?? 0))}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer (only after table, last page) -->
    <div class="offer-footer">
      <div class="totals">
        <div class="row"><span class="lbl">Subtotal</span><span class="val">{money(subtotal)}</span></div>
        <div class="row"><span class="lbl">GST</span><span class="val">{money(gst)}</span></div>
        <div class="row total"><span class="lbl">Total</span><span class="val">{money(total)}</span></div>
      </div>

      <div class="note">
        The invoice reflects services rendered and amounts due at the time of billing. Additional services will be
        listed separately.
      </div>
    </div>
  </div>
</div>
