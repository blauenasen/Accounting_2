<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import Menu from '$lib/+menu.svelte';
  import { browser } from '$app/environment';
  import TooltipAdminHost from '$lib/components/TooltipAdminHost.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Menu />

<slot />

{#if browser}
  <TooltipAdminHost />
  <ToastContainer />
{/if}
