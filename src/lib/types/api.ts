// src/lib/types/api.ts
// API request and response type definitions

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  stack?: string;
}

/**
 * API response metadata
 */
export interface ApiResponseMeta {
  timestamp: string;
  requestId?: string;
  duration?: number;
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * API request with pagination
 */
export interface PaginatedRequest {
  limit?: number;
  offset?: number;
  page?: number;
}

/**
 * API request with sorting
 */
export interface SortedRequest {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API request with filtering
 */
export interface FilteredRequest {
  filters?: Record<string, unknown>;
}

/**
 * Combined API request with pagination, sorting, and filtering
 */
export interface DataRequest extends PaginatedRequest, SortedRequest, FilteredRequest {
  search?: string;
}

/**
 * Journal query request
 */
export interface JournalQueryRequest extends DataRequest {
  jahr?: number;
  monat?: number;
  bookCircle?: string;
  kto?: number;
  gegKto?: number;
  belNr?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAusziffNr?: boolean;
  hasSplitGroup?: boolean;
  hasPdf?: boolean;
}

/**
 * Journal query response
 */
export interface JournalQueryResponse {
  entries: JournalEntryDto[];
  total: number;
  summary?: JournalSummary;
}

/**
 * Journal entry DTO (Data Transfer Object)
 */
export interface JournalEntryDto {
  idNr: number;
  jahr: number;
  monat: number;
  bookCircle: string;
  kto: number;
  gegKto: number;
  belNr: string;
  datum: string;
  buchungstext: string;
  sumSoll?: number | null;
  sumHaben?: number | null;
  bu?: number | null;
  sh?: string | null;
  gesperrt?: boolean;
  nettoGes?: number | null;
  vStUSt?: number | null;
  gu?: string | null;
  balance?: number | null;
  hasPdf?: boolean;
  hasInvoice?: boolean;
  isSplit?: boolean;
  isMatched?: boolean;
}

/**
 * Journal summary statistics
 */
export interface JournalSummary {
  totalSoll: number;
  totalHaben: number;
  totalEntries: number;
  balance: number;
}

/**
 * Create booking request
 */
export interface CreateBookingRequest {
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
  vStUSt?: number;
}

/**
 * Update booking request
 */
export interface UpdateBookingRequest {
  idNr: number;
  datum?: string;
  buchungstext?: string;
  sumSoll?: number;
  sumHaben?: number;
  bu?: number;
  sh?: string;
}

/**
 * Delete booking request
 */
export interface DeleteBookingRequest {
  idNr: number;
  force?: boolean;
}

/**
 * Create split booking request
 */
export interface CreateSplitBookingRequest {
  jahr: number;
  monat: number;
  bookCircle: string;
  datum: string;
  belNr: string;
  buchungstext: string;
  positions: SplitPositionDto[];
  type: 'invoice' | 'receipt' | 'manual';
}

/**
 * Split position DTO
 */
export interface SplitPositionDto {
  account: number;
  amount: number;
  description: string;
  taxRate?: number;
}

/**
 * Create matching request (Auszifferung)
 */
export interface CreateMatchingRequest {
  items: number[];
  ausziffArt?: string;
  ausziffDatum?: string;
  tolerance?: number;
}

/**
 * Unmatch items request
 */
export interface UnmatchItemsRequest {
  ausziffNr: number;
}

/**
 * Account query request
 */
export interface AccountQueryRequest extends DataRequest {
  type?: string;
  jaBereich?: string;
  hasBalance?: boolean;
}

/**
 * Account query response
 */
export interface AccountQueryResponse {
  accounts: AccountDto[];
  total: number;
}

/**
 * Account DTO
 */
export interface AccountDto {
  accountNr: number;
  name: string;
  type?: string;
  debitCredit?: string;
  balance?: number;
  jaBereich?: string;
}

/**
 * Invoice query request
 */
export interface InvoiceQueryRequest extends DataRequest {
  status?: string;
  debtorId?: number;
  dateFrom?: string;
  dateTo?: string;
  booked?: boolean;
  blocked?: boolean;
}

/**
 * Invoice query response
 */
export interface InvoiceQueryResponse {
  invoices: InvoiceDto[];
  total: number;
}

/**
 * Invoice DTO
 */
export interface InvoiceDto {
  id: number;
  invoiceNr?: string;
  estimateNr?: string;
  date?: string;
  debtorId?: number;
  debtorName?: string;
  total?: number;
  status?: string;
  booked?: boolean;
  blocked?: boolean;
  hasPdf?: boolean;
}

/**
 * Create invoice request
 */
export interface CreateInvoiceRequest {
  invoiceNr?: string;
  estimateNr?: string;
  date: string;
  debtorId: number;
  positions: InvoicePositionDto[];
  notes?: string;
}

/**
 * Invoice position DTO
 */
export interface InvoicePositionDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  total: number;
}

/**
 * Book invoice to journal request
 */
export interface BookInvoiceRequest {
  invoiceId: number;
  jahr: number;
  monat: number;
  bookCircle: string;
  kto: number;
  gegKto: number;
}

/**
 * Upload PDF request
 */
export interface UploadPdfRequest {
  idNr: number;
  pdfData: string;
  filename?: string;
}

/**
 * Export request
 */
export interface ExportRequest {
  format: 'csv' | 'excel' | 'pdf' | 'datev';
  filters?: JournalQueryRequest;
  includeHeaders?: boolean;
  dateFormat?: string;
}

/**
 * Export response
 */
export interface ExportResponse {
  data: string | Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Import request
 */
export interface ImportRequest {
  format: 'csv' | 'datev';
  data: string;
  options?: ImportOptions;
}

/**
 * Import options
 */
export interface ImportOptions {
  delimiter?: string;
  encoding?: string;
  skipFirstRow?: boolean;
  columnMapping?: Record<string, string>;
  validateOnly?: boolean;
}

/**
 * Import response
 */
export interface ImportResponse {
  imported: number;
  failed: number;
  errors: ImportError[];
  preview?: JournalEntryDto[];
}

/**
 * Import error
 */
export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Batch operation request
 */
export interface BatchOperationRequest<T = unknown> {
  operations: BatchOperation<T>[];
  stopOnError?: boolean;
}

/**
 * Batch operation
 */
export interface BatchOperation<T = unknown> {
  type: 'create' | 'update' | 'delete';
  data: T;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  success: number;
  failed: number;
  results: BatchOperationResult[];
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  index: number;
  success: boolean;
  error?: ApiError;
  data?: unknown;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: HealthStatus;
  memory: HealthStatus;
}

/**
 * Health status
 */
export interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message?: string;
  details?: Record<string, unknown>;
}
