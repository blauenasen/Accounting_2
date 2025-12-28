// src/lib/types/booking.ts
// Booking-related type definitions (Split, Matching, Tax, Validation)

/**
 * Split transaction position
 */
export interface SplitPosition {
  account: number;
  amount: number;
  description: string;
  taxRate?: number;
}

/**
 * Split transaction group
 */
export interface SplitGroup {
  groupId: string;
  type: SplitType;
  total: number;
  positions: SplitPosition[];
  createdAt?: string;
}

/**
 * Split transaction type
 */
export type SplitType = 'invoice' | 'receipt' | 'manual';

/**
 * Split calculation mode
 */
export type SplitMode = 'gross' | 'net';

/**
 * Split validation error
 */
export interface SplitValidationError {
  field: string;
  message: string;
  position?: number;
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
 * Open item for matching/reconciliation (Auszifferung)
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
 * Matched group of open items
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
 * Matching validation error
 */
export interface MatchingError {
  field: string;
  message: string;
  items?: number[];
}

/**
 * Matching validation result
 */
export interface MatchingResult {
  valid: boolean;
  matched: MatchedGroup[];
  errors: MatchingError[];
  totalDifference: number;
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
 * Tax calculation details
 */
export interface TaxDetails {
  brutto: number;
  netto: number;
  VStUSt: number;
  nettoGes: number;
  taxRate: number;
  taxCode: string | null;
}

/**
 * Tax rate configuration
 */
export interface TaxRate {
  code: string;
  rate: number;
  name: string;
  validFrom?: string;
  validTo?: string;
}

/**
 * Booking validation error
 */
export interface BookingValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Booking validation result
 */
export interface BookingValidationResult {
  valid: boolean;
  errors: BookingValidationError[];
}

/**
 * Validation result for row operations
 */
export interface ValidationResult {
  canDelete: boolean;
  canEdit?: boolean;
  canCancel?: boolean;
  reason: string;
}

/**
 * Booking row for display (transformed from JournalEntry)
 */
export interface BookingRow {
  IdNr: number;
  Jahr: number;
  Monat: number;
  BookCircle: string;
  Kto: number;
  GegKto: number;
  BelNr: string;
  Datum: string;
  Buchungstext: string;
  SumSoll?: number | null;
  SumHaben?: number | null;
  BU?: number | null;
  SH?: string | null;
  Gesperrt?: number | null;
  NettoGes?: number | null;
  VStUSt?: number | null;
  GU?: string | null;
  Balance?: number | null;
  pdf_blob?: Buffer | null;
  id_invoice?: number | null;
  split_group_id?: string | null;
  AusziffNr?: string | null;
}

/**
 * Account rule for automatic account selection
 */
export interface AccountRule {
  id: string;
  pattern: string;
  accountNr: number;
  contraAccountNr?: number;
  priority: number;
  enabled: boolean;
  description?: string;
}

/**
 * Account source for auto-suggestions
 */
export interface AccountSource {
  accountNr: number;
  name: string;
  type: string;
  frequency: number;
  lastUsed?: string;
}

/**
 * Account balance information
 */
export interface AccountBalance {
  accountNr: number;
  name: string;
  soll: number;
  haben: number;
  balance: number;
  jaBereich?: string | null;
}

/**
 * Primanota calculation row (with running balance)
 */
export interface CalculationRow {
  IdNr: number;
  SumSoll?: number | null;
  SumHaben?: number | null;
  Balance?: number | null;
  [key: string]: unknown;
}

/**
 * Storno booking data
 */
export interface StornoBooking {
  originalIdNr: number;
  stornoDate: string;
  stornoText: string;
  reversalType: 'full' | 'partial';
  partialAmount?: number;
}

/**
 * Booking period (Jahr/Monat)
 */
export interface BookingPeriod {
  jahr: number;
  monat: number;
  locked: boolean;
  bookCircle: string;
}

/**
 * Booking circle configuration
 */
export interface BookCircle {
  code: string;
  name: string;
  description?: string;
  enabled: boolean;
}

/**
 * Contra account suggestion
 */
export interface ContraAccountSuggestion {
  accountNr: number;
  name: string;
  confidence: number;
  reason: string;
}

/**
 * Booking template
 */
export interface BookingTemplate {
  id: string;
  name: string;
  description?: string;
  kto: number;
  gegKto: number;
  buchungstext: string;
  bu?: number;
  sh?: string;
  category?: string;
  favorite: boolean;
  useCount: number;
  lastUsed?: string;
}

/**
 * Batch booking operation
 */
export interface BatchBooking {
  entries: NewBookingEntry[];
  validateAll: boolean;
  stopOnError: boolean;
}

/**
 * New booking entry (for API)
 */
export interface NewBookingEntry {
  jahr: number;
  monat: number;
  bookCircle: string;
  kto: number;
  gegKto: number;
  belNr: string;
  datum: string;
  buchungstext: string;
  sumSoll?: number;
  sumHaben?: number;
  bu?: number;
  sh?: string;
  nettoGes?: number;
  VStUSt?: number;
  split_type?: string;
  split_group_id?: string;
  split_total?: number;
}

/**
 * Booking import data
 */
export interface BookingImport {
  source: 'csv' | 'datev' | 'manual';
  entries: NewBookingEntry[];
  validation: BookingValidationResult;
  duplicateCheck: boolean;
}

/**
 * Duplicate check result
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedEntries: number[];
  similarity: number;
}
