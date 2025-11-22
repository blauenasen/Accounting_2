<script lang="ts">
  interface Address {
    name: string;
    line1: string;
    line2: string;
    line3?: string;
    email?: string;
  }

  interface Position {
    pos?: number;
    service?: string;
    description?: string;
    tax?: string | number;
    qty?: string | number;
    rate?: string | number;
    amount?: string | number;
  }

  // Props
  export let sender: Address = { name: 'Apelts Painting', line1: '45 Chaparral St SE', line2: 'Calgary AB T2X 0J2' };
  export let receiver: Partial<Address> = { name: '', line1: '', line2: '', line3: '', email: '' };
  export let offerNumber = '';
  export let offerDate = ''; // MM/DD/YYYY

  export let positions: Position[] = [];
  export let subtotal = 0;
  export let gst = 0;
  export let total = 0;

  const nf = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (n: string | number): string => `${nf.format(Number(n || 0))} $`;
</script>

<link rel="stylesheet" href="/css/offer.css" />

<div class="offer-root">
  <div class="a4-container">
    <!-- Header (only visual on page 1; subsequent pages show table header via thead) -->
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
          {#if receiver.email}<div class="r-line"><a class="email" href={`mailto:${receiver.email}`}>{receiver.email}</a></div>{/if}
        </div>
      </div>

      <div class="rightcol">
        <img class="logo" src="/img/logo.png" alt="Company logo" />
        <div class="meta">
          <div class="title">ESTIMATE</div>
          <div class="meta-row"><span class="lbl">ESTIMATE No.:</span><span class="val">{offerNumber}</span></div>
          <div class="meta-row"><span class="lbl">DATE:</span><span class="val">{offerDate}</span></div>
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
                <td class="td-pos">{r?.pos ?? (i + 1)}</td>
                <td class="td-service">{r?.service ?? ''}</td>
                <td class="td-desc">{r?.description ?? ''}</td>
                <td class="td-tax">{Number(r?.tax ?? 0).toFixed(2)}</td>
                <td class="td-qty">{Number(r?.qty ?? 0).toFixed(2)}</td>
                <td class="td-rate">{money(r?.rate)}</td>
                <td class="td-amount">{money(r?.amount ?? (Number(r?.qty ?? 0) * Number(r?.rate ?? 0)))}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer (last page, flows after the table) -->
    <div class="offer-footer">
      <div class="totals">
        <div class="row"><span class="lbl">Subtotal</span><span class="val">{money(subtotal)}</span></div>
        <div class="row"><span class="lbl">GST</span><span class="val">{money(gst)}</span></div>
        <div class="row total"><span class="lbl">Total</span><span class="val">{money(total)}</span></div>
      </div>

      <div class="note">
        The estimate provided is based on the information given at the time of the estimate, and is subject to change. Additional services requested will be listed separately.
      </div>
    </div>
  </div>
</div>
