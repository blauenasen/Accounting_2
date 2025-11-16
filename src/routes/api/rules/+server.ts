import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import {
  listCompanyCodes,
  listRuleNumbers,
  listRulesWithItems,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  companyCodeExists,
  listItemsByRule,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  listDistinctCategories
} from '$lib/server/booking/rules-store.js';
import {
  ACCOUNT_SOURCES,
  getDatasetBySource
} from '$lib/server/booking/account-sources.js';

const HK_DENIED_CATEGORIES = new Set(['DEBTOR', 'CREDITOR']);
const CK_DENIED_CATEGORIES = new Set(['AUFWAND', 'ERLOESE']);

interface SuccessResponseBody {
  ok: true;
  [key: string]: unknown;
}

interface ErrorResponseBody {
  ok: false;
  error: string;
}

type ApiResponseBody = SuccessResponseBody | ErrorResponseBody;

function toOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
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
  const text = String(value).trim().toLowerCase();
  return text === '1' || text === 'true' || text === 'yes';
}

function normalizeSide(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const upper = value.trim().toUpperCase();
  if (upper === 'HK' || upper === 'CK') {
    return upper;
  }
  return null;
}

function normalizeCategory(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim().toUpperCase();
}

function normalizeDescription(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const text = String(value);
  return text.length > 500 ? text.slice(0, 500) : text;
}

function normalizeSource(value: unknown): string | null {
  if (!value) {
    return ACCOUNT_SOURCES.SKR;
  }
  const lower = String(value).trim().toLowerCase();
  if (lower === ACCOUNT_SOURCES.SKR || lower === 'ledgers') {
    return ACCOUNT_SOURCES.SKR;
  }
  if (lower === ACCOUNT_SOURCES.DEBTORS) {
    return ACCOUNT_SOURCES.DEBTORS;
  }
  if (lower === ACCOUNT_SOURCES.CREDITORS) {
    return ACCOUNT_SOURCES.CREDITORS;
  }
  return null;
}

function ensureCompanyCode(no: number | null): void {
  if (!Number.isFinite(no) || (no as number) < 0) {
    throw new Error('INVALID_BOOK_CIRCLE');
  }
  if (!companyCodeExists(no as number)) {
    throw new Error('COMPANY_CODE_NOT_FOUND');
  }
}

function ensureSideCategoryConsistency(side: string, category: string): void {
  if (!category) {
    return;
  }
  if (side === 'HK' && HK_DENIED_CATEGORIES.has(category)) {
    throw new Error('CATEGORY_NOT_ALLOWED_FOR_SIDE');
  }
  if (side === 'CK' && CK_DENIED_CATEGORIES.has(category)) {
    throw new Error('CATEGORY_NOT_ALLOWED_FOR_SIDE');
  }
}

function validateRulePayload(
  payload: Record<string, unknown>,
  { expectId = false } = {}
): Record<string, unknown> {
  const idRule = expectId ? toOptionalInt(payload?.id_rule ?? payload?.id) : null;
  if (expectId && !Number.isFinite(idRule)) {
    throw new Error('RULE_ID_REQUIRED');
  }

  const no = toOptionalInt(payload?.no ?? payload?.bookCircle ?? payload?.companyCode);
  ensureCompanyCode(no);

  const side = normalizeSide(payload?.side);
  if (!side) {
    throw new Error('RULE_SIDE_REQUIRED');
  }

  const category = normalizeCategory(payload?.category);
  const accountMin = toOptionalInt(payload?.account_min ?? payload?.accountMin);
  const accountMax = toOptionalInt(payload?.account_max ?? payload?.accountMax);

  if (Number.isFinite(accountMin) && Number.isFinite(accountMax) && (accountMax as number) < (accountMin as number)) {
    throw new Error('ACCOUNT_RANGE_INVALID');
  }

  if (!category && !Number.isFinite(accountMin) && !Number.isFinite(accountMax)) {
    throw new Error('RULE_NEEDS_CATEGORY_OR_RANGE');
  }

  ensureSideCategoryConsistency(side, category);

  const active = toBoolean(payload?.active ?? true);
  const description = normalizeDescription(payload?.description);

  return {
    id_rule: idRule ?? null,
    no,
    side,
    category,
    account_min: Number.isFinite(accountMin) ? accountMin : null,
    account_max: Number.isFinite(accountMax) ? accountMax : null,
    active,
    description
  };
}

function ensureRuleExists(idRule: number | null): void {
  const rule = getRuleById(idRule as number);
  if (!rule) {
    throw new Error('RULE_NOT_FOUND');
  }
}

function datasetKey(entry: Record<string, unknown>): string | null {
  if (!entry) return null;
  if (Number.isFinite(entry.account)) {
    return `account:${entry.source}:${entry.account}`;
  }
  if (entry.category) {
    return `category:${entry.source}:${entry.category}`;
  }
  return null;
}

function ensureItemUniqueness(
  list: unknown[],
  candidate: Record<string, unknown>,
  skipId: number | null = null
): void {
  const keys = new Set<string>();
  for (const item of list) {
    if (skipId && (item as any).id_item === skipId) {
      continue;
    }
    const key = datasetKey(item as Record<string, unknown>);
    if (key) {
      keys.add(key);
    }
  }
  const candidateKey = datasetKey(candidate);
  if (candidateKey && keys.has(candidateKey)) {
    throw new Error('RULE_ITEM_DUPLICATE');
  }
}

function ensureAccountInSource(source: string, account: number): boolean {
  const dataset = getDatasetBySource(source);
  return dataset.some((entry) => entry.account === account);
}

