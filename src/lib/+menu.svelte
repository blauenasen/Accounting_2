<!-- File: src/lib/+menu.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import '$lib/all.css'; // CSS imported as module
</script>

<header class="menu-bar">
  <div class="menu-logo">
    <a href="/">
      <img src="/img/logo.png" alt="Company Logo" class="logo" />
    </a>
  </div>
  <nav class="menu-nav">
    <a href="/estimate" class={$page.url.pathname === '/estimate' ? 'active' : ''}>
      Estimate
    </a>
    <a href="/invoice" class={$page.url.pathname === '/invoice' ? 'active' : ''}>
      Invoice
    </a>
    <a href="/rates" class={$page.url.pathname === '/rates' ? 'active' : ''}>
      Rates
    </a>
    <a href="/debtors" class={$page.url.pathname === '/debtors' ? 'active' : ''}>
      Debtors
    </a>
    <a href="/creditors" class={$page.url.pathname === '/creditors' ? 'active' : ''}>
      Creditors
    </a>
    <a href="/booking" class={$page.url.pathname === '/booking' ? 'active' : ''}>
      Booking
    </a>
    <a href="/show-account" class={$page.url.pathname === '/show-account' ? 'active' : ''}>
      Show-Account
    </a>
    <a href="/account-debtors" class={$page.url.pathname === '/account-debtors' ? 'active' : ''}>
      Account-Debtors
    </a>
    <a
      href="/account-creditors"
      class={$page.url.pathname === '/account-creditors' ? 'active' : ''}
    >
      Account-Creditors
    </a>
    <a href="/opos-debtors" class={$page.url.pathname === '/opos-debtors' ? 'active' : ''}>
      OPOS-Debtors
    </a>
    <a href="/opos-creditors" class={$page.url.pathname === '/opos-creditors' ? 'active' : ''}>
      OPOS-Creditors
    </a>
    <a href="/tax-account" class={$page.url.pathname === '/tax-account' ? 'active' : ''}>
      Tax-Account
    </a>
    <a href="/total-balance" class={$page.url.pathname === '/total-balance' ? 'active' : ''}>
      Total-Balance
    </a>
    <a href="/profit-less" class={$page.url.pathname === '/profit-less' ? 'active' : ''}>
      Profit-Less
    </a>
    <a href="/ledgers" class={$page.url.pathname === '/ledgers' ? 'active' : ''}>
      Ledgers
    </a>
    <a href="/login" class={$page.url.pathname === '/login' ? 'active' : ''}>
      Login
    </a>
  </nav>
</header>
