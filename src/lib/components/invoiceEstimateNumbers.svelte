<!-- File: src/lib/components/invoice/invoiceEstimateNumbers.svelte -->
<script>
  // Eingaben
  export let estimateNr1 = '';
  export let estimateNr2 = '';

  // Layout-Konstanten (vom Parent übergeben)
  export let frameTop = 140;
  export let frameHeight = 700;
  export let rightLeft = 0;
  export let rightWidth = 300;
  export let leftWidth = 300;

  // Berechnung der gemeinsamen Top-Position
  $: topPos = frameTop + frameHeight + 6;
</script>

<!-- Anzeige estimateNr1 (links unten) -->
<label style="position:absolute; top:{topPos}px; left:10px; width:{leftWidth}px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">estimateNr1</span>
  <input
    type="text"
    value={estimateNr1}
    readonly
    style="width:100%; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left;"
  />
</label>

<!-- Anzeige estimateNr2 (rechts unten) -->
<label style="position:absolute; top:{topPos}px; left:{rightLeft}px; width:{rightWidth}px;">
  <span style="display:block; padding-left:4px; margin-bottom:2px;">estimateNr2</span>
  <input
    type="text"
    value={estimateNr2}
    readonly
    style="width:100%; height:28px; background-color:#f5f5f5; border:1px solid #ccc; padding:4px; text-align:left;"
  />
</label>