function validateItemPayload(
  payload: Record<string, unknown>,
  { expectId = false } = {}
): Record<string, unknown> {
  const idItem = expectId ? toOptionalInt(payload?.id_item ?? payload?.id) : null;
  if (expectId && !Number.isFinite(idItem)) {
    throw new Error('RULE_ITEM_ID_REQUIRED');
  }

  const idRule = toOptionalInt(payload?.id_rule ?? payload?.rule);
  if (!Number.isFinite(idRule)) {
    throw new Error('RULE_ID_REQUIRED');
  }
  ensureRuleExists(idRule);

  const rule = getRuleById(idRule as number);
  if (!rule) {
    throw new Error('RULE_NOT_FOUND');
  }

  const source = normalizeSource(payload?.source);
  if (!source) {
    throw new Error('RULE_ITEM_SOURCE_REQUIRED');
  }

  const account = toOptionalInt(payload?.account);
  const category = normalizeCategory(payload?.category);

  if (Number.isFinite(account) && category) {
    throw new Error('RULE_ITEM_AMBIGUOUS');
  }
  if (!Number.isFinite(account) && !category) {
    throw new Error('RULE_ITEM_INCOMPLETE');
  }

  if (Number.isFinite(account)) {
    if (!ensureAccountInSource(source, account as number)) {
      throw new Error('RULE_ITEM_ACCOUNT_UNKNOWN');
    }
  }

  ensureSideCategoryConsistency(rule.side, category);

  return {
    id_item: idItem ?? null,
    id_rule: idRule,
    source,
    account: Number.isFinite(account) ? account : null,
    category: category || ''
  };
}

function respondOk(data: Record<string, unknown>): Response {
  return json<SuccessResponseBody>({ ok: true, ...data });
}

function respondError(error: Error | string, status = 400): Response {
  const message = typeof error === 'string' ? error : error?.message || 'UNKNOWN_ERROR';
  return json<ErrorResponseBody>({ ok: false, error: message }, { status });
}

export function GET({ url }: RequestEvent): Response {
  try {
    const scope = url.searchParams.get('scope');
    if (scope === 'codes') {
      const codes = listCompanyCodes();
      const ruleNos = listRuleNumbers();
      const knownNos = new Set(codes.map((entry) => entry.no));
      const extras = ruleNos.filter((no) => !knownNos.has(no));
      const supplement = extras.map((no) => ({
        no,
        textcode: no === 0 ? 'Global Rules' : `Book Circle ${no}`,
        available: true
      }));
      return respondOk({ codes: [...codes, ...supplement] });
    }

    if (scope === 'sources') {
      const skr = getDatasetBySource(ACCOUNT_SOURCES.SKR);
      const debtors = getDatasetBySource(ACCOUNT_SOURCES.DEBTORS);
      const creditors = getDatasetBySource(ACCOUNT_SOURCES.CREDITORS);
      const categories = listDistinctCategories();
      return respondOk({
        sources: {
          [ACCOUNT_SOURCES.SKR]: skr,
          [ACCOUNT_SOURCES.DEBTORS]: debtors,
          [ACCOUNT_SOURCES.CREDITORS]: creditors
        },
        categories
      });
    }

    const no = toOptionalInt(url.searchParams.get('no'));
    ensureCompanyCode(no);
    const rules = listRulesWithItems(no as number);
    return respondOk({ rules });
  } catch (error) {
    return respondError(error as Error, 400);
  }
}

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = payload?.action;
    if (!action) {
      throw new Error('ACTION_REQUIRED');
    }

    switch (action) {
      case 'create-rule': {
        const data = validateRulePayload(payload) as any;
        const created = createRule(data);
        return respondOk({ rule: created });
      }
      case 'update-rule': {
        const data = validateRulePayload(payload, { expectId: true }) as any;
        ensureRuleExists(data.id_rule);
        const updated = updateRule(data.id_rule, data);
        return respondOk({ rule: updated });
      }
      case 'delete-rule': {
        const idRule = toOptionalInt(payload?.id_rule ?? payload?.id);
        if (!Number.isFinite(idRule)) {
          throw new Error('RULE_ID_REQUIRED');
        }
        ensureRuleExists(idRule);
        deleteRule(idRule as number);
        return respondOk({ deleted: true });
      }
      case 'create-item': {
        const data = validateItemPayload(payload) as any;
        const existing = listItemsByRule(data.id_rule);
        ensureItemUniqueness(existing, data);
        const created = createItem(data);
        return respondOk({ item: created });
      }
      case 'update-item': {
        const data = validateItemPayload(payload, { expectId: true }) as any;
        const existing = listItemsByRule(data.id_rule);
        ensureItemUniqueness(existing, data, data.id_item);
        ensureRuleExists(data.id_rule);
        const updated = updateItem(data.id_item, data);
        return respondOk({ item: updated });
      }
      case 'delete-item': {
        const idItem = toOptionalInt(payload?.id_item ?? payload?.id);
        if (!Number.isFinite(idItem)) {
          throw new Error('RULE_ITEM_ID_REQUIRED');
        }
        const item = getItemById(idItem as number);
        if (!item) {
          throw new Error('RULE_ITEM_NOT_FOUND');
        }
        deleteItem(idItem as number);
        return respondOk({ deleted: true });
      }
      default:
        throw new Error('ACTION_UNKNOWN');
    }
  } catch (error) {
    const message = (error as Error)?.message ?? 'RULES_ACTION_FAILED';
    const status = message.endsWith('_REQUIRED') || message.includes('NOT_ALLOWED') || message.includes('INVALID') || message.includes('UNKNOWN') || message.includes('DUPLICATE') ? 400 : 500;
    return respondError(message, status);
  }
}
