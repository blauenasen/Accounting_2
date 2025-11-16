// src/lib/types/ui.ts
// UI and Form type definitions

import type { ToastType } from '../utils/toast.js';

/**
 * View mode for Primanota display
 */
export type ViewMode = 'primanota' | 'account' | 'op';

/**
 * Table sort state
 */
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Table column definition
 */
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
  visible?: boolean;
}

/**
 * Table filter state
 */
export interface FilterState {
  column: string;
  operator: FilterOperator;
  value: unknown;
  active: boolean;
}

/**
 * Filter operator
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * Selection state for multi-select tables
 */
export interface SelectionState {
  selectedIds: Set<number>;
  selectAll: boolean;
  excludedIds: Set<number>;
}

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Form field definition
 */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  helpText?: string;
}

/**
 * Form field type
 */
export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'currency'
  | 'percentage';

/**
 * Form field option (for select/radio)
 */
export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Form field validation rules
 */
export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

/**
 * Form state
 */
export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeable?: boolean;
}

/**
 * Dialog options
 */
export interface DialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Toast message (extends ToastType from utils/toast)
 */
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

/**
 * Error state
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: unknown;
}

/**
 * Booking form data (comprehensive with all UI fields)
 */
export interface BookingFormData {
  // Basic UI fields
  bookCircle: string;
  gu: string;
  turnover: string;
  sh: string;
  contra: string;
  reference: string;
  date: string;
  account: string;
  tax: string;
  due: string;
  disc: string;
  desc: string;

  // Database fields (populated on edit)
  idNr: number | null;
  jahr: number | null;
  monat: number | null;
  tag: number | null;
  lfdNr: number | null;
  id_invoice: string | null;

  // Calculated fields
  nettoGes: number | null;
  steuer: number | null;
  vStUSt: number | null;
  bu: number | null;
}

/**
 * Legacy booking form data (for API compatibility)
 */
