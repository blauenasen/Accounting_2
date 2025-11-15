// src/lib/logic/primanota/calculations.ts
// Calculation logic for Primanota table (Balance calculations)

import Decimal from 'decimal.js';

/**
 * Data row structure for calculations
 */
export interface CalculationRow {
  SumSoll?: number;
  SumHaben?: number;
  Balance?: number;
  [key: string]: unknown;
}

/**
 * Calculates running balance for account view rows
 * Uses Decimal.js for cent-precise balance calculations
 * @param rows Array of data rows
 * @param viewMode Current view mode ('primanota' or 'account')
 * @returns Rows with calculated Balance field
 */
export function calculateBalanceForRows<T extends CalculationRow>(rows: T[], viewMode: string): T[] {
  if (viewMode !== 'account' || !rows.length) {
    return rows;
  }

  let runningBalance = new Decimal(0);
  return rows.map((row) => {
    const sumSoll = Number.isFinite(row.SumSoll) ? new Decimal(row.SumSoll!) : new Decimal(0);
    const sumHaben = Number.isFinite(row.SumHaben) ? new Decimal(row.SumHaben!) : new Decimal(0);
    runningBalance = runningBalance.plus(sumSoll).minus(sumHaben);
    return {
      ...row,
      Balance: runningBalance.toDecimalPlaces(2).toNumber()
    };
  });
}
