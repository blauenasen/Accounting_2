/**
 * File: src/lib/server/email/appendToSent.ts
 * IMAP APPEND without chatty logs; flags correctly as array; reliable "Sent" mailbox detection
 */

import { ImapFlow } from 'imapflow';
import { getEmailAccount } from '$lib/server/index.js';

interface MailboxInfo {
  path: string;
  specialUse?: string;
}

interface AppendOptions {
  raw: Buffer;
  flags?: string[];
  date?: Date;
}

function pickSentMailbox(list: MailboxInfo[]): string {
  // Prefer "Sent" or "\Sent"-marked, otherwise "Sent Items"
  const byFlag = list.find((m) => (m.specialUse || '').toLowerCase() === '\\sent');
  if (byFlag) return byFlag.path;

  const exactSent = list.find((m) => m.path === 'Sent');
  if (exactSent) return exactSent.path;

  const sentItems = list.find((m) => m.path === 'Sent Items');
  if (sentItems) return sentItems.path;

  // Fallback: first match with "Sent" in name
  const fuzzy = list.find((m) => /sent/i.test(m.path));
  return fuzzy ? fuzzy.path : 'Sent';
}

export async function appendRawToSent({
  raw,
  flags = ['\\Seen'],
  date = new Date()
}: AppendOptions): Promise<void> {
  const acc = getEmailAccount();
  if (!acc || !acc.user || !acc.pass || !acc.host) {
    throw new Error('IMAP config missing');
  }

  const client = new ImapFlow({
    host: acc.imapHost || acc.host.replace(/^smtp\./i, 'imap.'),
    port: acc.imapPort || 993,
    secure: true,
    auth: { user: acc.user, pass: acc.pass },
    logger: false as any // NO logs to terminal
  });

  try {
    await client.connect();
    const listResult = await client.list();
    const list: MailboxInfo[] = Array.isArray(listResult) ? listResult : [];
    const sentPath = pickSentMailbox(list);

    const lock = await client.getMailboxLock(sentPath).catch(async () => {
      // Create if needed (some providers allow CREATE)
      await client.mailboxCreate(sentPath).catch(() => {});
      return client.getMailboxLock(sentPath);
    });

    try {
      await client.append(sentPath, raw, flags, { internalDate: date });
    } finally {
      lock.release();
    }
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}
