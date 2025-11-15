// src/lib/server/booking/rules-store.ts
// Data access helpers for company code rules and rule items

import db from '../index.js';
import type Database from 'better-sqlite3';

const SOURCE_LEDGER = 'ledgers';
const SOURCE_SKR = 'skr04_accounts';

/**
 * Company code row structure
 */
export interface CompanyCode {
  no: number;
  textcode: string;
  available: boolean;
}

/**
 * Company code rule structure
 */
export interface Rule {
  id_rule: number;
  no: number;
  side: string;
  category: string;
  account_min: number | null;
  account_max: number | null;
  active: boolean;
  description: string;
}

/**
 * Rule with its items
 */
export interface RuleWithItems extends Rule {
  items: RuleItem[];
}

/**
 * Rule item structure
 */
export interface RuleItem {
  id_item: number;
  id_rule: number;
  account: number | null;
  category: string;
  source: string;
}

/**
 * Rule creation/update payload
 */
export interface RulePayload {
  no?: number;
  side: string;
  category?: string | null;
  account_min?: number | null;
  account_max?: number | null;
  active?: boolean;
  description?: string | null;
}

/**
 * Rule item creation/update payload
 */
export interface RuleItemPayload {
  id_rule?: number;
  account?: number | null;
  category?: string | null;
  source?: string | null;
}

const listCompanyCodesStmt = db.prepare(`
  SELECT no, textcode, available
  FROM companycodes
  ORDER BY no
`);

const distinctRuleNosStmt = db.prepare(`
  SELECT DISTINCT no
  FROM companycode_rules
  ORDER BY no
`);

const companyCodeExistsStmt = db.prepare(`
  SELECT 1
  FROM companycodes
  WHERE no = ?
  LIMIT 1
`);

const rulesByNoStmt = db.prepare(`
  SELECT id_rule, no, side, category, account_min, account_max, active, description
  FROM companycode_rules
  WHERE no = ?
  ORDER BY side, id_rule
`);

const ruleByIdStmt = db.prepare(`
  SELECT id_rule, no, side, category, account_min, account_max, active, description
  FROM companycode_rules
  WHERE id_rule = ?
  LIMIT 1
`);

