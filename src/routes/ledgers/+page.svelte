<!-- Modul: src/routes/ledgers/+page.svelte -->

<script lang="ts">
  import '$lib/all.css';
  import LedgerAccounts from '$lib/components/ledgers/LedgerAccounts.svelte';
  import LedgerCompanyCodes from '$lib/components/ledgers/LedgerCompanyCodes.svelte';
  import LedgerRules from '$lib/components/ledgers/LedgerRules.svelte';

  interface Account {
    active: boolean;
    available: boolean;
  }

  let accountsVersion = 0;
  let companyCodesVersion = 0;
  let allAccounts: Account[] = [];

  if (typeof window !== 'undefined') {
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    if (navType === 'reload') {
      localStorage.setItem('ledgers-chart-open', 'true');
      sessionStorage.removeItem('ledgers-circle-open');
      sessionStorage.removeItem('ledgers-rules-open');
    }
  }

  $: availableAccounts = allAccounts.filter((entry) => entry.active && entry.available);

  function handleAccountsUpdate(event: CustomEvent) {
    const list = Array.isArray(event?.detail?.accounts) ? event.detail.accounts : [];
    allAccounts = list;
  }

  function handleAccountsChanged() {
    accountsVersion += 1;
  }

  function handleCompanycodesChanged() {
    companyCodesVersion += 1;
  }

</script>

<div class="ledgers-admin">
  <header class="page-header">
    <h1>LEDGERS – Management interface</h1>
    <p class="page-subtitle">Maintain accounts, book circles and booking rules in one interface..</p>
  </header>

  <LedgerAccounts on:update={handleAccountsUpdate} on:changed={handleAccountsChanged} />

  <LedgerCompanyCodes
    accounts={availableAccounts}
    on:changed={handleCompanycodesChanged}
  />

  <LedgerRules
    accountsVersion={accountsVersion}
    companyCodesVersion={companyCodesVersion}
  />
</div>

<style>
  .ledgers-admin {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .page-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
  }

  .page-subtitle {
    margin: 6px 0 0;
    font-size: 14px;
    color: #4b5563;
  }
</style>
