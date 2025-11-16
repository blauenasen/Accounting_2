import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  listAccountOptions,
  type AccountRow
} from '$lib/server/booking/accounts-store.js';
import { resetAccountCaches } from '$lib/server/booking/account-sources.js';

// API Response Types
interface SuccessResponse {
  ok: true;
  [key: string]: unknown;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Utility Functions
function toOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function normalizeUpper(value: unknown): string {
  return normalizeText(value).toUpperCase();
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

// Validation Functions
function validateAccountNumber(
  value: unknown,
  options: { allowExisting?: boolean; currentAccount?: number | null } = {}
): number {
  const numeric = toOptionalInt(value);
  if (!Number.isFinite(numeric)) {
    throw new Error('ACCOUNT_NUMBER_INVALID');
  }
  if (numeric! < 10 || numeric! > 9999) {
    throw new Error('ACCOUNT_NUMBER_RANGE');
  }
  const existing = getAccount(numeric!);
  if (existing && (!options.allowExisting || existing.account !== options.currentAccount)) {
    throw new Error('ACCOUNT_NUMBER_DUPLICATE');
  }
  return numeric!;
}

interface AccountPayload {
  action?: string;
  account?: unknown;
  current_account?: unknown;
  original_account?: unknown;
  designation?: unknown;
  designationDE?: unknown;
  designationEN?: unknown;
  category?: unknown;
  jabereich?: unknown;
  japos?: unknown;
  taxgroup?: unknown;
  active?: unknown;
  available?: unknown;
}

interface NormalizedAccount {
  account: number;
  currentAccount: number | null;
  designationDE: string;
  designationEN: string;
  category: string;
  jabereich: string;
  japos: string;
  active: boolean;
  available: boolean;
  taxgroup: string | null;
}

function normalizeAccountPayload(payload: AccountPayload, mode: 'create' | 'update'): NormalizedAccount {
  const isUpdate = mode === 'update';
  const rawAccount = payload?.account;
  const currentAccount = isUpdate
    ? toOptionalInt(payload?.current_account ?? payload?.original_account ?? rawAccount)
    : null;

  if (isUpdate) {
    if (!Number.isFinite(currentAccount)) {
      throw new Error('ACCOUNT_NUMBER_REQUIRED');
    }
    if (!getAccount(currentAccount!)) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }
  }

  const nextAccount = validateAccountNumber(rawAccount, {
    allowExisting: isUpdate,
    currentAccount: currentAccount ?? undefined
  });

  const designation = normalizeText(payload?.designation ?? payload?.designationDE);
  if (!designation) {
    throw new Error('ACCOUNT_DESIGNATION_REQUIRED');
  }

  const designationEN = normalizeText(payload?.designationEN ?? '');
  const category = normalizeUpper(payload?.category);
  const jabereich = normalizeText(payload?.jabereich);
  const japos = normalizeText(payload?.japos);
  const taxgroupRaw = normalizeText(payload?.taxgroup);
  const taxgroup = taxgroupRaw === '' ? null : taxgroupRaw;

  const active = toBoolean(payload?.active ?? true);
  const available = toBoolean(payload?.available ?? true);

  if (!active && available) {
    throw new Error('ACCOUNT_INACTIVE_CANNOT_BE_AVAILABLE');
  }

  return {
    account: nextAccount,
    currentAccount: isUpdate ? currentAccount : null,
    designationDE: designation,
    designationEN,
    category,
    jabereich,
    japos,
    active,
    available,
    taxgroup
  };
}

// Response Helpers
function respondOk(data: Record<string, unknown>): Response {
  return json<SuccessResponse>({ ok: true, ...data });
}

function respondError(error: unknown, status: number = 400): Response {
  const message = typeof error === 'string' ? error : (error as any)?.message || 'UNKNOWN_ERROR';
  return json<ErrorResponse>({ ok: false, error: message }, { status });
}

// GET Handler
export function GET({ url }: RequestEvent): Response {
  const scope = url.searchParams.get('scope');
  const availableOnly = url.searchParams.get('available') === 'true';

  try {
    if (scope === 'options') {
      return respondOk({ options: listAccountOptions() });
    }

    let accounts = listAccounts();

    if (availableOnly) {
      accounts = accounts.filter((acc) => acc.available === true && acc.active === true);
    }

    const options = listAccountOptions();
    return respondOk({ accounts, options });
  } catch (error) {
    return respondError(error, 500);
  }
}

// POST Handler
export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const payload = (await request.json()) as AccountPayload;
    const action = payload?.action;

    if (!action) {
      throw new Error('ACTION_REQUIRED');
    }

    switch (action) {
      case 'create': {
        const values = normalizeAccountPayload(payload, 'create');
        const created = createAccount({
          account: values.account,
          designationDE: values.designationDE,
          designationEN: values.designationEN,
          category: values.category,
          jabereich: values.jabereich,
          japos: values.japos,
          active: values.active,
          available: values.available,
          taxgroup: values.taxgroup || ''
        });
        resetAccountCaches();
        return respondOk({ account: created });
      }

      case 'update': {
        const values = normalizeAccountPayload(payload, 'update');
        const updated = updateAccount(values.currentAccount!, {
          account: values.account,
          designationDE: values.designationDE,
          designationEN: values.designationEN,
          category: values.category,
          jabereich: values.jabereich,
          japos: values.japos,
          active: values.active,
          available: values.available,
          taxgroup: values.taxgroup || ''
        });
        resetAccountCaches();
        return respondOk({ account: updated });
      }

      case 'delete': {
        const accountNumber = toOptionalInt(payload?.account);
        if (!Number.isFinite(accountNumber)) {
          throw new Error('ACCOUNT_NUMBER_REQUIRED');
        }
        const removed = deleteAccount(accountNumber!);
        if (!removed) {
          throw new Error('ACCOUNT_DELETE_FAILED');
        }
        resetAccountCaches();
        return respondOk({ deleted: true });
      }

      default:
        throw new Error('ACTION_UNKNOWN');
    }
  } catch (error) {
    const message = (error as any)?.message ?? 'ACCOUNT_ACTION_FAILED';
    const status = message.startsWith('ACCOUNT_') || message === 'ACTION_UNKNOWN' || message === 'ACTION_REQUIRED'
      ? 400
      : 500;
    return respondError(message, status);
  }
}
