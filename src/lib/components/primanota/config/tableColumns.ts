// src/lib/components/primanota/config/tableColumns.ts
// Table column configuration for Primanota, Account, and OP views

/**
 * Column configuration interface
 */
export interface TableColumn {
  key: string;
  label: string;
  width: number;
  align: 'left' | 'center' | 'right';
  type: 'text' | 'number' | 'icon';
  format?: 'money' | 'date' | 'percent';
}

/**
 * Column widths for Primanota view
 */
export const PRIMANOTA_COLUMN_WIDTHS = {
  IdNr: 60,
  BL: 60,
  Warnung: 60,
  LfdNr: 60,
  UE: 100,
  SH: 60,
  GU: 60,
  BU: 60,
  GegKto: 110,
  BelNr: 200,
  Datum: 100,
  Kto: 90,
  Buchungstext: 340,
  HK: 60,
  Steuer: 90
} as const;

/**
 * Column widths for Account view
 */
export const ACCOUNT_COLUMN_WIDTHS = {
  IdNr: 60,
  BL: 60,
  Warnung: 60,
  LfdNr: 60,
  Datum: 110,
  GU: 60,
  BU: 60,
  ContraAccDynamic: 110,
  BelNr: 180,
  Steuer: 90,
  SumSoll: 110,
  SumHaben: 110,
  Balance: 110,
  Buchungstext: 320
} as const;

/**
 * Column widths for Open Items (OP) view
 */
export const OP_COLUMN_WIDTHS = {
  IdNr: 60,
  BL: 60,
  Warnung: 60,
  AusziffNr: 60,
  AusziffArt: 60,
  GU: 60,
  BelNr: 180,
  Datum: 110,
  Faelligkeit: 110,
  Buchungstext: 240,
  Brutto: 120,
  ContraAccDynamic: 120,
  BuNr: 110,
  BookCircle: 60
} as const;

/**
 * Column definitions for Primanota view
 */
export const primanotaColumns: TableColumn[] = [
  { key: 'IdNr', label: 'ID', width: PRIMANOTA_COLUMN_WIDTHS.IdNr, align: 'right', type: 'number' },
  { key: 'BL', label: 'PDF', width: PRIMANOTA_COLUMN_WIDTHS.BL, align: 'center', type: 'text' },
  { key: 'Warnung', label: 'W', width: PRIMANOTA_COLUMN_WIDTHS.Warnung, align: 'center', type: 'text' },
  { key: 'LfdNr', label: 'No', width: PRIMANOTA_COLUMN_WIDTHS.LfdNr, align: 'right', type: 'number' },
  { key: 'UE', label: 'Turnover', width: PRIMANOTA_COLUMN_WIDTHS.UE, format: 'money', align: 'right', type: 'text' },
  { key: 'SH', label: 'SH', width: PRIMANOTA_COLUMN_WIDTHS.SH, align: 'center', type: 'text' },
  { key: 'GU', label: 'GU', width: PRIMANOTA_COLUMN_WIDTHS.GU, align: 'center', type: 'text' },
  { key: 'BU', label: 'BU', width: PRIMANOTA_COLUMN_WIDTHS.BU, align: 'center', type: 'text' },
  { key: 'GegKto', label: 'Contra Acc', width: PRIMANOTA_COLUMN_WIDTHS.GegKto, align: 'right', type: 'number' },
  { key: 'BelNr', label: 'Doc Number', width: PRIMANOTA_COLUMN_WIDTHS.BelNr, align: 'left', type: 'text' },
  { key: 'Datum', label: 'Date', width: PRIMANOTA_COLUMN_WIDTHS.Datum, format: 'date', align: 'center', type: 'text' },
  { key: 'Kto', label: 'Account', width: PRIMANOTA_COLUMN_WIDTHS.Kto, align: 'right', type: 'number' },
  { key: 'Buchungstext', label: 'Booking Text', width: PRIMANOTA_COLUMN_WIDTHS.Buchungstext, align: 'left', type: 'text' },
  { key: 'HK', label: 'BC', width: PRIMANOTA_COLUMN_WIDTHS.HK, align: 'center', type: 'text' },
  { key: 'Steuer', label: 'TaxRate', width: PRIMANOTA_COLUMN_WIDTHS.Steuer, format: 'percent', align: 'right', type: 'number' }
];

/**
 * Column definitions for Account view
 */
