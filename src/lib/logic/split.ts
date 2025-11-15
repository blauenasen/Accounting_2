// src/lib/logic/split.ts
// Logic for Split-Buchungen (splitting invoices/receipts into multiple accounts)

import Decimal from 'decimal.js';

/**
 * Split position structure
 */
export interface SplitPosition {
  account: number;
  amount: number;
  description: string;
  taxRate?: number;
}

/**
 * Split validation result
 */
export interface SplitValidationResult {
  valid: boolean;
  errors: SplitValidationError[];
  sumDifference: number;
}

/**
 * Split validation error
 */
export interface SplitValidationError {
  field: string;
  message: string;
  position?: number;
}

/**
 * Split calculation mode
 */
export type SplitMode = 'gross' | 'net';

/**
 * Validates split positions against total amount
 * Uses Decimal.js for cent-precise validation
 * @param positions Array of split positions
 * @param total Total amount to split
 * @param mode Calculation mode ('gross' or 'net')
 * @param tolerance Allowed difference in cents (default: 0.01)
 * @returns Validation result
 */
export function validateSplitPositions(
  positions: SplitPosition[],
  total: number,
  mode: SplitMode = 'gross',
  tolerance: number = 0.01
): SplitValidationResult {
  const errors: SplitValidationError[] = [];

  if (!positions || positions.length === 0) {
    errors.push({ field: 'positions', message: 'At least one position is required' });
    return { valid: false, errors, sumDifference: total };
  }

  positions.forEach((pos, index) => {
    if (!Number.isFinite(pos.account) || pos.account <= 0) {
      errors.push({ field: 'account', message: 'Invalid account number', position: index });
    }
    if (!Number.isFinite(pos.amount) || pos.amount <= 0) {
      errors.push({ field: 'amount', message: 'Invalid amount', position: index });
    }
    if (!pos.description || pos.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required', position: index });
    }
  });

  const sum = positions.reduce((acc, pos) => {
    return acc.plus(new Decimal(pos.amount));
  }, new Decimal(0));

  const totalDecimal = new Decimal(total);
  const difference = sum.minus(totalDecimal).abs();

  if (difference.greaterThan(tolerance)) {
    errors.push({
      field: 'total',
      message: `Sum mismatch: positions sum to ${sum.toFixed(2)}, but total is ${totalDecimal.toFixed(2)}`
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    sumDifference: difference.toNumber()
  };
}

/**
 * Calculates net amounts from gross amounts
 * Uses Decimal.js for cent-precise calculations
 * @param positions Array of split positions with gross amounts
 * @param defaultTaxRate Default tax rate to use if not specified per position
 * @returns Positions with calculated net amounts
 */
export function calculateNetFromGross(
  positions: SplitPosition[],
  defaultTaxRate: number = 0
): Array<SplitPosition & { netAmount: number }> {
  return positions.map((pos) => {
    const taxRate = pos.taxRate ?? defaultTaxRate;
    if (taxRate <= 0) {
      return { ...pos, netAmount: pos.amount };
    }

    const grossDecimal = new Decimal(pos.amount);
    const taxFactor = new Decimal(1).plus(new Decimal(taxRate).div(100));
    const netAmount = grossDecimal.div(taxFactor);

    return {
      ...pos,
      netAmount: netAmount.toDecimalPlaces(2).toNumber()
    };
  });
}

/**
 * Calculates gross amounts from net amounts
 * Uses Decimal.js for cent-precise calculations
 * @param positions Array of split positions with net amounts
 * @param defaultTaxRate Default tax rate to use if not specified per position
 * @returns Positions with calculated gross amounts
 */
export function calculateGrossFromNet(
  positions: Array<Omit<SplitPosition, 'amount'> & { netAmount: number }>,
  defaultTaxRate: number = 0
): SplitPosition[] {
  return positions.map((pos) => {
    const taxRate = pos.taxRate ?? defaultTaxRate;
    if (taxRate <= 0) {
      return { ...pos, amount: pos.netAmount };
    }

    const netDecimal = new Decimal(pos.netAmount);
    const taxFactor = new Decimal(1).plus(new Decimal(taxRate).div(100));
    const grossAmount = netDecimal.times(taxFactor);

    return {
      account: pos.account,
      amount: grossAmount.toDecimalPlaces(2).toNumber(),
      description: pos.description,
      taxRate: pos.taxRate
    };
  });
}

/**
 * Automatically distributes remaining amount to last position
 * Useful when rounding causes small differences
 * @param positions Array of split positions
 * @param total Total amount to match
 * @returns Positions with adjusted last amount
 */
export function adjustLastPositionToTotal(
  positions: SplitPosition[],
  total: number
): SplitPosition[] {
  if (positions.length === 0) {
    return positions;
  }

  const sumWithoutLast = positions.slice(0, -1).reduce((acc, pos) => {
    return acc.plus(new Decimal(pos.amount));
  }, new Decimal(0));

  const lastAmount = new Decimal(total).minus(sumWithoutLast);

  return [
    ...positions.slice(0, -1),
    {
      ...positions[positions.length - 1],
      amount: lastAmount.toDecimalPlaces(2).toNumber()
    }
  ];
}

/**
 * Checks if positions can be merged (same account)
 * @param positions Array of split positions
 * @returns true if positions have duplicate accounts
 */
export function hasDuplicateAccounts(positions: SplitPosition[]): boolean {
  const accounts = new Set<number>();
  for (const pos of positions) {
    if (accounts.has(pos.account)) {
      return true;
    }
    accounts.add(pos.account);
  }
  return false;
}

/**
 * Merges positions with same account
 * Uses Decimal.js for cent-precise amount summing
 * @param positions Array of split positions
 * @returns Merged positions
 */
export function mergePositionsByAccount(positions: SplitPosition[]): SplitPosition[] {
  const merged = new Map<number, SplitPosition>();

  for (const pos of positions) {
    const existing = merged.get(pos.account);
    if (existing) {
      const newAmount = new Decimal(existing.amount).plus(pos.amount);
      merged.set(pos.account, {
        ...existing,
        amount: newAmount.toDecimalPlaces(2).toNumber(),
        description: `${existing.description} + ${pos.description}`
      });
    } else {
      merged.set(pos.account, { ...pos });
    }
  }

  return Array.from(merged.values());
}
