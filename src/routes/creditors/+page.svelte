<!-- Modul: src/routes/creditors/+page.svelte -->

<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/styles/pages/creditors.css';

  interface Creditor {
    account: number;
    salutation?: string;
    name: string;
    adress1?: string;
    adress2?: string;
    adress3?: string;
    email?: string;
    blocked: number | string;
    info?: string;
  }

  let rows: Creditor[] = [];
  let selectedIndex: number | null = null;
  let saving = false;

  let showAll = false;

  let account = '';
  let salutation = '';
  let name = '';
  let adress1 = '';
  let adress2 = '';
  let adress3 = '';
  let email = '';
  let blocked = '0';

  let original_account: number | null = null;

  $: canSave = account.trim() !== '' && name.trim() !== '';
  $: isUpdate = selectedIndex !== null;

  async function ladeCreditors() {
    try {
      const url = showAll ? '/creditors?all=1' : '/creditors';
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      rows = await res.json();
    } catch (err) {
      alert('Error loading creditors');
    }
  }

  async function showOnlyActive() {
    showAll = false;
    await ladeCreditors();
  }

  async function showAllEntries() {
    showAll = true;
    await ladeCreditors();
  }

  function handleClick(i: number) {
    selectedIndex = i;
    const d = rows[i];
    account = String(d.account ?? '');
    salutation = d.salutation ?? '';
    name = d.name ?? '';
    adress1 = d.adress1 ?? '';
    adress2 = d.adress2 ?? '';
    adress3 = d.adress3 ?? '';
    email = d.email ?? '';
    blocked = String(d.blocked ?? '0');
    original_account = d.account ?? null;
  }

  async function resetForm() {
    selectedIndex = null;
    account = '';
    salutation = '';
    name = '';
    adress1 = '';
    adress2 = '';
    adress3 = '';
    email = '';
    blocked = '0';
    original_account = null;
    showAll = false;
    await ladeCreditors();
  }

  async function speichern() {
    if (!account.trim() || !name.trim()) {
      alert('Please fill in account and name.');
      return;
    }

    if (selectedIndex === null) {
      const accNum = parseInt(account, 10);
      if (isNaN(accNum) || accNum < 70000 || accNum > 99999) {
        alert('Account number must be an integer between 70000 and 99999.');
        return;
      }
      const hit = rows.find(r => String(r.account) === String(accNum));
      if (hit) {
        let msg = 'Number already taken';
        if (hit.blocked === 1 || hit.blocked === '1') msg += ' and was hidden';
        alert(msg);
        return;
      }
    }

    if (!confirm('Save or update creditor?')) return;

    saving = true;
    try {
      const payload = {
        _update: selectedIndex !== null,
        original_account,
        account: parseInt(account, 10),
        salutation,
        name,
        adress1,
        adress2,
        adress3,
        email,
        OPBereich: 'OP',
        OPArt: 'Debitor',
        filterNo: 20,
        blocked: selectedIndex === null ? 0 : parseInt(blocked || '0', 10)
      };

      const res = await fetch('/creditors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error saving');
      await res.json();
      alert('Saved!');
      await ladeCreditors();
      await resetForm();
    } catch (err) {
      alert('Error saving');
    } finally {
      saving = false;
    }
  }

  async function loeschen() {
    if (selectedIndex === null) return alert('Please select an entry first.');
    if (!confirm('Are you sure you want to deactivate this entry?')) return;
    try {
      const acc = rows[selectedIndex].account;
      const res = await fetch(`/creditors?account=${encodeURIComponent(acc)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deactivating');
      alert('Entry deactivated!');
      await ladeCreditors();
      await resetForm();
    } catch (err) {
      alert('Error deactivating');
    }
  }

  onMount(ladeCreditors);
</script>

<h1 class="creditors-header">CREDITORS</h1>

<div class="creditors-button-container">
  <button style="background-color:#28a745;color:#fff"
          on:click={speichern}
          disabled={saving || !canSave}>
    {saving ? 'Save...' : (selectedIndex === null ? 'New' : 'Update')}
  </button>
  <button style="background-color:#dc3545;color:#fff" on:click={loeschen}>Deactivation</button>
  <button style="background-color:#666;color:#fff" on:click={resetForm}>Reset</button>
  <button style="background-color:#007bff;color:#fff" on:click={showOnlyActive}>Show only active</button>
  <button style="background-color:#6c757d;color:#fff" on:click={showAllEntries}>Show all</button>
</div>

<div class="creditors-inputs">
  <label>Account
    <input type="text" bind:value={account} placeholder="-- mandatory field --" />
  </label>

  <label>Salutation
    <input type="text" bind:value={salutation} placeholder="-- optional field --" />
  </label>

  <label>Name
    <input type="text" bind:value={name} placeholder="-- mandatory field --" />
  </label>

  <label>Address 1
    <input type="text" bind:value={adress1} placeholder="-- optional field --" />
  </label>

  <label>Address 2
    <input type="text" bind:value={adress2} placeholder="-- optional field --" />
  </label>

  <label>Address 3
    <input type="text" bind:value={adress3} placeholder="-- optional field --" />
  </label>

  <label>E-Mail
    <input type="text" bind:value={email} placeholder="-- optional field --" />
  </label>

  <label>Blocked
    <select bind:value={blocked} disabled={!isUpdate}>
      <option value="0">0</option>
      <option value="1">1</option>
    </select>
  </label>
</div>

<div class="creditors-table-container">
  <table class="creditors-table">
    <thead>
      <tr>
        <th>Account</th>
        <th>Info</th>
        <th>Address 1</th>
        <th>Address 2</th>
        <th>Address 3</th>
        <th>E-Mail</th>
        <th>Blocked</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as d, i}
        <tr class:selected={i === selectedIndex}
            class:blocked-row={(d.blocked === 1) || (d.blocked === '1')}
            on:click={() => handleClick(i)}>
          <td>{d.account}</td>
          <td>{d.info}</td>
          <td>{d.adress1}</td>
          <td>{d.adress2}</td>
          <td>{d.adress3}</td>
          <td>{d.email}</td>
          <td>{d.blocked}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
