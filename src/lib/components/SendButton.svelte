<!-- Modul: src/lib/components/SendButton.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SendForm from '$lib/components/SendForm.svelte';
  import { applySendResponse } from '$lib/stores/mailStatus';

  export let idInvoice: number | null = null;
  export let to: string = '';
  export let subject: string = '';
  export let bcc: string = '';
  export let note: string = '';
  export let disabled: boolean = false;
  export let postTo: string = '/send-invoice';

  const dispatch = createEventDispatcher();

  let open: boolean = false;
  let pending: boolean = false;
  let error: string = '';

  function openDialog(): void {
    if (disabled) return;
    error = '';
    open = true;
  }

  function onCancel(): void {
    if (pending) return;
    open = false;
  }

  function onSent(e: CustomEvent): void {
    const data = e?.detail || {};
    applySendResponse(data);
    dispatch('sent', data);
    open = false;
  }

  function onError(e: CustomEvent): void {
    error = e?.detail?.message || 'Send failed';
  }
</script>

<button class="btn primary" type="button" on:click={openDialog} disabled={disabled}>
  Send &amp; Commit
</button>

<SendForm
  bind:open
  bind:pending
  bind:error
  idInvoice={idInvoice}
  to={to}
  bcc={bcc}
  subject={subject}
  note={note}
  postTo={postTo}
  on:cancel={onCancel}
  on:sent={onSent}
  on:error={onError}
/>

<style>
  .btn {
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid #cfcfcf;
    background: #4a90e2;
    color: #fff;
    cursor: pointer;
    font-weight: 600;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
