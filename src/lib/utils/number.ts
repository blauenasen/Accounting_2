// src/lib/utils/number.ts
// Number formatting and parsing utilities with Decimal.js precision

import Decimal from 'decimal.js';

/**
 * Locale type for formatting
 */
export type NumberLocale = 'de' | 'en';

/**
 * Number format options
 */
export interface NumberFormatOptions {
  locale?: NumberLocale;
  decimals?: number;
  showThousandsSeparator?: boolean;
  showSign?: boolean;
}

/**
 * Currency format options
 */
export interface CurrencyFormatOptions extends NumberFormatOptions {
  symbol?: string;
  symbolPosition?: 'before' | 'after';
}

/**
 * Formats a number with locale-specific separators
 * @param value Number to format
 * @param options Format options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = 'en',
    decimals = 2,
    showThousandsSeparator = true,
    showSign = false
  } = options;

  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = parseToNumber(value);
  if (num === null) {
    return String(value);
  }

  const decimal = new Decimal(num);
  const rounded = decimal.toDecimalPlaces(decimals);
  const isNegative = rounded.isNegative();
  const absoluteValue = rounded.abs();

  let formatted = absoluteValue.toFixed(decimals);

  if (showThousandsSeparator) {
    const parts = formatted.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const thousandsSep = locale === 'de' ? '.' : ',';
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);

    const decimalSep = locale === 'de' ? ',' : '.';
    formatted = decimalPart ? `${formattedInteger}${decimalSep}${decimalPart}` : formattedInteger;
  } else if (locale === 'de') {
    formatted = formatted.replace('.', ',');
  }

  if (isNegative) {
    formatted = `-${formatted}`;
  } else if (showSign && !rounded.isZero()) {
    formatted = `+${formatted}`;
  }

  return formatted;
}

/**
 * Formats a number as currency
 * @param value Number to format as currency
 * @param options Currency format options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'en',
    decimals = 2,
    showThousandsSeparator = true,
    showSign = false,
    symbol = locale === 'de' ? '€' : '$',
    symbolPosition = locale === 'de' ? 'after' : 'before'
  } = options;

  if (value === null || value === undefined || value === '') {
    return '';
  }

  const formatted = formatNumber(value, {
    locale,
    decimals,
    showThousandsSeparator,
    showSign
  });

  if (!formatted) {
    return '';
  }

  if (symbolPosition === 'before') {
    return `${symbol}${formatted}`;
  } else {
    return `${formatted} ${symbol}`;
  }
}

/**
 * Formats a number as percentage
 * @param value Number to format as percentage (0.15 = 15%)
 * @param options Format options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | string | null | undefined,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = 'en',
    decimals = 2,
    showThousandsSeparator = false,
    showSign = false
  } = options;

  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = parseToNumber(value);
  if (num === null) {
    return String(value);
  }

  const percentage = new Decimal(num).times(100);
  const formatted = formatNumber(percentage.toNumber(), {
    locale,
    decimals,
    showThousandsSeparator,
    showSign
  });

  return formatted ? `${formatted}%` : '';
}

/**
 * Parses a string to a number (handles various formats)
 * Supports: 1234.56, 1.234,56 (DE), 1,234.56 (EN), "1 234,56"
 * @param value String or number to parse
 * @returns Parsed number or null if invalid
 */
export function parseToNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  let str = String(value).trim();
  str = str.replace(/\s+/g, '');
  str = str.replace(/%/g, '');
  str = str.replace(/[€$]/g, '');

  if (str === '' || str === '-' || str === '+') {
    return null;
  }

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    const lastCommaIndex = str.lastIndexOf(',');
    const lastDotIndex = str.lastIndexOf('.');

    if (lastCommaIndex > lastDotIndex) {
      str = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    str = str.replace(/,/g, '.');
  }

  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

/**
 * Parses a currency string to number
 * @param value Currency string to parse
 * @returns Parsed number or null if invalid
 */
export function parseCurrency(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  return parseToNumber(value);
}

/**
 * Parses a percentage string to decimal number
 * "15%" -> 0.15
 * @param value Percentage string to parse
 * @returns Parsed decimal number or null if invalid
 */
export function parsePercentage(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const num = parseToNumber(value);
  if (num === null) {
    return null;
  }

  return new Decimal(num).div(100).toNumber();
}

/**
 * Validates if a value is a valid number
 * @param value Value to validate
 * @returns true if valid number
 */
export function isValidNumber(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  const num = parseToNumber(value);
  return num !== null;
}

/**
 * Validates if a value is a positive number
 * @param value Value to validate
 * @returns true if positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  const num = parseToNumber(value);
  return num !== null && num > 0;
}

/**
 * Validates if a value is a non-negative number (>= 0)
 * @param value Value to validate
 * @returns true if non-negative number
 */
