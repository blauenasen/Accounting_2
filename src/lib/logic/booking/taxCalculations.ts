// src/lib/logic/booking/taxCalculations.ts
// Tax calculation functions for BookingForm with Decimal.js for precision

import Decimal from 'decimal.js';

/**
 * Tax calculation result structure
 */
export interface TaxDetails {
  steuer: string;
  vStUSt: number;
  nettoGes: number;
  brutto?: number;
}

/**
 * Tax update result from account
 */
export interface TaxUpdateResult {
  tax: string;
  locked: boolean;
  manuallySet: boolean;
  taxValue?: string;
}

/**
 * Format tax value for display
 * @param value Tax value (number, string, or '?')
 * @returns Formatted tax string
 */
export function formatTaxDisplay(value: unknown): string {
  if (value === '?') return '?';
  const num = parseFloat(String(value));
  if (isNaN(num)) return String(value);
  return num.toFixed(1);
}

/**
 * Calculate tax details from brutto amount
 * Uses Decimal.js for cent-precise calculations
 * @param brutto Gross amount
 * @param bu Tax rate (BU code, e.g., 19 for 19%)
 * @param sh Debit/Credit indicator (S/H)
 * @returns Tax calculation details
 */
export function calculateTaxDetails(brutto: number, bu: number | null, sh: string): TaxDetails {
  const result: TaxDetails = {
    steuer: '0.00%',
    vStUSt: 0,
    nettoGes: brutto
  };

  if (!bu || bu <= 0) {
    return result;
  }

  const steuersatz = new Decimal(bu).div(100);
  const bruttoDecimal = new Decimal(brutto);
  const steuerBetrag = bruttoDecimal.div(new Decimal(1).plus(steuersatz)).times(steuersatz);
  const netto = bruttoDecimal.minus(steuerBetrag);

  result.steuer = steuersatz.toFixed(2);
  result.vStUSt = steuerBetrag.toDecimalPlaces(2).toNumber();
  result.nettoGes = netto.toDecimalPlaces(2).toNumber();

  return result;
}

/**
 * Calculate brutto from netto amount
 * Uses Decimal.js for cent-precise calculations
 * @param netto Net amount
 * @param bu Tax rate (BU code, e.g., 19 for 19%)
 * @param sh Debit/Credit indicator (S/H)
 * @returns Tax calculation details with brutto
 */
export function calculateFromNetto(netto: number, bu: number | null, sh: string): TaxDetails {
  const result: TaxDetails = {
    steuer: '0.00%',
    vStUSt: 0,
    nettoGes: netto,
    brutto: netto
  };

  if (!bu || bu <= 0) {
    return result;
  }

  const steuersatz = new Decimal(bu).div(100);
  const nettoDecimal = new Decimal(netto);
  const steuerBetrag = nettoDecimal.times(steuersatz);
  const bruttoValue = nettoDecimal.plus(steuerBetrag);

  result.steuer = steuersatz.toFixed(2);
  result.vStUSt = steuerBetrag.toDecimalPlaces(2).toNumber();
  result.nettoGes = nettoDecimal.toDecimalPlaces(2).toNumber();
  result.brutto = bruttoValue.toDecimalPlaces(2).toNumber();

  return result;
}

/**
 * Get tax account number based on tax rate and debit/credit
 * @param bu Tax rate (BU code)
 * @param sh Debit/Credit indicator (S/H)
 * @returns Tax account number or null
 */
export function getSteuerKto(bu: number | string | null, sh: string): number | null {
  const taxRate = parseFloat(String(bu ?? ''));
  if (isNaN(taxRate) || taxRate === 0) {
    return null;
  }

  if (sh === 'S') {
    if (taxRate === 19) return 1776;
    if (taxRate === 7) return 1771;
    return 1780;
  } else {
    if (taxRate === 19) return 1776;
    if (taxRate === 7) return 1771;
    return 1780;
  }
}

/**
 * Get JA position for tax based on debit/credit
 * @param sh Debit/Credit indicator (S/H)
 * @returns JA position number
 */
export function getJAPosSteuer(sh: string): number {
  return sh === 'S' ? 12 : 22;
}

/**
 * Load available tax groups from API
 * @returns Array of tax group strings
 */
export async function loadAvailableTaxgroups(): Promise<string[]> {
  try {
    const response = await fetch('/api/booking/taxgroups');
    if (!response.ok) {
      throw new Error('Failed to load taxgroups');
    }
    const data = await response.json() as { ok: boolean; taxgroups?: string[] };
    if (data.ok && Array.isArray(data.taxgroups)) {
      return [...new Set(data.taxgroups.filter(t => t !== '?'))]
        .sort((a, b) => parseFloat(a) - parseFloat(b));
    }
    return ['0', '1', '5'];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`loadAvailableTaxgroups failed: ${error.message}`);
    }
    return ['0', '1', '5'];
  }
}

/**
 * Update tax value from account number via API
 * @param accountNumber Account number
 * @returns Tax update result with lock state
 */
export async function updateTaxFromAccount(accountNumber: number | string | null): Promise<TaxUpdateResult> {
  if (!accountNumber || accountNumber === '') {
    return { tax: '', locked: false, manuallySet: false };
  }

  try {
    const response = await fetch(`/api/booking/account-taxgroup?account=${accountNumber}`);
    if (!response.ok) {
      if (response.status !== 404) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      return { tax: '', locked: false, manuallySet: false };
    }
    const data = await response.json() as { ok: boolean; taxgroup?: string | number | null };

    if (data.ok) {
      const taxValue = data.taxgroup !== null && data.taxgroup !== undefined
        ? String(data.taxgroup)
        : '?';

      if (taxValue === '?') {
        return { tax: '?', locked: false, manuallySet: false };
      } else {
        return { tax: taxValue, locked: true, manuallySet: false, taxValue };
      }
    }
    return { tax: '', locked: false, manuallySet: false };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`updateTaxFromAccount failed: ${error.message}`);
    }
    return { tax: '', locked: false, manuallySet: false };
  }
}
