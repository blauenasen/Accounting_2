<!-- File: src/lib/components/InvoiceLetter.svelte -->
<svelte:head>
  <link rel="stylesheet" href="/css/letter.css">
</svelte:head>

<script lang="ts">
  interface Receiver {
    name: string;
    adress1: string;
    adress2: string;
    adress3: string;
    email: string;
  }

  interface Position {
    pos: number;
    service: string;
    description: string;
    tax: number;
    qty: number;
    rate: number;
    amount: number;
  }

  interface Sender {
    firma: string;
    adress1: string;
    adress2: string;
    email: string;
    registration: string;
  }

  let sender: Sender = {
    firma: '[firma]',
    adress1: '[Adress1]',
    adress2: '[Adress2]',
    email: '[email]',
    registration: '[registration]'
  };

  export let receiver: Receiver = {
    name: '[info]',
    adress1: '[adress1]',
    adress2: '[adress2]',
    adress3: '[adress3]',
    email: '[email]'
  };

  export let offerNumber: string = '[I-yyyy-num]';
  export let offerDate: string = '[MM/DD/YYYY]';
  export let estimateNumber: string = '';

  export let positions: Position[] = [
    { pos: 1, service: '[Service]', description: '[Description]', tax: 5.00, qty: 100.00, rate: 500.00, amount: 10000.00 }
  ];

  export let subtotal: number = 10000.00;
  export let gst: number = 550.00;
  export let total: number = 10550.00;

  async function loadStammdaten(): Promise<void> {
    try {
      const res = await fetch('/stammdaten');
      if (!res.ok) throw new Error('Error loading master data');
      const data = await res.json();
      sender = {
        ...sender,
        firma: data.firma ?? sender.firma,
        adress1: data.adress1 ?? sender.adress1,
        adress2: data.adress2 ?? sender.adress2,
        email: data.email ?? sender.email,
        registration: data.registration ?? sender.registration
      };
    } catch {
      // Silent fail, use defaults
    }
  }
  loadStammdaten();

  function formatNumber(value: number): string {
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatCurrency(value: number): string {
    return `${formatNumber(value)} $`;
  }
</script>

<div class="page-wrapper">
  <div class="a4-container">
    <div class="content">
      <div class="sender">
        <strong>{sender.firma}</strong><br />
        {sender.adress1}<br />
        {sender.adress2}
      </div>

      <div class="receiver">
        {receiver.name}<br />
        {receiver.adress1}<br />
        {receiver.adress2}<br />
        {receiver.adress3}<br />
        {receiver.email}
      </div>

      <div class="Estimate-num">INVOICE No.: {offerNumber}</div>
      <div class="date">DATE:&nbsp;&nbsp;{offerDate}</div>
      {#if estimateNumber}
        <div class="estimate-ref">Service based on Estimate-No {estimateNumber}</div>
      {/if}

      <div class="intro-text">INVOICE<br /></div>

      <table class="positions">
        <thead>
          <tr>
            <th class="col-pos">POS</th>
            <th class="col-service">SERVICE</th>
            <th class="col-description">DESCRIPTION</th>
            <th class="col-tax">GST %</th>
            <th class="col-qty">QTY</th>
            <th class="col-rate">RATE</th>
            <th class="col-amount">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {#each positions as p}
            <tr>
              <td class="col-pos">{p.pos}</td>
              <td class="col-service">{p.service}</td>
              <td class="col-description">{p.description}</td>
              <td class="col-tax">{formatNumber(p.tax)}</td>
              <td class="col-qty">{formatNumber(p.qty)}</td>
              <td class="col-rate">{formatCurrency(p.rate)}</td>
              <td class="col-amount">{formatCurrency(p.amount)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="positions-footer-line"></div>

      <div class="totals">
        <div class="totals-row">
          <span class="label">Subtotal:</span>
          <span class="value">{formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
          <span class="label">GST:</span>
          <span class="value">{formatCurrency(gst)}</span>
        </div>
        <div class="total-separator"></div>
        <div class="totals-row grand-total">
          <span class="label">Total:</span>
          <span class="value">{formatCurrency(total)}</span>
        </div>
      </div>

      <div class="footer-text">
        The invoice amount is based on the services rendered and is subject to applicable taxes.<br />
        Additional services requested will be billed separately.
      </div>
    </div>
  </div>
</div>