const insertRuleStmt = db.prepare(`
  INSERT INTO companycode_rules (no, side, category, account_min, account_max, active, description)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const updateRuleStmt = db.prepare(`
  UPDATE companycode_rules
  SET side = ?,
      category = ?,
      account_min = ?,
      account_max = ?,
      active = ?,
      description = ?
  WHERE id_rule = ?
`);

const deleteRuleStmt = db.prepare(`
  DELETE FROM companycode_rules
  WHERE id_rule = ?
`);

const itemsByRuleStmt = db.prepare(`
  SELECT id_item, id_rule, account, category, source
  FROM companycode_rule_items
  WHERE id_rule = ?
  ORDER BY id_item
`);

const itemByIdStmt = db.prepare(`
  SELECT id_item, id_rule, account, category, source
  FROM companycode_rule_items
  WHERE id_item = ?
  LIMIT 1
`);

const insertItemStmt = db.prepare(`
  INSERT INTO companycode_rule_items (id_rule, account, category, source)
  VALUES (?, ?, ?, ?)
`);

const updateItemStmt = db.prepare(`
  UPDATE companycode_rule_items
  SET account = ?,
      category = ?,
      source = ?
  WHERE id_item = ?
`);

const deleteItemStmt = db.prepare(`
  DELETE FROM companycode_rule_items
  WHERE id_item = ?
`);

const deleteItemsByRuleStmt = db.prepare(`
  DELETE FROM companycode_rule_items
  WHERE id_rule = ?
`);

const distinctCategoriesStmt = db.prepare(`
  SELECT category FROM (
    SELECT DISTINCT category FROM companycode_rules WHERE category IS NOT NULL AND TRIM(category) != ''
    UNION
    SELECT DISTINCT category FROM companycode_rule_items WHERE category IS NOT NULL AND TRIM(category) != ''
    UNION
    SELECT DISTINCT category FROM skr04_accounts WHERE category IS NOT NULL AND TRIM(category) != ''
    UNION
    SELECT DISTINCT category FROM debtors WHERE category IS NOT NULL AND TRIM(category) != ''
    UNION
    SELECT DISTINCT category FROM creditors WHERE category IS NOT NULL AND TRIM(category) != ''
  )
`);

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
 * Normalize source to standard value
 */
function normalizeSource(value: unknown): string | null {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase();
  if (trimmed === SOURCE_SKR || trimmed === SOURCE_LEDGER) {
    return SOURCE_SKR;
  }
  if (trimmed === 'debtors') return 'debtors';
  if (trimmed === 'creditors') return 'creditors';
  return null;
}

/**
 * Convert source to database format (ledgers instead of skr04_accounts)
 */
function toDbSource(value: unknown): string | null {
  const normalized = normalizeSource(value);
  if (normalized === SOURCE_SKR) {
    return SOURCE_LEDGER;
  }
  return normalized;
}

/**
 * Convert database source to application format
 */
function fromDbSource(value: unknown): string | null {
  if (!value) return null;
  return value === SOURCE_LEDGER ? SOURCE_SKR : String(value);
}

/**
 * Normalize rule row from database
 */
function normalizeRuleRow(row: unknown): Rule | null {
  if (!row) return null;
  const r = row as Record<string, unknown>;
  return {
    id_rule: Number(r.id_rule),
    no: Number(r.no),
    side: String(r.side),
    category: r.category ? String(r.category).trim().toUpperCase() : '',
    account_min: toOptionalInt(r.account_min),
    account_max: toOptionalInt(r.account_max),
    active: Number(r.active ?? 0) === 1,
    description: r.description ? String(r.description) : ''
  };
}

/**
 * Normalize rule item row from database
 */
function normalizeItemRow(row: unknown): RuleItem | null {
  if (!row) return null;
  const r = row as Record<string, unknown>;
  return {
    id_item: Number(r.id_item),
    id_rule: Number(r.id_rule),
    account: toOptionalInt(r.account),
    category: r.category ? String(r.category).trim().toUpperCase() : '',
    source: fromDbSource(r.source) || SOURCE_SKR
  };
}

/**
 * List all company codes
 * @returns Array of company codes
 */
export function listCompanyCodes(): CompanyCode[] {
  try {
    return listCompanyCodesStmt.all().map((row) => {
      const r = row as Record<string, unknown>;
      return {
        no: Number(r.no),
        textcode: String(r.textcode ?? ''),
        available: Number(r.available ?? 0) === 1
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.listCompanyCodes failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * List all distinct rule numbers (book circles with rules)
 * @returns Array of rule numbers
 */
export function listRuleNumbers(): number[] {
  try {
    return distinctRuleNosStmt.all().map((row) => Number((row as { no: number }).no));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.listRuleNumbers failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * Check if company code exists (no = 0 always returns true for global rules)
 * @param no Company code number
 * @returns true if company code exists
 */
export function companyCodeExists(no: number): boolean {
  if (no === 0) {
    return true;
  }
  try {
    const row = companyCodeExistsStmt.get(no);
    return Boolean(row);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.companyCodeExists failed: ${error.message}`);
    }
    return false;
  }
}

/**
 * List all rules with items for a company code
 * @param no Company code number
 * @returns Array of rules with their items
 */
