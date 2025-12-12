<!-- Homepage - Master Data (Stammdaten) -->
<script lang="ts">
  import { onMount } from 'svelte';

  // SvelteKit props (suppress warnings)
  export let params: any = undefined;

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

  let showOfferPreview = true; // später durch Rechteverwaltung ersetzen

  async function laden(): Promise<void> {
    console.log('SCRIPT STARTED');
    try {
      const res = await fetch('/api/stammdaten');
      const data = await res.json();
      console.log('API-Daten:', data); // Kontrolle im Browser-DevTools
      stammdaten = data;
    } catch (error) {
      console.error('Failed to load Stammdaten:', error);
    }
  }

  function ladeStammdaten(): void {
    laden();
  }

  // Automatisch beim Laden ausführen → erst nach Definition!
  onMount(() => {
    ladeStammdaten();
  });
</script>

<svelte:head>
  <title>Welcome - Apelt Accounting</title>
</svelte:head>

<h1>Welcome to Apelt Accounting</h1>

<h3>Master data</h3>

{#if stammdaten}
  <p><span class="label">Company</span> <span class="value">{stammdaten.firma}</span></p>
  <p><span class="label">Address 1</span> <span class="value">{stammdaten.adress1}</span></p>
  <p><span class="label">Address 2</span> <span class="value">{stammdaten.adress2}</span></p>
  <p><span class="label">E-Mail</span> <span class="value">{stammdaten.email}</span></p>
  <p>
    <span class="label">Tax ID:</span>
    <span class="value">{Number(stammdaten.tax).toFixed(2)} %</span>
  </p>
  <p>
    <span class="label">Commercial Register</span>
    <span class="value">{stammdaten.registration}</span>
  </p>
{:else}
  <p>No data loaded.</p>
{/if}

<button type="button" on:click={() => location.reload()}>Reload Manually</button>

{#if showOfferPreview}
  <button type="button" on:click={() => window.open('/offer?preview=1', '_blank')}>
    Offer Preview
  </button>
{/if}

