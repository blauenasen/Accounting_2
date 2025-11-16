/**
 * File: src/lib/server/email/index.ts
 * Aggregator for email functions (production modules only, NO debug)
 */

export {
  verifySmtpConnection,
  sendInvoiceEmail,
  pdfBufferToAttachment,
  type Attachment
} from './provider.js';

export {
  buildSubject,
  buildBodyText,
  buildBodyHtml,
  buildInvoiceNr,
  buildEstimateNr,
  type SubjectOptions,
  type BodyOptions
} from './composeInvoiceMail.js';

export {
  ensureSchema,
  nowIso,
  upsertEvent,
  tryResolveInvoiceId,
  lockInvoiceCascade
} from './eventStore.js';

export { appendRawToSent } from './appendToSent.js';

export { buildDsn, applyDsn, type DsnOpts, type DsnResult } from './dsn.js';

export { sendAndCommitInvoice } from './sendAndCommitInvoice.js';
