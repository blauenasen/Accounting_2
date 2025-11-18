<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import Menu from '$lib/+menu.svelte';
  import { browser } from '$app/environment';
  // import TooltipAdminHost from '$lib/components/TooltipAdminHost.svelte';
  import ToastContainer from '$lib/components/ToastContainer.svelte';

  // Import global styles from design system
  import '$lib/styles/variables.css';
  import '$lib/styles/global.css';
  import '$lib/styles/components/buttons.css';
  import '$lib/styles/components/forms.css';
  import '$lib/styles/components/tables.css';
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Menu />

<slot />

{#if browser}
  <!-- <TooltipAdminHost /> -->
  <ToastContainer />
{/if}
