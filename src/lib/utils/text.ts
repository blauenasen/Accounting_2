// src/lib/utils/text.ts
// Text manipulation and validation utilities

/**
 * Truncates a string to specified length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param ellipsis Ellipsis string (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Truncates text at word boundary
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param ellipsis Ellipsis string (default: '...')
 * @returns Truncated text at word boundary
 */
export function truncateWords(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  const truncated = text.slice(0, maxLength - ellipsis.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + ellipsis;
  }

  return truncated + ellipsis;
}

/**
 * Capitalizes first letter of string
 * @param text Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalizes first letter of each word
 * @param text Text to capitalize
 * @returns Title-cased text
 */
export function titleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts text to camelCase
 * @param text Text to convert
 * @returns camelCase text
 */
export function camelCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Converts text to kebab-case
 * @param text Text to convert
 * @returns kebab-case text
 */
export function kebabCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts text to snake_case
 * @param text Text to convert
 * @returns snake_case text
 */
export function snakeCase(text: string): string {
  if (!text) return '';
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Generates a URL-friendly slug from text
 * @param text Text to slugify
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Removes all HTML tags from text
 * @param html HTML string
 * @returns Plain text
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escapes HTML special characters
 * @param text Text to escape
 * @returns Escaped text
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Unescapes HTML entities
 * @param text Text with HTML entities
 * @returns Unescaped text
 */
export function unescapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, entity => map[entity]);
}

/**
 * Highlights search term in text
 * @param text Text to search in
 * @param searchTerm Search term
 * @param highlightClass CSS class for highlight (default: 'highlight')
 * @returns Text with highlighted search term
 */
export function highlightSearchTerm(
  text: string,
  searchTerm: string,
  highlightClass: string = 'highlight'
): string {
  if (!text || !searchTerm) return text || '';

  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');

  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
}

/**
 * Pluralizes a word based on count (English)
 * @param count Count
 * @param singular Singular form
 * @param plural Plural form (optional, adds 's' if not provided)
 * @returns Pluralized word
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
}

/**
 * Pluralizes a word based on count (German)
 * @param count Count
 * @param singular Singular form
 * @param plural Plural form
 * @returns Pluralized word
 */
export function pluralizeGerman(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Validates email address
 * @param email Email to validate
 * @returns true if valid email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validates German phone number
 * @param phone Phone number to validate
 * @returns true if valid German phone
 */
export function isValidGermanPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const regex = /^(\+49|0049|0)[1-9]\d{1,14}$/;
  return regex.test(cleaned);
}

/**
 * Validates IBAN
 * @param iban IBAN to validate
 * @returns true if valid IBAN format
 */
export function isValidIBAN(iban: string): boolean {
  if (!iban) return false;
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  const regex = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;

  if (!regex.test(cleaned)) {
    return false;
  }

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numericString = rearranged.replace(/[A-Z]/g, char => String(char.charCodeAt(0) - 55));

  let remainder = '';
  for (let i = 0; i < numericString.length; i++) {
    remainder = String(Number(remainder + numericString[i]) % 97);
  }

  return remainder === '1';
}

/**
 * Validates German VAT ID (USt-IdNr)
 * @param vatId VAT ID to validate
 * @returns true if valid German VAT ID format
 */
export function isValidGermanVatId(vatId: string): boolean {
  if (!vatId) return false;
  const cleaned = vatId.replace(/\s/g, '').toUpperCase();
  const regex = /^DE\d{9}$/;
  return regex.test(cleaned);
}

/**
 * Formats IBAN with spaces
 * @param iban IBAN to format
 * @returns Formatted IBAN (e.g., "DE89 3704 0044 0532 0130 00")
 */
