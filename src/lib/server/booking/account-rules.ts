// src/lib/server/booking/account-rules.ts
// Evaluates company code rules to derive allowed accounts for HK/CK selections

import db from '../index.js';
import type Database from 'better-sqlite3';
import { ACCOUNT_SOURCES, getDatasetBySource, type NormalizedAccount } from './account-sources.js';

/**
 * Valid booking sides (HK = Haben/Credit side, CK = Soll/Debit side)
 */
const VALID_SIDES = new Set(['HK', 'CK']);

/**
 * Database row structure for company code rules
 */
interface RuleRow {
  id_rule: number;
  no: number;
  side: string;
  category: string | null;
  account_min: number | null;
  account_max: number | null;
  source?: string | null;
}

/**
 * Database row structure for rule items
 */
interface RuleItemRow {
  id_item: number;
  id_rule: number;
  account: number | null;
  category: string | null;
  source: string | null;
}

/**
 * Account range specification
 */
interface AccountRange {
  min: number | null;
  max: number | null;
}

/**
 * Metadata about allowed accounts
 */
interface AccountMeta {
  total: number;
  range: {
    from: number | null;
    to: number | null;
  };
}

/**
 * Result of getAllowedAccounts
 */
export interface AllowedAccountsResult {
  accounts: NormalizedAccount[];
  meta: AccountMeta;
}

/**
 * Options for getAllowedAccounts
 */
export interface AllowedAccountsOptions {
  bookCircle?: number | string;
  no?: number | string;
  side?: string;
}

/**
 * Options for isAccountAllowed/assertAccountAllowed
 */
export interface AccountAllowedOptions {
  bookCircle: number | string;
  side: string;
  account: number | string;
  field?: string;
}

const rulesStmt = db.prepare(`
  SELECT id_rule, no, side, category, account_min, account_max
  FROM companycode_rules
  WHERE side = @side
    AND COALESCE(active, 1) = 1
    AND (no = @no OR no = 0)
  ORDER BY CASE WHEN no = @no THEN 0 ELSE 1 END, id_rule
`);

const itemsByRuleStmt = db.prepare(`
  SELECT id_item, id_rule, account, category, source
  FROM companycode_rule_items
  WHERE id_rule = ?
`);

const SOURCE_PRIORITY: Record<string, number> = {
  [ACCOUNT_SOURCES.SKR]: 1,
  [ACCOUNT_SOURCES.DEBTORS]: 2,
  [ACCOUNT_SOURCES.CREDITORS]: 3,
};

/**
 * Convert value to optional integer (null-safe)
 */
function toOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Normalize side to valid value (HK or CK)
 */
function normalizeSide(value: unknown): 'HK' | 'CK' | null {
  if (typeof value !== 'string') {
    return null;
  }
  const upper = value.trim().toUpperCase();
  return VALID_SIDES.has(upper) ? (upper as 'HK' | 'CK') : null;
}

/**
 * Normalize category to uppercase
 */
function normalizeCategory(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toUpperCase();
}

/**
 * Normalize source to valid account source constant
 */
