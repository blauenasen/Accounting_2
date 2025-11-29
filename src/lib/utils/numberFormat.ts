// numberFormat.ts
// Utility functions for number formatting with thousand separators
// Format: "0,000.00" (comma as thousand separator, dot as decimal separator)

/**
 * Formats a number with thousand separators
 * @param value - The number to format
 * @returns Formatted string with pattern "0,000.00"
 */
export function formatCurrencyDisplay(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0.00';
  }

  // Format with 2 decimal places and comma as thousand separator
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Transforms user input to proper decimal number
 * Rules:
 * - "123456" → 1234.56 (last 2 digits = decimals)
 * - "24000" → 240.00 (last 2 digits = decimals)
 * - "15.81" → 15.81 (already has decimal point)
 *
 * @param input - The raw input string
 * @returns Parsed number
 */
export function parseInputToNumber(input: string): number {
  if (!input || input.trim() === '') {
    return 0;
  }

  // Remove all commas (thousand separators)
  let cleaned = input.replace(/,/g, '');

  // If input already has a decimal point, parse normally
  if (cleaned.includes('.')) {
    return parseFloat(cleaned) || 0;
  }

  // If no decimal point: last 2 digits are decimals
  // "123456" → "1234.56"
  // "24000" → "240.00"
  if (cleaned.length <= 2) {
    // "56" → "0.56"
    return parseFloat(`0.${cleaned.padStart(2, '0')}`) || 0;
  }

  const integerPart = cleaned.slice(0, -2);
  const decimalPart = cleaned.slice(-2);
  return parseFloat(`${integerPart}.${decimalPart}`) || 0;
}

/**
 * Removes formatting from display value to get raw number
 * @param formatted - Formatted string like "1,234.56"
 * @returns Raw number
 */
export function unformatCurrency(formatted: string): number {
  if (!formatted || formatted.trim() === '') {
    return 0;
  }

  // Remove commas and parse
  const cleaned = formatted.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}
