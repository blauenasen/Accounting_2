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
  VStUSt?: number | null;
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
  VStUSt?: number | null;
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
  account: number;
  art: string;
  year: number;
  num: number;
  date: string;
  booked: number;
  invoiceNr: string;
  estimateNr?: string | null;
  blocked: number;
  pdf_blob?: Buffer | null;
  pdf_generated_at?: string | null;
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
    id_estimate: number;      // PRIMARY KEY
    year: number;             // NOT NULL
    num: number;              // NOT NULL
    date: string;             // NOT NULL
    account: number;          // NOT NULL (war: debtor_id)
    blocked: number;          // NOT NULL, DEFAULT 0
    booked: number;           // NOT NULL, DEFAULT 0
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
  account: number;          // PRIMARY KEY (war: accountNr)
  designation: string;      // NOT NULL
  german: string;           // NOT NULL
  name: string;             // NOT NULL
  JABereich: string;        // NOT NULL (war: ja_bereich)
  JAPos: string;            // NOT NULL
  available: number;        // NOT NULL
  filterNo: number;         // NOT NULL
  TaxAcc: number;           // NOT NULL
  blocked: number;          // NOT NULL
}

/**
 * Account for account selection dialog (legacy format)
 */
export interface Account {
  account: number;
  designation: string;
  type?: string | null;
  debit_credit?: string | null;
}

/**
 * Debtor record from database
 */
export interface DebtorRecord {
  account: number;          // PRIMARY KEY (war: debtor_id)
  salutation?: string | null;
  name: string;             // NOT NULL
  adress1?: string | null;  // war: street
  adress2?: string | null;  // war: postal_code
  adress3?: string | null;  // war: city
  email?: string | null;
  name1?: string | null;
  OPBereich?: string | null;
  OPArt?: string | null;
  filterNo?: number | null;
  category?: string | null;
  info?: string | null;
  blocked?: number | null;
  Sammelkto?: number | null;
  OPVortragKto?: number | null;
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
  account: number;          // PRIMARY KEY (war: creditor_id)
  salutation?: string | null;
  name: string;             // NOT NULL
  adress1?: string | null;  // war: street
  adress2?: string | null;  // war: postal_code
  adress3?: string | null;  // war: city
  email?: string | null;
  name1?: string | null;
  OPBereich?: string | null;
  OPArt?: string | null;
  filterNo?: number | null;
  category?: string | null;
  info?: string | null;
  blocked?: number | null;
  Sammelkto?: number | null;
  OPVortragKto?: number | null;
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
 * TaxRecord 
 * */
export interface TaxRecord {
  TaxNr?: number | null;    // PRIMARY KEY
  from?: string | null;
  to?: string | null;
}

/**
 * BookCircleRecord
 */
export interface BookCircleRecord {
  idcode: number;           // PRIMARY KEY (composite)
  no: number;               // NOT NULL
  textcode: string;         // NOT NULL
  available: number;        // NOT NULL
  account: number;          // PRIMARY KEY (composite)
}

/**
 * CompanyMasterDataRecord
 */
export interface CompanyMasterDataRecord {
  firma: string;            // PRIMARY KEY
  adress1?: string | null;
  adress2?: string | null;
  email?: string | null;
  bcc?: string | null;
  tax: number;              // NOT NULL
  registration?: string | null;
  owner?: string | null;
  paydate?: number | null;
  language: string;         // NOT NULL, DEFAULT 'EN'
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

/**
 * Invoice line item from invoice_db table
 */
export interface InvoiceLine {
  id_line?: number | null;
  id_invoice: number;
  id_rate: number | null;
  description?: string;
  qty?: number;
  blocked?: number;
}
