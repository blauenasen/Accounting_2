// src/lib/logic/matching.ts
// Logic for Auszifferung (open items matching/reconciliation)

import Decimal from 'decimal.js';

/**
 * Open item structure
 */
export interface OpenItem {
  idNr: number;
  account: number;
  amount: number;
  date: string;
  belNr: string;
  buchungstext: string;
  ausziffNr?: number | null;
  ausziffArt?: string | null;
  ausziffDatum?: string | null;
}

/**
 * Matching result
 */
export interface MatchingResult {
  valid: boolean;
  matched: MatchedGroup[];
  errors: MatchingError[];
  totalDifference: number;
}

/**
 * Matched group of items
 */
export interface MatchedGroup {
  ausziffNr: number;
  items: number[];
  totalSoll: number;
  totalHaben: number;
  difference: number;
  balanced: boolean;
}

/**
 * Matching error
 */
export interface MatchingError {
  field: string;
  message: string;
  items?: number[];
}

/**
 * Matching options
 */
export interface MatchingOptions {
  tolerance?: number;
  ausziffArt?: string;
  ausziffDatum?: string;
}

/**
 * Validates that selected items can be matched
 * Uses Decimal.js for cent-precise balance validation
 * @param items Array of open items to match
 * @param tolerance Allowed difference in cents (default: 0.01)
 * @returns Validation result
 */
export function validateMatching(
  items: OpenItem[],
  tolerance: number = 0.01
): MatchingResult {
  const errors: MatchingError[] = [];

  if (!items || items.length < 2) {
    errors.push({
      field: 'items',
      message: 'At least two items are required for matching'
    });
    return {
      valid: false,
      matched: [],
      errors,
      totalDifference: 0
    };
  }

  const alreadyMatched = items.filter(item => item.ausziffNr);
  if (alreadyMatched.length > 0) {
    errors.push({
      field: 'items',
      message: 'Some items are already matched',
      items: alreadyMatched.map(item => item.idNr)
    });
  }

  const accountSet = new Set(items.map(item => item.account));
  if (accountSet.size !== 1) {
    errors.push({
      field: 'account',
      message: 'All items must belong to the same account'
    });
  }

  const totalSoll = items
    .filter(item => item.amount > 0)
    .reduce((sum, item) => sum.plus(item.amount), new Decimal(0));

  const totalHaben = items
    .filter(item => item.amount < 0)
    .reduce((sum, item) => sum.plus(Math.abs(item.amount)), new Decimal(0));

  const difference = totalSoll.minus(totalHaben).abs();

  if (difference.greaterThan(tolerance)) {
    errors.push({
      field: 'balance',
      message: `Items do not balance: Soll=${totalSoll.toFixed(2)}, Haben=${totalHaben.toFixed(2)}, Diff=${difference.toFixed(2)}`
    });
  }

  const matched: MatchedGroup = {
    ausziffNr: 0,
    items: items.map(item => item.idNr),
    totalSoll: totalSoll.toNumber(),
    totalHaben: totalHaben.toNumber(),
    difference: difference.toNumber(),
    balanced: difference.lessThanOrEqualTo(tolerance)
  };

  return {
    valid: errors.length === 0,
    matched: [matched],
    errors,
    totalDifference: difference.toNumber()
  };
}

/**
 * Generates next Auszifferungs number
 * @param existingNumbers Array of existing Ausziff numbers
 * @returns Next available Ausziff number
 */
export function generateAusziffNr(existingNumbers: number[]): number {
  if (existingNumbers.length === 0) {
    return 1;
  }
  const max = Math.max(...existingNumbers);
  return max + 1;
}

/**
 * Finds potential matching candidates for an open item
 * @param item The item to find matches for
 * @param candidates Array of potential matching items
 * @param tolerance Allowed difference for matching
 * @returns Array of candidate items that could match
 */
export function findMatchingCandidates(
  item: OpenItem,
  candidates: OpenItem[],
  tolerance: number = 0.01
): OpenItem[] {
  if (!item || item.amount === 0) {
    return [];
  }

  const itemAmount = new Decimal(Math.abs(item.amount));
  const isDebit = item.amount > 0;

  return candidates.filter(candidate => {
    if (candidate.idNr === item.idNr) {
      return false;
    }

    if (candidate.account !== item.account) {
      return false;
    }

    if (candidate.ausziffNr) {
      return false;
    }

    const candidateAmount = new Decimal(Math.abs(candidate.amount));
    const candidateIsDebit = candidate.amount > 0;

    if (isDebit === candidateIsDebit) {
      return false;
    }

    const difference = itemAmount.minus(candidateAmount).abs();
    return difference.lessThanOrEqualTo(tolerance);
  });
}

/**
 * Auto-matches items that have exact opposite amounts
 * @param items Array of open items
 * @param tolerance Allowed difference for matching
 * @returns Array of matched groups
 */
export function autoMatchExactPairs(
  items: OpenItem[],
  tolerance: number = 0.01
): MatchedGroup[] {
  const unmatched = items.filter(item => !item.ausziffNr);
  const matched: MatchedGroup[] = [];
  const processed = new Set<number>();

  for (const item of unmatched) {
    if (processed.has(item.idNr)) {
      continue;
    }

    const candidates = findMatchingCandidates(item, unmatched, tolerance);

    for (const candidate of candidates) {
      if (processed.has(candidate.idNr)) {
        continue;
      }

      const sumSoll = Math.max(item.amount, candidate.amount);
      const sumHaben = Math.abs(Math.min(item.amount, candidate.amount));
      const diff = Math.abs(sumSoll - sumHaben);

      if (diff <= tolerance) {
        matched.push({
          ausziffNr: 0,
          items: [item.idNr, candidate.idNr],
          totalSoll: sumSoll,
          totalHaben: sumHaben,
          difference: diff,
          balanced: true
        });

        processed.add(item.idNr);
        processed.add(candidate.idNr);
        break;
      }
    }
  }

  return matched;
}

/**
 * Calculates remaining balance for partially matched items
 * @param items Array of items in a matching group
 * @returns Remaining balance
 */
export function calculateRemainingBalance(items: OpenItem[]): number {
  const total = items.reduce((sum, item) => {
    return sum.plus(item.amount);
  }, new Decimal(0));

  return total.toDecimalPlaces(2).toNumber();
}

/**
 * Checks if a matching group is balanced
 * @param items Array of items in the group
 * @param tolerance Allowed difference
 * @returns true if balanced
 */
export function isGroupBalanced(
  items: OpenItem[],
  tolerance: number = 0.01
): boolean {
  const balance = new Decimal(calculateRemainingBalance(items)).abs();
  return balance.lessThanOrEqualTo(tolerance);
}

/**
 * Groups items by Ausziff number
 * @param items Array of all items
 * @returns Map of Ausziff number to items
 */
export function groupByAusziffNr(items: OpenItem[]): Map<number, OpenItem[]> {
  const groups = new Map<number, OpenItem[]>();

  for (const item of items) {
    if (!item.ausziffNr) {
      continue;
    }

    const existing = groups.get(item.ausziffNr) ?? [];
    existing.push(item);
    groups.set(item.ausziffNr, existing);
  }

  return groups;
}

/**
 * Unmatches items (removes Ausziff number)
 * @param items Array of items to unmatch
 * @returns Updated items
 */
export function unmatchItems(items: OpenItem[]): OpenItem[] {
  return items.map(item => ({
    ...item,
    ausziffNr: null,
    ausziffArt: null,
    ausziffDatum: null
  }));
}