export function formatIBAN(iban: string): string {
  if (!iban) return '';
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Formats German phone number
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatGermanPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('+49')) {
    const number = cleaned.slice(3);
    return `+49 ${number.slice(0, 3)} ${number.slice(3)}`;
  } else if (cleaned.startsWith('0')) {
    const number = cleaned.slice(1);
    return `0${number.slice(0, 3)} ${number.slice(3)}`;
  }

  return phone;
}

/**
 * Checks if text contains search term (case-insensitive)
 * @param text Text to search in
 * @param searchTerm Search term
 * @returns true if text contains search term
 */
export function contains(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Checks if text starts with prefix (case-insensitive)
 * @param text Text to check
 * @param prefix Prefix to look for
 * @returns true if text starts with prefix
 */
export function startsWith(text: string, prefix: string): boolean {
  if (!text || !prefix) return false;
  return text.toLowerCase().startsWith(prefix.toLowerCase());
}

/**
 * Checks if text ends with suffix (case-insensitive)
 * @param text Text to check
 * @param suffix Suffix to look for
 * @returns true if text ends with suffix
 */
export function endsWith(text: string, suffix: string): boolean {
  if (!text || !suffix) return false;
  return text.toLowerCase().endsWith(suffix.toLowerCase());
}

/**
 * Removes leading and trailing whitespace and normalizes internal whitespace
 * @param text Text to normalize
 * @returns Normalized text
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Pads string to specified length with character
 * @param text Text to pad
 * @param length Target length
 * @param char Padding character (default: ' ')
 * @param side Padding side (default: 'start')
 * @returns Padded text
 */
export function pad(
  text: string,
  length: number,
  char: string = ' ',
  side: 'start' | 'end' = 'start'
): string {
  if (!text) text = '';
  if (text.length >= length) return text;

  const padLength = length - text.length;
  const padding = char.repeat(padLength);

  return side === 'start' ? padding + text : text + padding;
}

/**
 * Reverses a string
 * @param text Text to reverse
 * @returns Reversed text
 */
export function reverse(text: string): string {
  if (!text) return '';
  return text.split('').reverse().join('');
}

/**
 * Counts occurrences of substring in text
 * @param text Text to search in
 * @param substring Substring to count
 * @param caseSensitive Case sensitive search (default: false)
 * @returns Number of occurrences
 */
export function countOccurrences(
  text: string,
  substring: string,
  caseSensitive: boolean = false
): number {
  if (!text || !substring) return 0;

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchTerm = caseSensitive ? substring : substring.toLowerCase();

  let count = 0;
  let position = 0;

  while ((position = searchText.indexOf(searchTerm, position)) !== -1) {
    count++;
    position += searchTerm.length;
  }

  return count;
}

/**
 * Extracts initials from name
 * @param name Full name
 * @param maxInitials Maximum number of initials (default: 2)
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials;
}

/**
 * Generates random string
 * @param length Length of random string
 * @param charset Character set to use (default: alphanumeric)
 * @returns Random string
 */
export function randomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Converts string to boolean
 * @param value String to convert
 * @returns Boolean value
 */
export function toBoolean(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return ['true', '1', 'yes', 'ja', 'y', 'on'].includes(normalized);
}

/**
 * Sanitizes filename (removes invalid characters)
 * @param filename Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '');
}

/**
 * Extracts file extension from filename
 * @param filename Filename
 * @returns File extension (without dot)
 */
export function getFileExtension(filename: string): string {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Removes file extension from filename
 * @param filename Filename
 * @returns Filename without extension
 */
export function removeFileExtension(filename: string): string {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return filename;
  return filename.slice(0, lastDot);
}

/**
 * Formats a list of items with proper conjunction
 * @param items Array of items
 * @param conjunction Conjunction word (default: 'and')
 * @returns Formatted list (e.g., "A, B, and C")
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}

/**
 * Wraps text to specified width
 * @param text Text to wrap
 * @param width Maximum line width
 * @returns Wrapped text with line breaks
 */
export function wrapText(text: string, width: number): string {
  if (!text || width <= 0) return text || '';

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}
