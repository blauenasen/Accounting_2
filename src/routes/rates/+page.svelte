<!-- Datei: src/routes/rates/+page.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/styles/pages/rates.css';

  interface Rate {
    id_rate: number;
    service: string;
    description: string;
    qty: number;
    rate: number;
  }

  let rates: Rate[] = [];
  let selectedIndex: number | null = null;
  let saving = false;

  let service = '';
  let description = '';
  let qty = '1.00';
  let rate = '0.00' + ' $';

  async function ladeRates() {
    try {
      const res = await fetch('/rates');
      if (!res.ok) throw new Error('Error loading rates');
      rates = await res.json();
    } catch (err) {
      alert('Error loading rates');
    }
  }

  function handleClick(index: number) {
    selectedIndex = index;
    const eintrag = rates[index];
    service = eintrag.service;
    description = eintrag.description;
    qty = parseFloat(String(eintrag.qty)).toFixed(2);
    rate = parseFloat(String(eintrag.rate)).toFixed(2) + ' $';
  }

  function resetForm() {
    selectedIndex = null;
    service = '';
    description = '';
    qty = '1.00';
    rate = '0.00'+ ' $';
  }

  async function speichern() {
    if (!confirm('Save or update rate?')) {
      return;
    }
    saving = true;
    try {
      const payload = {
        id_rate: selectedIndex !== null ? rates[selectedIndex].id_rate : null,
        service,
        description,
        qty: parseFloat(qty),
        rate: parseFloat(rate)
      };

      const res = await fetch('/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error saving');
      await res.json();
      alert('Saved!');
      await ladeRates();
      resetForm();
    } catch (error) {
      alert('Error saving');
    } finally {
      saving = false;
    }
  }

  async function loeschen() {
    if (selectedIndex === null) {
      alert('Please select an entry first.');
      return;
    }
    if (!confirm('Really delete this entry?')) return;
    try {
      const id = rates[selectedIndex].id_rate;
      const res = await fetch(`/rates?id_rate=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion error');
      alert('Entry deleted!');
      await ladeRates();
      resetForm();
    } catch (err) {
      alert('Deletion error');
    }
  }

  onMount(() => {
    ladeRates();
  });
</script>


<h1 class="rates-header">RATES</h1>

<div class="rates-button-container">
  <button class="btn-success" on:click={speichern} disabled={saving}>
    {saving ? 'Save...' : (selectedIndex === null ? 'New' : 'Update')}
  </button>
  <button class="btn-danger" on:click={loeschen}>Delete</button>
  <button class="btn-secondary" on:click={resetForm}>Reset</button>
</div>

<div class="rates-inputs">
  <label>Service:<input type="text" bind:value={service} /></label>
  <label>Description:<input type="text" bind:value={description} /></label>
  <label>QTY:<input type="text" bind:value={qty} disabled tabindex="-1" /></label>
  <label>Rate:<input type="text" bind:value={rate}/></label>
</div>

<div class="rates-table-container">
  <table class="rates-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Service</th>
        <th>Description</th>
        <th>Qty</th>
        <th>Rate</th>
      </tr>
    </thead>
    <tbody>
      {#each rates as eintrag, i}
        <tr class:selected={i === selectedIndex} on:click={() => handleClick(i)}>
          <td>{eintrag.id_rate}</td>
          <td>{eintrag.service}</td>
          <td>{eintrag.description}</td>
          <td>{parseFloat(String(eintrag.qty)).toFixed(2)}</td>
          <td>{new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(eintrag.rate)} $</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
