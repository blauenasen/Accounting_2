<!-- File: src/lib/components/invoice/invoiceTotalsBox.svelte -->
<script>
  // Eingaben
  export let totals = { subtotal: 0, gstSum: 0, gstPct: 0, total: 0 };

  // Geldformat wie in +page.svelte
  const moneyNF = new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoney = (n) => `${moneyNF.format(Number(n || 0))} $`;
</script>

<div style="display:grid; grid-template-columns:auto 120px; column-gap:8px; row-gap:4px; font-size:13px; color:#000;">
  <div style="text-align:right;">Subtotal</div>
  <div style="text-align:right; white-space:nowrap;">{fmtMoney(totals.subtotal)}</div>

  <div style="text-align:right;">GST @ {moneyNF.format(Number(totals.gstPct || 0))} %</div>
  <div style="text-align:right; white-space:nowrap;">{fmtMoney(totals.gstSum)}</div>

  <div style="text-align:right; font-weight:700;">Total</div>
  <div style="text-align:right; white-space:nowrap; font-weight:700;">{fmtMoney(totals.total)}</div>
</div>
