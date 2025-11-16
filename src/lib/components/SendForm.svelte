<!-- File: src/lib/components/SendForm.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let open: boolean = false;
  export let idInvoice: number | null = null;
  export let to: string = '';
  export let bcc: string = '';
  export let subject: string = '';
  export let note: string = '';
  export let postTo: string = '/send-invoice';

  let pending: boolean = false;
  let error: string = '';
  let dialogEl: HTMLDivElement;
  let firstInput: HTMLInputElement;

  const dispatch = createEventDispatcher();

  function normEmail(v: string): string {
    const s = String(v || '').trim().toLowerCase();
    if (!s) return '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : '';
  }

  function splitEmails(v: string): string[] {
    return String(v || '')
      .split(/[;,]\s*/g)
      .map(normEmail)
      .filter(Boolean);
  }

  function isValid(): boolean {
    const toOk = !!normEmail(to);
    const subjOk = String(subject || '').trim().length > 0;
    return toOk && subjOk && idInvoice != null;
  }

  function close(): void {
    if (pending) return;
    dispatch('cancel');
  }

  function onBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget && !pending) close();
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && !pending) {
      e.preventDefault();
      close();
    }
  }

  onMount(() => {
    if (open && firstInput) {
      setTimeout(() => firstInput?.focus(), 0);
    }
  });

  $: if (open && firstInput && !pending) {
    setTimeout(() => firstInput?.focus(), 0);
  }

  async function onSubmit(): Promise<void> {
    if (!isValid() || pending) return;
    pending = true;
    error = '';
    try {
      const payload = {
        id_invoice: Number(idInvoice),
        to: [normEmail(to)],
        ...(bcc ? { bcc: splitEmails(bcc) } : {}),
        subject: String(subject || '').trim(),
        body_text: String(note || '').trim()
      };

      const res = await fetch(postTo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      dispatch('sent', data);
      dispatch('cancel');
      setTimeout(() => window.location.reload(), 0);
    } catch (e: unknown) {
      error = (e instanceof Error ? e.message : 'Sending failed');
      dispatch('error', { message: error });
    } finally {
      pending = false;
    }
  }
</script>

{#if open}
  <div class="overlay" role="presentation" on:click={onBackdropClick} on:keydown={onKeyDown}>
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sendform-title"
      tabindex="0"
      bind:this={dialogEl}
    >
      <form class="form" on:submit|preventDefault={onSubmit}>
        <h2 id="sendform-title">Send &amp; Commit</h2>

        <div class="field">
          <label for="to">To</label>
          <input
            id="to"
            bind:this={firstInput}
            bind:value={to}
            placeholder="name@example.com"
            disabled={pending}
            autocomplete="off"
          />
        </div>

        <div class="field">
          <label for="bcc">BCC</label>
          <input
            id="bcc"
            bind:value={bcc}
            placeholder="bcc1@example.com, bcc2@example.com"
            disabled={pending}
            autocomplete="off"
          />
        </div>

        <div class="field">
          <label for="subject">Subject</label>
          <input
            id="subject"
            bind:value={subject}
            placeholder="Subject"
            disabled={pending}
            autocomplete="off"
          />
        </div>

        <div class="field">
          <label for="note">Body</label>
          <textarea
            id="note"
            rows="8"
            bind:value={note}
            placeholder="Dear …&#10;&#10;Enclosed you will find my invoice…&#10;&#10;Best regards"
            disabled={pending}
          ></textarea>
        </div>

        {#if error}<div class="error">{error}</div>{/if}

        <div class="actions">
          <button type="submit" class="send" disabled={pending || !isValid()}>Send &amp; Commit</button>
          <button type="button" class="cancel" on:click={close} disabled={pending}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal {
    width: 740px;
    max-width: 92vw;
    background: #fff;
    color: #000;
    border-radius: 6px;
    padding: 12px;
    font-family: Helvetica, Arial, sans-serif;
  }
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .field {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 8px;
    align-items: center;
  }
  label {
    text-align: right;
    font-size: 13px;
  }
  input,
  textarea {
    width: 100%;
    border: 1px solid #ccc;
    padding: 6px 8px;
    font: inherit;
    font-size: 13px;
    background: #fff;
    color: #000;
  }
  textarea {
    resize: vertical;
    min-height: 120px;
    white-space: pre-wrap;
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 6px;
  }
  .send {
    background: #136b4a;
    color: #fff;
    border: 1px solid #0f5132;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  .cancel {
    background: #eee;
    color: #000;
    border: 1px solid #bbb;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  .error {
    color: #b00020;
    font-size: 12px;
    margin-left: 100px;
  }
</style>