export const accountColumns: TableColumn[] = [
  { key: 'IdNr', label: 'ID', width: ACCOUNT_COLUMN_WIDTHS.IdNr, align: 'right', type: 'number' },
  { key: 'BL', label: 'PDF', width: ACCOUNT_COLUMN_WIDTHS.BL, align: 'center', type: 'text' },
  { key: 'Warnung', label: 'W', width: ACCOUNT_COLUMN_WIDTHS.Warnung, align: 'center', type: 'text' },
  { key: 'LfdNr', label: 'No', width: ACCOUNT_COLUMN_WIDTHS.LfdNr, align: 'right', type: 'number' },
  { key: 'Datum', label: 'Date', width: ACCOUNT_COLUMN_WIDTHS.Datum, format: 'date', align: 'center', type: 'text' },
  { key: 'GU', label: 'GU', width: ACCOUNT_COLUMN_WIDTHS.GU, align: 'center', type: 'text' },
  { key: 'BU', label: 'BU', width: ACCOUNT_COLUMN_WIDTHS.BU, align: 'center', type: 'text' },
  { key: 'ContraAccDynamic', label: 'Contra Acc', width: ACCOUNT_COLUMN_WIDTHS.ContraAccDynamic, align: 'right', type: 'number' },
  { key: 'BelNr', label: 'Doc Number', width: ACCOUNT_COLUMN_WIDTHS.BelNr, align: 'left', type: 'text' },
  { key: 'Steuer', label: 'TaxRate', width: ACCOUNT_COLUMN_WIDTHS.Steuer, format: 'percent', align: 'right', type: 'number' },
  { key: 'SumSoll', label: 'Sum Soll', width: ACCOUNT_COLUMN_WIDTHS.SumSoll, format: 'money', align: 'right', type: 'text' },
  { key: 'SumHaben', label: 'Sum Haben', width: ACCOUNT_COLUMN_WIDTHS.SumHaben, format: 'money', align: 'right', type: 'text' },
  { key: 'Balance', label: 'Balance', width: ACCOUNT_COLUMN_WIDTHS.Balance, format: 'money', align: 'right', type: 'text' },
  { key: 'Buchungstext', label: 'Booking Text', width: ACCOUNT_COLUMN_WIDTHS.Buchungstext, align: 'left', type: 'text' }
];

/**
 * Column definitions for Open Items (OP) view
 */
export const opColumns: TableColumn[] = [
  { key: 'IdNr', label: 'ID', width: OP_COLUMN_WIDTHS.IdNr, align: 'right', type: 'number' },
  { key: 'BL', label: 'PDF', width: OP_COLUMN_WIDTHS.BL, align: 'center', type: 'text' },
  { key: 'Warnung', label: 'W', width: OP_COLUMN_WIDTHS.Warnung, align: 'center', type: 'icon' },
  { key: 'AusziffNr', label: 'X', width: OP_COLUMN_WIDTHS.AusziffNr, align: 'right', type: 'number' },
  { key: 'AusziffArt', label: 'T', width: OP_COLUMN_WIDTHS.AusziffArt, align: 'center', type: 'text' },
  { key: 'GU', label: 'GU', width: OP_COLUMN_WIDTHS.GU, align: 'center', type: 'text' },
  { key: 'BelNr', label: 'Doc Number', width: OP_COLUMN_WIDTHS.BelNr, align: 'left', type: 'text' },
  { key: 'Datum', label: 'Date', width: OP_COLUMN_WIDTHS.Datum, format: 'date', align: 'center', type: 'text' },
  { key: 'Faelligkeit', label: 'Due Date', width: OP_COLUMN_WIDTHS.Faelligkeit, format: 'date', align: 'center', type: 'text' },
  { key: 'Buchungstext', label: 'Booking Text', width: OP_COLUMN_WIDTHS.Buchungstext, align: 'left', type: 'text' },
  { key: 'Brutto', label: 'Gross Price', width: OP_COLUMN_WIDTHS.Brutto, format: 'money', align: 'right', type: 'text' },
  { key: 'ContraAccDynamic', label: 'Contra Account', width: OP_COLUMN_WIDTHS.ContraAccDynamic, align: 'right', type: 'number' },
  { key: 'BuNr', label: 'BuNr', width: OP_COLUMN_WIDTHS.BuNr, align: 'right', type: 'number' },
  { key: 'BookCircle', label: 'BookC', width: OP_COLUMN_WIDTHS.BookCircle, align: 'center', type: 'number' }
];

/**
 * Mode options for filtering
 */
export const MODE_OPTIONS: Record<TableColumn['type'], string[]> = {
  text: ['', '=', 'contains'],
  number: ['', '=', '>', '<'],
  icon: ['', '=', 'contains']
};

/**
 * Constants for table configuration
 */
export const TABLE_CONSTANTS = {
  HEADER_ROW_HEIGHT: 30,
  FILTER_ROW_HEIGHT: 35,
  DEFAULT_SORT: { key: 'Datum', direction: 'asc' },
  MODE_CONTAINS: 'contains',
  MODE_PLACEHOLDER: '[A]',
  VALUE_PLACEHOLDER: '- values-'
} as const;

/**
 * Event names
 */
export const TABLE_EVENTS = {
  FILTER_TOGGLE: 'booking:primanota-filter-toggle',
  CIRCLE_CHANGE: 'booking:circle-change',
  VIEW_MODE_CHANGE: 'booking:view-mode-change',
  HIDE_STORNOS_CHANGE: 'booking:hide-stornos-change',
  ACCOUNT_CHANGE: 'booking:account-change',
  OP_FILTER_CHANGE: 'booking:opfilterchange',
  DISPLAY_ROWS_CHANGE: 'booking:display-rows-change',
  RELOAD_NEEDED: 'booking:reload-needed'
} as const;

/**
 * Get columns for specific view mode
 */
export function getColumnsForView(viewMode: 'primanota' | 'account' | 'op'): TableColumn[] {
  switch (viewMode) {
    case 'account':
      return accountColumns;
    case 'op':
      return opColumns;
    default:
      return primanotaColumns;
  }
}
