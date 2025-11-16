// src/lib/stores/mailStatus.ts
// Client Store für Send-&-Commit Flow (Dialogzustand + Zustellstatus)
// - mailStatus (Svelte store): { open, idInvoice, to, subject, bcc, note, pending, error, status, messageId, provider }
// - openSendDialog(payload)
// - closeSendDialog()
// - applySendResponse(serverResponse)
// - startPolling() / stopPolling()

import { writable, get, type Writable } from 'svelte/store';

interface MailStatusState {
  open: boolean;
  idInvoice: number | null;
  to: string;
  subject: string;
  bcc: string;
  note: string;
  pending: boolean;
  error: string;
  status: 'sent_pending' | 'delivered' | 'bounce' | 'failed' | 'complaint' | 'deferred' | null;
  messageId: string | null;
  provider: string | null;
}

interface SendResponse {
  ok?: boolean;
  id_invoice?: number;
  idInvoice?: number;
  messageId?: string;
  messageID?: string;
  provider?: string;
  error?: string;
  [key: string]: unknown;
}

const INITIAL: MailStatusState = {
  open: false,
  idInvoice: null,
  to: '',
  subject: '',
  bcc: '',
  note: '',
  pending: false,
  error: '',
  status: null,
  messageId: null,
  provider: null
};

const TERMINAL = new Set(['delivered', 'bounce', 'failed', 'complaint']);

const _store: Writable<MailStatusState> = writable({ ...INITIAL });

let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastPolledFor: number | null = null;

export const mailStatus = {
  subscribe: _store.subscribe
};

export function openSendDialog(payload: Partial<MailStatusState> = {}): void {
  stopPolling();
  _store.set({
    ...INITIAL,
    open: true,
    ...payload,
    pending: false,
    error: ''
  });
}

export function closeSendDialog(): void {
  _store.update((s) => ({ ...s, open: false }));
}

export function applySendResponse(resp: SendResponse = {}): void {
  const idInvoice = Number(resp?.id_invoice ?? resp?.idInvoice ?? 0) || get(_store).idInvoice || null;
  const messageId = (resp?.messageId || resp?.messageID || '').toString() || null;
  const provider = (resp?.provider || 'smtp').toString();

  _store.update((s) => ({
    ...s,
    pending: false,
    error: '',
    idInvoice,
    messageId: messageId || s.messageId,
    provider,
    status: 'sent_pending'
  }));

  startPolling();
}

export function setSendError(msg: string = ''): void {
  _store.update((s) => ({ ...s, error: String(msg || ''), pending: false }));
}

export function startPolling(intervalMs: number = 4000): void {
  stopPolling();
  const { idInvoice } = get(_store);
  if (!idInvoice) return;

  lastPolledFor = idInvoice;
  pollTimer = setInterval(pollOnce, Math.max(1500, intervalMs));
  pollOnce();
}

export function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  lastPolledFor = null;
}

interface EventResponse {
  events?: Array<{
    status?: string;
    provider?: string;
    messageId?: string;
  }>;
}

async function pollOnce(): Promise<void> {
  const { idInvoice } = get(_store);
  if (!idInvoice || (lastPolledFor && lastPolledFor !== idInvoice)) {
    stopPolling();
    return;
  }

  try {
    const res = await fetch(`/email/events/${encodeURIComponent(idInvoice)}?latest=1`, {
      cache: 'no-store'
    });
    const data = (await res.json().catch(() => ({}))) as EventResponse;
    const ev = Array.isArray(data?.events) ? data.events[0] : null;

    if (!res.ok || !ev) return;

    const status = (ev.status || '').toString().toLowerCase() || null;
    _store.update((s) => ({
      ...s,
      status: (status || s.status) as MailStatusState['status'],
      provider: ev.provider || s.provider,
      messageId: ev.messageId || s.messageId
    }));

    if (status && TERMINAL.has(status)) {
      stopPolling();
    }
  } catch {
    // Silent fail, retry next iteration
  }
}
