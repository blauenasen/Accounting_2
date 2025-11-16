<!-- src/lib/components/SendStatusBadge.svelte -->
<script lang="ts">
  type MailStatus = 'sent_pending' | 'delivered' | 'bounce' | 'failed' | 'complaint' | 'deferred' | null;
  type BadgeKind = 'ok' | 'err' | 'warn' | 'info';

  export let status: MailStatus = null;
  export let compact: boolean = false;
  export let title: string = '';

  const LABELS: Record<string, string> = {
    delivered: 'Delivered',
    bounce: 'Bounce',
    failed: 'Failed',
    complaint: 'Complaint',
    deferred: 'Deferred',
    sent_pending: 'Sent (pending)'
  };

  function labelOf(s: MailStatus): string {
    const v = String(s || '').toLowerCase();
    return LABELS[v] || 'Pending';
  }

  function kindOf(s: MailStatus): BadgeKind {
    const v = String(s || '').toLowerCase();
    if (v === 'delivered') return 'ok';
    if (v === 'bounce' || v === 'failed' || v === 'complaint') return 'err';
    if (v === 'deferred') return 'warn';
    return 'info';
  }

  $: kind = kindOf(status);
  $: ariaText = `Mail status: ${labelOf(status)}`;
</script>

<span
  class="badge {kind} {compact ? 'compact' : ''}"
  role="status"
  aria-live="polite"
  aria-label={ariaText}
  title={title || ariaText}
>
  {#if kind === 'ok'}
    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7Z" />
    </svg>
  {:else if kind === 'err'}
    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3.5 13.1-1.4 1.4L12 13.4l-2.1 2.1-1.4-1.4L10.6 12 8.5 9.9l1.4-1.4L12 10.6l2.1-2.1 1.4 1.4L13.4 12l2.1 2.1Z" />
    </svg>
  {:else if kind === 'warn'}
    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.9 2.7a2 2 0 0 0-3.8 0L1.2 18a2 2 0 0 0 1.9 2.8h17.8a2 2 0 0 0 1.9-2.8L12.9 2.7Zm-.9 5.3h0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm0 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
  {:else}
    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 10.4V7h-2v6h5v-2h-3Z" />
    </svg>
  {/if}
  <span class="txt">{labelOf(status)}</span>
  {#if String(status || '').toLowerCase() === 'delivered'}
    <svg class="ico lock" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-2a3 3 0 1 1 6 0v2H9V7Zm8 11H7v-7h10v7Z" />
    </svg>
  {/if}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    line-height: 1;
    border: 1px solid #ddd;
    background: #f7f7f7;
    color: #333;
    user-select: none;
    white-space: nowrap;
  }
  .badge.compact {
    padding: 4px 8px;
    font-size: 11px;
  }
  .ico {
    width: 14px;
    height: 14px;
    fill: currentColor;
    flex: 0 0 auto;
  }
  .ico.lock {
    opacity: 0.8;
    margin-left: 2px;
  }
  .txt {
    font-weight: 600;
  }

  /* Variants */
  .badge.ok {
    background: #e7f6ec;
    border-color: #bde5c8;
    color: #237a3b;
  }
  .badge.err {
    background: #fdecec;
    border-color: #f2bcbc;
    color: #a33;
  }
  .badge.warn {
    background: #fff6e5;
    border-color: #f5d9a8;
    color: #8a5a00;
  }
  .badge.info {
    background: #eef4ff;
    border-color: #cfe0ff;
    color: #2b5fb8;
  }
</style>
