<!-- Modul: src/lib/components/LetterPreview.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Letter from '$lib/components/InvoiceLetter.svelte';

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

  export let top: number = 140;
  export let left: number = 0;
  export let idKey: string = '';
  export let receiver: Receiver = { name: '', adress1: '', adress2: '', adress3: '', email: '' };
  export let offerNumber: string = '';
  export let offerDate: string = '';
  export let estimateNumber: string = '';
  export let positions: Position[] = [];
  export let subtotal: number = 0;
  export let gst: number = 0;
  export let total: number = 0;

  const NATURAL_W = 794;
  const NATURAL_H = 1123;

  let letterScale = 1;
  let letterWidth = NATURAL_W;
  let letterHeight = NATURAL_H;

  function computeLetterSize(): void {
    const winW = (typeof window !== 'undefined') ? window.innerWidth : NATURAL_W;
    const winH = (typeof window !== 'undefined') ? window.innerHeight : NATURAL_H;
    const rightGutter = 20;
    const availW = Math.max(200, winW - left - rightGutter);
    const availH = Math.max(200, winH - top - 20);
    const scale = Math.min(0.9, availW / NATURAL_W, availH / NATURAL_H);
    letterScale = scale;
    letterWidth = NATURAL_W * scale;
    letterHeight = NATURAL_H * scale;
  }

  onMount(() => {
    computeLetterSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', computeLetterSize);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', computeLetterSize);
    }
  });
</script>

<div style="position:absolute; top:{top}px; left:{left}px; width:{letterWidth}px; height:{letterHeight}px; z-index:5; pointer-events:none;">
  <div style="position:absolute; left:0; top:0; width:{NATURAL_W}px; height:{NATURAL_H}px; transform:scale({letterScale}); transform-origin:0 0;">
    {#key idKey}
      <Letter
        receiver={receiver}
        offerNumber={offerNumber}
        offerDate={offerDate}
        estimateNumber={estimateNumber}
        positions={positions}
        subtotal={subtotal}
        gst={gst}
        total={total}
      />
    {/key}
  </div>
</div>