export function listRulesWithItems(no: number): RuleWithItems[] {
  try {
    const base = rulesByNoStmt.all(no).map(normalizeRuleRow).filter((x): x is Rule => x !== null);
    return base.map((rule) => ({
      ...rule,
      items: listItemsByRule(rule.id_rule)
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.listRulesWithItems failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * Get rule by ID with its items
 * @param id Rule ID
 * @returns Rule with items or null
 */
export function getRuleById(id: number): RuleWithItems | null {
  try {
    const row = ruleByIdStmt.get(id);
    if (!row) {
      return null;
    }
    const rule = normalizeRuleRow(row);
    if (!rule) {
      return null;
    }
    return {
      ...rule,
      items: listItemsByRule(rule.id_rule)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.getRuleById failed: ${error.message}`);
    }
    return null;
  }
}

/**
 * Create new rule
 * @param data Rule payload
 * @returns Created rule with items or null
 */
export function createRule(data: RulePayload): RuleWithItems | null {
  const insert = db.transaction((payload: RulePayload) => {
    const info = insertRuleStmt.run(
      payload.no,
      payload.side,
      payload.category || null,
      payload.account_min ?? null,
      payload.account_max ?? null,
      payload.active ? 1 : 0,
      payload.description ?? null
    );
    return info.lastInsertRowid;
  });

  const newId = insert(data);
  return getRuleById(Number(newId));
}

/**
 * Update existing rule
 * @param id Rule ID
 * @param data Rule payload
 * @returns Updated rule with items or null
 */
export function updateRule(id: number, data: RulePayload): RuleWithItems | null {
  const update = db.transaction((payload: RulePayload) => {
    updateRuleStmt.run(
      payload.side,
      payload.category || null,
      payload.account_min ?? null,
      payload.account_max ?? null,
      payload.active ? 1 : 0,
      payload.description ?? null,
      id
    );
    return true;
  });

  update(data);
  return getRuleById(id);
}

/**
 * Delete rule and all its items
 * @param id Rule ID
 * @returns true if deleted, false otherwise
 */
export function deleteRule(id: number): boolean {
  const remove = db.transaction((ruleId: number) => {
    deleteItemsByRuleStmt.run(ruleId);
    const info = deleteRuleStmt.run(ruleId);
    return info.changes > 0;
  });

  return remove(id);
}

/**
 * List all items for a rule
 * @param idRule Rule ID
 * @returns Array of rule items
 */
export function listItemsByRule(idRule: number): RuleItem[] {
  try {
    return itemsByRuleStmt.all(idRule).map(normalizeItemRow).filter((x): x is RuleItem => x !== null);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.listItemsByRule failed: ${error.message}`);
    }
    return [];
  }
}

/**
 * Get rule item by ID
 * @param id Item ID
 * @returns Rule item or null
 */
export function getItemById(id: number): RuleItem | null {
  try {
    const row = itemByIdStmt.get(id);
    return normalizeItemRow(row);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.getItemById failed: ${error.message}`);
    }
    return null;
  }
}

/**
 * Create new rule item
 * @param data Item payload
 * @returns Created item or null
 */
export function createItem(data: RuleItemPayload): RuleItem | null {
  const insert = db.transaction((payload: RuleItemPayload) => {
    const info = insertItemStmt.run(
      payload.id_rule,
      payload.account ?? null,
      payload.category || null,
      toDbSource(payload.source)
    );
    return info.lastInsertRowid;
  });

  const id = insert(data);
  return getItemById(Number(id));
}

/**
 * Update existing rule item
 * @param id Item ID
 * @param data Item payload
 * @returns Updated item or null
 */
export function updateItem(id: number, data: RuleItemPayload): RuleItem | null {
  const update = db.transaction((payload: RuleItemPayload) => {
    updateItemStmt.run(
      payload.account ?? null,
      payload.category || null,
      toDbSource(payload.source),
      id
    );
    return true;
  });

  update(data);
  return getItemById(id);
}

/**
 * Delete rule item
 * @param id Item ID
 * @returns true if deleted, false otherwise
 */
export function deleteItem(id: number): boolean {
  try {
    const info = deleteItemStmt.run(id);
    return info.changes > 0;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.deleteItem failed: ${error.message}`);
    }
    return false;
  }
}

/**
 * List all distinct categories from rules, items, and accounts
 * @returns Array of unique category names
 */
export function listDistinctCategories(): string[] {
  try {
    const rows = distinctCategoriesStmt.all();
    const values = rows
      .map((row) => {
        const r = row as { category?: string | null };
        return r?.category ? String(r.category).trim().toUpperCase() : '';
      })
      .filter((value) => value.length > 0);
    return Array.from(new Set(values)).sort();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`rules-store.listDistinctCategories failed: ${error.message}`);
    }
    return [];
  }
}
