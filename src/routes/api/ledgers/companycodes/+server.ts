import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import {
  listCompanyCodes,
  createCompanyCode,
  updateCompanyCode,
  deleteCompanyCode,
  type CompanyCode,
  type CompanyCodePayload
} from '$lib/server/companycodes.js';
import { getAccount } from '$lib/server/booking/accounts-store.js';

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

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

// Validation Functions
function validateAccount(account: unknown): number | null {
  const numeric = toOptionalInt(account);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const entry = getAccount(numeric!);
  if (!entry) {
    throw new Error('BOOK_CIRCLE_ACCOUNT_UNKNOWN');
  }
  if (!entry.active) {
    throw new Error('BOOK_CIRCLE_ACCOUNT_INACTIVE');
  }
  if (!entry.available && !entry.active) {
    throw new Error('BOOK_CIRCLE_ACCOUNT_UNAVAILABLE');
  }
  return numeric;
}

interface CompanyCodeRequestPayload {
  action?: string;
  idcode?: unknown;
  id?: unknown;
  no?: unknown;
  textcode?: unknown;
  account?: unknown;
  available?: unknown;
}

interface NormalizedCompanyCode {
  no: number;
  textcode: string;
  available: boolean;
  account: number | null;
  idcode?: number;
}

function normalizePayload(payload: CompanyCodeRequestPayload, mode: 'create' | 'update'): NormalizedCompanyCode {
  const textcode = normalizeText(payload?.textcode);
  if (!textcode) {
    throw new Error('BOOK_CIRCLE_TEXTCODE_REQUIRED');
  }

  const available = toBoolean(payload?.available ?? true);
  const account = validateAccount(payload?.account);
  const no = toOptionalInt(payload?.no);

  if (!Number.isFinite(no) || no! < 0) {
    throw new Error('BOOK_CIRCLE_NO_INVALID');
  }

  const result: NormalizedCompanyCode = {
    no: no!,
    textcode,
    available,
    account
  };

  if (mode === 'update') {
    const id = toOptionalInt(payload?.idcode ?? payload?.id);
    if (!Number.isFinite(id)) {
      throw new Error('BOOK_CIRCLE_ID_REQUIRED');
    }
    result.idcode = id!;
  }

  return result;
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
export function GET(_: RequestEvent): Response {
  try {
    const codes = listCompanyCodes();
    return respondOk({ codes });
  } catch (error) {
    return respondError(error, 500);
  }
}

// POST Handler
export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const payload = (await request.json()) as CompanyCodeRequestPayload;
    const action = payload?.action;

    if (!action) {
      throw new Error('ACTION_REQUIRED');
    }

    switch (action) {
      case 'create': {
        const values = normalizePayload(payload, 'create');
        const created = createCompanyCode({
          no: values.no,
          textcode: values.textcode,
          account: values.account,
          available: values.available
        });
        return respondOk({ entry: created });
      }

      case 'update': {
        const values = normalizePayload(payload, 'update');
        const updated = updateCompanyCode(values.idcode!, {
          no: values.no,
          textcode: values.textcode,
          account: values.account,
          available: values.available
        });
        return respondOk({ entry: updated });
      }

      case 'delete': {
        const id = toOptionalInt(payload?.idcode ?? payload?.id);
        if (!Number.isFinite(id)) {
          throw new Error('BOOK_CIRCLE_ID_REQUIRED');
        }
        if (!deleteCompanyCode(id!)) {
          throw new Error('BOOK_CIRCLE_DELETE_FAILED');
        }
        return respondOk({ deleted: true });
      }

      default:
        throw new Error('ACTION_UNKNOWN');
    }
  } catch (error) {
    const message = (error as any)?.message ?? 'BOOK_CIRCLE_ACTION_FAILED';
    const status = message.startsWith('BOOK_CIRCLE_') ||
      message === 'ACTION_UNKNOWN' ||
      message === 'ACTION_REQUIRED'
      ? 400
      : 500;
    return respondError(message, status);
  }
}