function normalizeSource(value: unknown): string | null {
  if (!value) {
    return null;
  }
  const lower = String(value).trim().toLowerCase();
  if (lower === 'ledgers') {
    return ACCOUNT_SOURCES.SKR;
  }
  if (lower === ACCOUNT_SOURCES.SKR) {
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

/**
 * Extract and normalize account range from rule
 */
function normalizeRange(rule: RuleRow | undefined): AccountRange {
  const min = toOptionalInt(rule?.account_min);
  const max = toOptionalInt(rule?.account_max);
  return {
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
  };
}

/**
 * Filter accounts by range (min/max)
 */
function filterByRange(entries: NormalizedAccount[], range: AccountRange): NormalizedAccount[] {
  if (!entries.length || (!Number.isFinite(range.min) && !Number.isFinite(range.max))) {
    return entries;
  }
  return entries.filter((entry) => {
    if (Number.isFinite(range.min) && entry.account < range.min!) {
      return false;
    }
    if (Number.isFinite(range.max) && entry.account > range.max!) {
      return false;
    }
    return true;
  });
}

/**
 * Filter dataset by category and range
 */
function filterDataset(
  dataset: NormalizedAccount[],
  options: {
    category: string;
    range: AccountRange;
    allowCategoryFallback?: boolean;
  }
): NormalizedAccount[] {
  if (!Array.isArray(dataset) || !dataset.length) {
    return [];
  }

  const normalizedCategory = normalizeCategory(options.category);
  let working = dataset;

  if (normalizedCategory && normalizedCategory !== 'ALLE' && normalizedCategory !== 'STANDARD') {
    const categoryMatches = dataset.filter((entry) => entry.category === normalizedCategory);
    if (categoryMatches.length || !options.allowCategoryFallback) {
      working = categoryMatches;
    }
  }

  if (!working.length && options.allowCategoryFallback) {
    working = dataset;
  }

  return filterByRange(working, options.range);
}

/**
 * Infer default account sources from rule category
 */
function inferDefaultSources(rule: RuleRow | undefined): string[] {
  const category = normalizeCategory(rule?.category);
  if (category === 'DEBTOR') {
    return [ACCOUNT_SOURCES.DEBTORS];
  }
  if (category === 'CREDITOR') {
    return [ACCOUNT_SOURCES.CREDITORS];
  }
  if (category === 'ALLE' || category === 'STANDARD') {
    return [ACCOUNT_SOURCES.SKR, ACCOUNT_SOURCES.DEBTORS, ACCOUNT_SOURCES.CREDITORS];
  }
  return [ACCOUNT_SOURCES.SKR];
}

/**
 * Collect accounts from rule items (specific accounts or filtered by criteria)
 */
function collectFromItems(rule: RuleRow, items: RuleItemRow[]): NormalizedAccount[] {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  const range = normalizeRange(rule);
  const results: NormalizedAccount[] = [];

  for (const item of items) {
    const source = normalizeSource(item?.source) ?? normalizeSource(rule?.source);
    const dataset = getDatasetBySource(source ?? ACCOUNT_SOURCES.SKR);
    const itemAccount = toOptionalInt(item?.account);
    const category = normalizeCategory(item?.category) || normalizeCategory(rule?.category);

    if (Number.isFinite(itemAccount)) {
      const match = dataset.find((entry) => entry.account === itemAccount);
      if (match) {
        results.push(match);
      }
      continue;
    }

    results.push(...filterDataset(dataset, { category, range, allowCategoryFallback: true }));
  }

  return results;
}

/**
 * Collect accounts from a rule (uses items if available, otherwise infers from rule)
 */
function collectFromRule(rule: RuleRow, items: RuleItemRow[]): NormalizedAccount[] {
  if (items?.length) {
    return collectFromItems(rule, items);
  }

  const range = normalizeRange(rule);
  const category = normalizeCategory(rule?.category);
  const sources = inferDefaultSources(rule);
  const results: NormalizedAccount[] = [];

  for (const source of sources) {
    const dataset = getDatasetBySource(source);
    results.push(...filterDataset(dataset, { category, range, allowCategoryFallback: true }));
  }

  return results;
}

/**
 * Deduplicate accounts by account number, preferring SKR > Debtors > Creditors
 */
function dedupeAccounts(entries: NormalizedAccount[]): NormalizedAccount[] {
  const seen = new Map<number, NormalizedAccount>();
  for (const entry of entries) {
    if (!entry || !Number.isFinite(entry.account)) {
      continue;
    }
    const current = seen.get(entry.account);
    if (!current) {
      seen.set(entry.account, entry);
      continue;
    }
    const existingPriority = SOURCE_PRIORITY[current.source] ?? Number.POSITIVE_INFINITY;
    const nextPriority = SOURCE_PRIORITY[entry.source] ?? Number.POSITIVE_INFINITY;
    if (nextPriority < existingPriority) {
      seen.set(entry.account, entry);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.account - b.account);
}

/**
 * Compute metadata about accounts list
 */
function computeMeta(accounts: NormalizedAccount[]): AccountMeta {
  if (!accounts.length) {
    return {
      total: 0,
      range: { from: null, to: null },
    };
  }
  const numbers = accounts.map((entry) => entry.account);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return {
    total: accounts.length,
    range: { from: min, to: max },
  };
}

/**
 * Fetch rules from database for given book circle and side
 */
function fetchRules(no: number, side: string): RuleRow[] {
  try {
    return (rulesStmt.all({ no, side }) as RuleRow[]) ?? [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`account-rules.fetchRules failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * Fetch rule items from database for given rule ID
 */
function fetchItems(ruleId: number): RuleItemRow[] {
  try {
    return (itemsByRuleStmt.all(ruleId) as RuleItemRow[]) ?? [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`account-rules.fetchItems failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * Get all allowed accounts for a book circle and side (HK/CK)
 * @param options Book circle and side specification
 * @returns List of allowed accounts with metadata
 */
export function getAllowedAccounts(options: AllowedAccountsOptions = {}): AllowedAccountsResult {
  const bookCircle = toOptionalInt(options?.bookCircle ?? options?.no);
  const side = normalizeSide(options?.side);

  if (!Number.isFinite(bookCircle) || bookCircle! <= 0 || !side) {
    return {
      accounts: [],
      meta: { total: 0, range: { from: null, to: null } },
    };
  }

  const rules = fetchRules(bookCircle!, side);
  if (!rules.length) {
    return {
      accounts: [],
      meta: { total: 0, range: { from: null, to: null } },
    };
  }

  const collected: NormalizedAccount[] = [];
  for (const rule of rules) {
    const items = fetchItems(rule.id_rule);
    collected.push(...collectFromRule(rule, items));
  }

  const accounts = dedupeAccounts(collected);
  const meta = computeMeta(accounts);

  return { accounts, meta };
}

/**
 * Check if an account is allowed for a book circle and side
 * @param options Account validation parameters
 * @returns true if account is allowed, false otherwise
 */
export function isAccountAllowed(options: AccountAllowedOptions): boolean {
  const numeric = toOptionalInt(options.account);
  if (!Number.isFinite(numeric)) {
    return false;
  }
  const { accounts } = getAllowedAccounts({ bookCircle: options.bookCircle, side: options.side });
  return accounts.some((entry) => entry.account === numeric);
}

/**
 * Assert that an account is allowed, throw error if not
 * @param options Account validation parameters with optional field name
 * @throws Error if account is not permitted
 */
export function assertAccountAllowed(options: AccountAllowedOptions): void {
  if (!isAccountAllowed(options)) {
    const normalizedSide = normalizeSide(options.side) ?? 'HK';
    const field = options.field ?? 'account';
    throw new Error(`ACCOUNT_NOT_PERMITTED:${normalizedSide}:${field}:${options.account}`);
  }
}