export interface LegacyBookingFormData {
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
 * Split booking form data
 */
export interface SplitBookingFormData {
  jahr: number;
  monat: number;
  bookCircle: string;
  datum: string;
  belNr: string;
  buchungstext: string;
  type: 'invoice' | 'receipt' | 'manual';
  positions: SplitPositionFormData[];
}

/**
 * Split position form data
 */
export interface SplitPositionFormData {
  account: number;
  amount: number;
  description: string;
  taxRate?: number;
}

/**
 * Invoice form data
 */
export interface InvoiceFormData {
  invoiceNr?: string;
  estimateNr?: string;
  date: string;
  debtorId: number;
  positions: InvoicePositionFormData[];
  notes?: string;
}

/**
 * Invoice position form data
 */
export interface InvoicePositionFormData {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

/**
 * Search state
 */
export interface SearchState {
  query: string;
  filters: Record<string, unknown>;
  results: unknown[];
  totalResults: number;
  isSearching: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

/**
 * Navigation item
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  children?: NavigationItem[];
  badge?: string | number;
}

/**
 * Tab item
 */
export interface TabItem {
  id: string;
  label: string;
  content?: unknown;
  disabled?: boolean;
  badge?: string | number;
}

/**
 * Dropdown item
 */
export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

/**
 * Action button
 */
export interface ActionButton {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
}

/**
 * Toolbar state
 */
export interface ToolbarState {
  visible: boolean;
  actions: ActionButton[];
  selectedCount?: number;
}

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  collapsed: boolean;
  pinned: boolean;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: ThemeConfig;
  locale: 'de' | 'en';
  dateFormat: 'iso' | 'us' | 'de';
  numberFormat: 'de' | 'en';
  pageSize: number;
  defaultView: ViewMode;
  sidebar: SidebarState;
}

/**
 * Keyboard shortcut
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description?: string;
}

/**
 * Context menu item
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
  onClick?: () => void;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * File upload state
 */
export interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  errors: string[];
}

/**
 * Drag and drop state
 */
export interface DragDropState {
  isDragging: boolean;
  draggedItem?: unknown;
  dropTarget?: string;
}

/**
 * Undo/Redo state
 */
export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  history: unknown[];
  currentIndex: number;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders: boolean;
  selectedOnly: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

/**
 * Print options
 */
export interface PrintOptions {
  orientation: 'portrait' | 'landscape';
  paperSize: 'a4' | 'letter';
  includeHeaders: boolean;
  includeFooters: boolean;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartDataPoint[];
  options?: Record<string, unknown>;
}

/**
 * Booking form dialog state
 */
export interface BookingFormDialogState {
  accountSelection: {
    visible: boolean;
    field: string;
    accounts: unknown[];
    filter: string;
  };
  duplicateWarning: {
    visible: boolean;
    duplicateInfo: Record<string, unknown>;
  };
  yearMismatch: {
    visible: boolean;
    confirmationStage: number;
    bookingYear: number | null;
    pendingPayload: unknown | null;
  };
  dateMonthMismatch: {
    visible: boolean;
    dateMonth: number | null;
    selectedMonth: number | null;
    currentDate: string;
  };
  validation: {
    visible: boolean;
    errors: string[];
  };
  pdfOverwrite: {
    visible: boolean;
  };
  pdfDelete: {
    visible: boolean;
  };
}

/**
 * Booking form keep flags
 */
export interface BookingFormKeepFlags {
  contra: boolean;
  date: boolean;
  account: boolean;
  tax: boolean;
  desc: boolean;
}

/**
 * Journal row from database
 */
export interface JournalRow {
  IdNr?: number | null;
  Jahr?: number | null;
  Monat?: number | null;
  Tag?: number | null;
  LfdNr?: number | null;
  BookCircle?: number | null;
  Kto?: number | null;
  GegKto?: number | null;
  UE?: number | null;
  Brutto?: number | null;
  NettoGes?: number | null;
  VStUSt?: number | null;
  Steuer?: number | null;
  BU?: number | null;
  SH?: string | null;
  GU?: string | null;
  BelNr?: string | null;
  Datum?: string | null;
  Buchungstext?: string | null;
  FaDatum?: string | null;
  Skonto?: number | null;
  HK?: string | null;
  BL?: string | null;
  Warnung?: string | null;
  Gesperrt?: boolean | null;
  pdf_blob?: unknown | null;
  id_invoice?: number | null;
  AusziffNr?: number | null;
  AusziffArt?: string | null;
  Faelligkeit?: string | null;
  // Computed fields for display
  ContraAccDynamic?: number | null;
  SumSoll?: number | null;
  SumHaben?: number | null;
  Balance?: number | null;
  BuNr?: number | null;
  // Allow lowercase variants for compatibility
  [key: string]: unknown;
}

/**
 * Primanota table dialog state
 */
export interface PrimanotaDialogState {
  cancelBooking: {
    visible: boolean;
    bookingData: JournalRow | null;
  };
  splitKreditor: {
    visible: boolean;
    invoiceData: {
      creditorName: string;
      invoiceNr: string;
      date: string;
      amount: number;
      idNr: number;
    } | null;
  };
  splitDebitor: {
    visible: boolean;
    invoiceData: {
      debitorName: string;
      invoiceNr: string;
      date: string;
      amount: number;
      idNr: number;
    } | null;
  };
  reconcile: {
    visible: boolean;
    selectedEntries: JournalRow[];
  };
  accountSelection: {
    visible: boolean;
    field: string;
    bookCircle: number | null;
    accounts: unknown[];
  };
}

/**
 * Primanota table sort state
 */
export interface PrimanotaSortState {
  key: string;
  direction: 'asc' | 'desc';
  userSelected: boolean;
}

/**
 * Primanota table filter state (per column)
 */
export interface PrimanotaFilterState {
  mode: string;
  valueKey: string;
  inputValue: string;
  comparableValue: string | number | null;
}

/**
 * Context menu state
 */
export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  rowIndex: number | null;
}