export function isNonNegativeNumber(value: unknown): boolean {
  const num = parseToNumber(value);
  return num !== null && num >= 0;
}

/**
 * Rounds a number to specified decimal places using Decimal.js
 * @param value Number to round
 * @param decimals Decimal places (default: 2)
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  return new Decimal(value).toDecimalPlaces(decimals).toNumber();
}

/**
 * Adds two numbers with Decimal.js precision
 * @param a First number
 * @param b Second number
 * @returns Sum with cent precision
 */
export function add(a: number, b: number): number {
  return new Decimal(a).plus(b).toDecimalPlaces(2).toNumber();
}

/**
 * Subtracts two numbers with Decimal.js precision
 * @param a First number
 * @param b Second number
 * @returns Difference with cent precision
 */
export function subtract(a: number, b: number): number {
  return new Decimal(a).minus(b).toDecimalPlaces(2).toNumber();
}

/**
 * Multiplies two numbers with Decimal.js precision
 * @param a First number
 * @param b Second number
 * @returns Product with cent precision
 */
export function multiply(a: number, b: number): number {
  return new Decimal(a).times(b).toDecimalPlaces(2).toNumber();
}

/**
 * Divides two numbers with Decimal.js precision
 * @param a Dividend
 * @param b Divisor
 * @returns Quotient with cent precision
 * @throws Error if divisor is zero
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return new Decimal(a).div(b).toDecimalPlaces(2).toNumber();
}

/**
 * Calculates sum of array of numbers with Decimal.js precision
 * @param numbers Array of numbers
 * @returns Sum with cent precision
 */
export function sum(numbers: number[]): number {
  return numbers
    .reduce((acc, num) => acc.plus(num), new Decimal(0))
    .toDecimalPlaces(2)
    .toNumber();
}

/**
 * Calculates average of array of numbers with Decimal.js precision
 * @param numbers Array of numbers
 * @returns Average with cent precision
 * @throws Error if array is empty
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate average of empty array');
  }
  const total = sum(numbers);
  return new Decimal(total).div(numbers.length).toDecimalPlaces(2).toNumber();
}

/**
 * Clamps a number between min and max values
 * @param value Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Checks if two numbers are equal within tolerance
 * @param a First number
 * @param b Second number
 * @param tolerance Allowed difference (default: 0.01)
 * @returns true if numbers are equal within tolerance
 */
export function isEqual(a: number, b: number, tolerance: number = 0.01): boolean {
  const diff = new Decimal(a).minus(b).abs();
  return diff.lessThanOrEqualTo(tolerance);
}

/**
 * Formats a number for input field (removes formatting)
 * @param value Formatted number string
 * @param locale Locale to use for parsing
 * @returns Plain number string for input
 */
export function formatForInput(value: string, locale: NumberLocale = 'en'): string {
  const num = parseToNumber(value);
  if (num === null) {
    return value;
  }

  const formatted = new Decimal(num).toFixed(2);
  return locale === 'de' ? formatted.replace('.', ',') : formatted;
}

/**
 * Converts a number to words (German)
 * Limited to amounts up to 999,999.99
 * @param value Number to convert
 * @returns Number as German words
 */
export function numberToGermanWords(value: number): string {
  const rounded = roundToDecimals(value, 2);
  const euros = Math.floor(rounded);
  const cents = Math.round((rounded - euros) * 100);

  const ones = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
  const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

  function convertUpTo999(n: number): string {
    if (n === 0) return 'null';
    if (n === 1) return 'eins';

    let result = '';

    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundreds > 0) {
      result += ones[hundreds] + 'hundert';
    }

    if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const onesDigit = remainder % 10;
      const tensDigit = Math.floor(remainder / 10);

      if (onesDigit > 0) {
        result += (onesDigit === 1 ? 'ein' : ones[onesDigit]) + (tensDigit > 0 ? 'und' : '');
      }

      if (tensDigit > 0) {
        result += tens[tensDigit];
      }
    }

    return result;
  }

  let euroWords = '';

  if (euros >= 1000) {
    const thousands = Math.floor(euros / 1000);
    euroWords += convertUpTo999(thousands) + 'tausend';
    euroWords += convertUpTo999(euros % 1000);
  } else {
    euroWords = convertUpTo999(euros);
  }

  euroWords += euros === 1 ? ' Euro' : ' Euro';

  if (cents > 0) {
    const centWords = convertUpTo999(cents);
    euroWords += ' und ' + centWords + (cents === 1 ? ' Cent' : ' Cent');
  }

  return euroWords;
}

/**
 * Formats bytes to human-readable format
 * @param bytes Number of bytes
 * @param decimals Decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = new Decimal(bytes).div(Math.pow(k, i));
  return `${value.toDecimalPlaces(decimals).toNumber()} ${sizes[i]}`;
}
