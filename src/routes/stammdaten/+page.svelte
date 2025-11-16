<!-- routes/stammdaten/+page.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/all.css';

  interface Stammdaten {
    firma: string;
    adress1: string;
    adress2: string;
    email: string;
    tax: string | number;
    registration: string;
  }

  let stammdaten: Stammdaten = {
    firma: '',
    adress1: '',
    adress2: '',
    email: '',
    tax: '',
    registration: ''
  };

  let showOfferPreview = true;

  async function laden() {
    const res = await fetch('/stammdaten');
    const data = await res.json();
    stammdaten = data;
  }

  function ladeStammdaten() {
    laden();
  }

  onMount(() => {
    ladeStammdaten();
  });

</script>

<h3>Master data</h3>

{#if stammdaten}
  <p><span class="label">Company</span> <span class="value">{stammdaten.firma}</span></p>
  <p><span class="label">Address 1</span> <span class="value">{stammdaten.adress1}</span></p>
  <p><span class="label">Address 2</span> <span class="value">{stammdaten.adress2}</span></p>
  <p><span class="label">E-Mail</span> <span class="value">{stammdaten.email}</span></p>
  <p><span class="label">Tax ID:</span> <span class="value">{Number(stammdaten.tax).toFixed(2)} %</span></p>
  <p><span class="label">Commercial Register</span> <span class="value">{stammdaten.registration}</span></p>

{:else}
  <p>No data loaded.</p>
{/if}

<button on:click={() => location.reload()}>Reload Manually</button>

{#if showOfferPreview}
  <button on:click={() => window.open('/offer?preview=1', '_blank')}>
    Offer Preview
  </button>
{/if}
