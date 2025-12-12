// src/lib/utils/stringNormalizer.ts
// Type-safe string normalization utilities
// Ensures runtime type safety for database fields

/**
 * Normalizes a value to a string
 * Handles null, undefined, numbers, and existing strings
 *
 * @param value - The value to normalize
 * @param defaultValue - Default value if input is null/undefined (default: '')
 * @returns Normalized string
 *
 * @example
 * normalizeToString(null) // ''
 * normalizeToString(123) // '123'
 * normalizeToString('test') // 'test'
 */
export function normalizeToString(
  value: unknown,
  defaultValue: string = ''
): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  // Fallback for other types (objects, arrays, etc.)
  return String(value);
}

/**
 * Checks if a normalized string represents a meaningful value
 * Useful for business logic (e.g., isStorno checks)
 *
 * @param value - The value to check
 * @returns true if value is non-empty after trimming
 *
 * @example
 * hasValue('  ') // false
 * hasValue('123') // true
 * hasValue(null) // false
 * hasValue(0) // false (empty string after normalization)
 * hasValue(123) // true
 */
export function hasValue(value: unknown): boolean {
  const normalized = normalizeToString(value);
  return normalized.trim() !== '';
}

/**
 * Type guard to check if value is a string at runtime
 *
 * @param value - The value to check
 * @returns true if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
