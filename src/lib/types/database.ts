// src/lib/types/database.ts
// Database and Journal type definitions with German column names

/**
 * Journal entry from database (German column names)
 * Column names match the actual database schema (capitalized German names)
 */
export interface JournalEntry {
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
  vStUSt?: number | null;
  GU?: string | null;
  ErfDatum?: string | null;
  VerantwUID?: string | null;
  timestamp?: string | null;

  // PDF integration
  id_invoice?: number | null;
  pdf_blob?: Buffer | null;
  pdf_generated_at?: string | null;

  // Split transaction fields
  split_type?: string | null;
  split_group_id?: string | null;
  split_total?: number | null;

  // Reconciliation fields (Auszifferung)
  AusziffNr?: string | null;
  AusziffArt?: string | null;
  AusziffDatum?: string | null;
}

/**
 * Subset of journal fields used for creating new entries
 */
export interface NewJournalEntry {
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
  vStUSt?: number | null;
  GU?: string | null;
  VerantwUID?: string | null;
  id_invoice?: number | null;
  split_type?: string | null;
  split_group_id?: string | null;
  split_total?: number | null;
}

/**
 * Invoice record from database
 */
export interface InvoiceRecord {
  id_invoice: number;
  invoiceNr?: string | null;
  estimateNr?: string | null;
  art?: string | null;
  date?: string | null;
  debtor_id?: number | null;
  total?: number | null;
  status?: string | null;
  booked?: number | null;
  blocked?: number | null;
  pdf_blob?: Buffer | null;
  pdf_generated_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Subset of invoice fields for creating new invoices
 */
export interface NewInvoice {
  invoiceNr?: string | null;
  estimateNr?: string | null;
  art?: string | null;
  date?: string | null;
  debtor_id?: number | null;
  total?: number | null;
  status?: string | null;
  booked?: number | null;
  blocked?: number | null;
}

/**
 * Estimate record from database
 */
export interface EstimateRecord {
  id_estimate: number;
  estimateNr?: string | null;
  date?: string | null;
  debtor_id?: number | null;
  total?: number | null;
  status?: string | null;
  blocked?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Subset of estimate fields for creating new estimates
 */
export interface NewEstimate {
  estimateNr?: string | null;
  date?: string | null;
  debtor_id?: number | null;
  total?: number | null;
  status?: string | null;
  blocked?: number | null;
}

/**
 * SKR04 account from database
 */
export interface AccountRecord {
  accountNr: number;
  name: string;
  type?: string | null;
  debit_credit?: string | null;
  balance?: number | null;
  ja_bereich?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Debtor record from database
 */
export interface DebtorRecord {
  debtor_id: number;
  name: string;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  vat_id?: string | null;
  account_nr?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Subset of debtor fields for creating/updating debtors
 */
export interface NewDebtor {
  name: string;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  vat_id?: string | null;
  account_nr?: number | null;
}

/**
 * Creditor record from database
 */
export interface CreditorRecord {
  creditor_id: number;
  name: string;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  vat_id?: string | null;
  account_nr?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Subset of creditor fields for creating/updating creditors
 */
export interface NewCreditor {
  name: string;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  vat_id?: string | null;
  account_nr?: number | null;
}

/**
 * Email account configuration
 */
export interface EmailAccountRecord {
  SMTP_HOST: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_PORT: number;
  SMTP_SECURE: number;
  SMTP_FROM: string;
  MAIL_BCC: string;
  IMAP_HOST?: string | null;
  IMAP_USER?: string | null;
  IMAP_PASS?: string | null;
  IMAP_PORT?: number | null;
  IMAP_SECURE?: number | null;
  IMAP_SENT?: string | null;
}

/**
 * Tax rate record
 */
export interface TaxRateRecord {
  id: number;
  name: string;
  rate: number;
  code?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  created_at?: string | null;
}

/**
 * Company code configuration
 */
export interface CompanyCodeRecord {
  code: string;
  name: string;
  vat_id?: string | null;
  tax_id?: string | null;
  street?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  bic?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Stammdaten (master data) record
 */
export interface StammdatenRecord {
  key: string;
  value: string;
  category?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Database query result wrapper
 */
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

/**
 * Database pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Database filter parameters for journal queries
 */
export interface JournalFilter {
  jahr?: number;
  monat?: number;
  bookCircle?: string;
  kto?: number;
  gegKto?: number;
  belNr?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAusziffNr?: boolean;
  ausziffNr?: string;
  hasSplitGroup?: boolean;
  splitGroupId?: string;
  hasPdf?: boolean;
}

/**
 * Database sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Database transaction context
 */
export interface TransactionContext {
  inTransaction: boolean;
  transactionId?: string;
}
