// src/lib/logic/primanota/transformations.ts
// Data transformation logic for Primanota table

import { toNumberComparable } from './filtering.js';

/**
 * Transformable row structure
 */
export interface TransformableRow {
  Kto?: number | string;
  kto?: number | string;
  GegKto?: number | string;
  gegkto?: number | string;
  JAKtoBereich?: string;
  jaktobereich?: string;
  JAGegKtoBereich?: string;
  jagegktobereich?: string;
  Steuer?: number | string;
  steuer?: number | string;
  NettoGes?: number | string;
  nettoges?: number | string;
  NETTOGES?: number | string;
  UE?: number | string;
  ue?: number | string;
  SH?: string;
  sh?: string;
  AusziffNr?: number | string | null;
  ausziffnr?: number | string | null;
  Warnung?: string;
  [key: string]: unknown;
}

/**
 * Transformed row for account/OP views
 */
export interface TransformedRow extends TransformableRow {
  ContraAccDynamic: number;
  SumSoll: number;
  SumHaben: number;
  Balance?: number;
}

/**
 * Transforms rows for account view
 * @param sourceRows Array of source rows
 * @param account Account number to filter and transform for
 * @returns Transformed rows for account view
 */
export function transformRowsForAccountView(sourceRows: TransformableRow[], account: number): TransformedRow[] {
  if (!account || !Number.isFinite(account)) {
    return [];
  }

  const filtered = sourceRows.filter((row) => {
    const kto = Number.parseInt(String(row?.Kto ?? row?.kto ?? 0), 10);
    const gegKto = Number.parseInt(String(row?.GegKto ?? row?.gegkto ?? 0), 10);
    return kto === account || gegKto === account;
  });

  return filtered.map((row) => {
    const kto = Number.parseInt(String(row?.Kto ?? row?.kto ?? 0), 10);
    const gegKto = Number.parseInt(String(row?.GegKto ?? row?.gegkto ?? 0), 10);

    const isInAccount = kto === account;
    const isInContraAcc = gegKto === account;

    let contraAccDynamic = 0;
    if (isInAccount) {
      contraAccDynamic = gegKto;
    } else if (isInContraAcc) {
      contraAccDynamic = kto;
    }

    let currentAccountJABereich = '';
    if (isInAccount) {
      currentAccountJABereich = String(row?.JAKtoBereich ?? row?.jaktobereich ?? '');
    } else if (isInContraAcc) {
      currentAccountJABereich = String(row?.JAGegKtoBereich ?? row?.jagegktobereich ?? '');
    }

    const taxValue = toNumberComparable(row?.Steuer ?? row?.steuer ?? 0) ?? 0;
    const useNettoLogic = currentAccountJABereich === 'GuV' && taxValue > 0;

    let sumSoll = 0;
    let sumHaben = 0;

    if (useNettoLogic) {
      const nettoGes = toNumberComparable(row?.NettoGes ?? row?.nettoges ?? row?.NETTOGES ?? 0) ?? 0;
      const absNettoGes = Math.abs(nettoGes);

      if (isInAccount) {
        if (nettoGes > 0) {
          sumSoll = absNettoGes;
        } else if (nettoGes < 0) {
          sumHaben = absNettoGes;
        }
      } else if (isInContraAcc) {
        if (nettoGes < 0) {
          sumHaben = absNettoGes;
        } else if (nettoGes > 0) {
          sumSoll = absNettoGes;
        }
      }
    } else {
      const turnover = toNumberComparable(row?.UE ?? row?.ue ?? 0) ?? 0;
      const sh = String(row?.SH ?? row?.sh ?? '').toUpperCase();

      if (isInAccount) {
        if (sh === 'S') {
          sumSoll = turnover;
        } else if (sh === 'H') {
          sumHaben = turnover;
        }
      } else if (isInContraAcc) {
        if (sh === 'S') {
          sumHaben = turnover;
        } else if (sh === 'H') {
          sumSoll = turnover;
        }
      }
    }

    const ausziffNr = row.AusziffNr || row.ausziffnr;

    return {
      ...row,
      ContraAccDynamic: contraAccDynamic,
      SumSoll: sumSoll,
      SumHaben: sumHaben,
      Balance: 0,
      Warnung: ausziffNr ? '✅' : (String(row.Warnung || ''))
    };
  });
}

/**
 * Transforms rows for OP view (Open Items List)
 * @param sourceRows Array of source rows
 * @param account Account number to filter and transform for
 * @param opFilter OP filter: 'open' | 'balanced' | 'all'
 * @returns Transformed rows for OP view
 */
export function transformRowsForOpView(
  sourceRows: TransformableRow[],
  account: number,
  opFilter: 'open' | 'balanced' | 'all' = 'all'
): TransformedRow[] {
  if (!account || !Number.isFinite(account)) {
    return [];
  }

  const accountFiltered = sourceRows.filter(row => {
    const kto = Number.parseInt(String(row?.Kto ?? row?.kto ?? 0), 10);
    const gegKto = Number.parseInt(String(row?.GegKto ?? row?.gegkto ?? 0), 10);

    if (kto !== account && gegKto !== account) {
      return false;
    }

    const selectedAccountInRange = account >= 10000 && account <= 99999;
    if (!selectedAccountInRange) {
      return false;
    }

    return true;
  });

  const opFiltered = accountFiltered.filter(row => {
    if (opFilter === 'open') return !row.AusziffNr;
    if (opFilter === 'balanced') return !!row.AusziffNr;
    return true;
  });

  return opFiltered.map(row => {
    const kto = Number.parseInt(String(row?.Kto ?? row?.kto ?? 0), 10);
    const gegKto = Number.parseInt(String(row?.GegKto ?? row?.gegkto ?? 0), 10);

    const isInAccount = kto === account;
    const isInContraAcc = gegKto === account;

    let contraAccDynamic = 0;
    if (isInAccount) {
      contraAccDynamic = gegKto;
    } else if (isInContraAcc) {
      contraAccDynamic = kto;
    }

    let currentAccountJABereich = '';
    if (isInAccount) {
      currentAccountJABereich = String(row?.JAKtoBereich ?? row?.jaktobereich ?? '');
    } else if (isInContraAcc) {
      currentAccountJABereich = String(row?.JAGegKtoBereich ?? row?.jagegktobereich ?? '');
    }

    const taxValue = toNumberComparable(row?.Steuer ?? row?.steuer ?? 0) ?? 0;
    const useNettoLogic = currentAccountJABereich === 'GuV' && taxValue > 0;

    let sumSoll = 0;
    let sumHaben = 0;

    if (useNettoLogic) {
      const nettoGes = toNumberComparable(row?.NettoGes ?? row?.nettoges ?? row?.NETTOGES ?? 0) ?? 0;
      const absNettoGes = Math.abs(nettoGes);

      if (isInAccount) {
        if (nettoGes > 0) {
          sumSoll = absNettoGes;
        } else if (nettoGes < 0) {
          sumHaben = absNettoGes;
        }
      } else if (isInContraAcc) {
        if (nettoGes < 0) {
          sumHaben = absNettoGes;
        } else if (nettoGes > 0) {
          sumSoll = absNettoGes;
        }
      }
    } else {
      const turnover = toNumberComparable(row?.UE ?? row?.ue ?? 0) ?? 0;
      const sh = String(row?.SH ?? row?.sh ?? '').toUpperCase();

      if (isInAccount) {
        if (sh === 'S') {
          sumSoll = turnover;
        } else if (sh === 'H') {
          sumHaben = turnover;
        }
      } else if (isInContraAcc) {
        if (sh === 'S') {
          sumHaben = turnover;
        } else if (sh === 'H') {
          sumSoll = turnover;
        }
      }
    }

    return {
      ...row,
      ContraAccDynamic: contraAccDynamic,
      SumSoll: sumSoll,
      SumHaben: sumHaben,
      Warnung: row.AusziffNr ? '✅' : ''
    };
  });
}

/**
 * Transforms rows for Primanota view - adds checkmarks for balanced items
 * @param sourceRows Array of source rows
 * @returns Transformed rows with Warnung checkmarks
 */
export function transformRowsForPrimanotaView(sourceRows: TransformableRow[]): TransformableRow[] {
  return sourceRows.map((row) => {
    const ausziffNr = row.AusziffNr || row.ausziffnr;
    return {
      ...row,
      Warnung: ausziffNr ? '✅' : (String(row.Warnung || ''))
    };
  });
}
