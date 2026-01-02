// transformations.ts
// Data transformation logic for Booking views (Account View & OP View)
// CLAUDE.md compliant: ≤500 lines

/**
 * Converts a value to a comparable number, handling various formats
 */
export function toNumberComparable(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  let str = String(value).trim();
  if (!str) {
    return null;
  }
  // Remove spaces and percentage signs
  str = str.replace(/\s+/g, '').replace(/%/g, '');

  // Handle European number format (1.234,56 → 1234.56)
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  if (hasComma && hasDot) {
    str = str.replace(/\./g, '').replace(/,/g, '.');
  } else if (hasComma) {
    str = str.replace(/,/g, '.');
  }

  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

/**
 * Transforms rows for account view
 * Filters rows where the selected account appears in either Kto or GegKto
 * and adds computed fields (ContraAccDynamic, SumSoll, SumHaben)
 */
export function transformRowsForAccountView(sourceRows: any[], account: number): any[] {
  if (!account || !Number.isFinite(account)) {
    return [];
  }

  // Filter rows where account appears in either Kto or GegKto
  const filtered = sourceRows.filter((row) => {
    const kto = Number.parseInt(row?.Kto ?? row?.kto ?? 0, 10);
    const gegKto = Number.parseInt(row?.GegKto ?? row?.gegkto ?? 0, 10);
    return kto === account || gegKto === account;
  });

  // Transform each row to add computed fields
  return filtered.map((row) => {
    const kto = Number.parseInt(row?.Kto ?? row?.kto ?? 0, 10);
    const gegKto = Number.parseInt(row?.GegKto ?? row?.gegkto ?? 0, 10);

    const isInAccount = kto === account;
    const isInContraAcc = gegKto === account;

    // Dynamic Contra Account: show the OTHER account
    let contraAccDynamic = 0;
    if (isInAccount) {
      contraAccDynamic = gegKto;
    } else if (isInContraAcc) {
      contraAccDynamic = kto;
    }

    // Determine which JABereich applies to the CURRENT account we are viewing
    let currentAccountJABereich = '';
    if (isInAccount) {
      // We are viewing the account in Kto column → use JAKtoBereich
      currentAccountJABereich = row?.JAKtoBereich ?? row?.jaktobereich ?? '';
    } else if (isInContraAcc) {
      // We are viewing the account in GegKto column → use JAGegKtoBereich
      currentAccountJABereich = row?.JAGegKtoBereich ?? row?.jagegktobereich ?? '';
    }

    // Decide: Use NettoGes ONLY if THIS account is GuV AND has tax > 0
    const taxValue = toNumberComparable(row?.Steuer ?? row?.steuer ?? 0) ?? 0;
    const useNettoLogic = currentAccountJABereich === 'GuV' && taxValue > 0;

    // Calculate Sum Soll and Sum Haben
    let sumSoll = 0;
    let sumHaben = 0;

    if (useNettoLogic) {
      // NETTO LOGIC: Use NettoGes (for GuV accounts with tax > 0)
      const nettoGes = toNumberComparable(row?.NettoGes ?? row?.nettoges ?? row?.NETTOGES ?? 0) ?? 0;

      // NettoGes is always used as absolute value - sign indicates Soll/Haben direction
      const absNettoGes = Math.abs(nettoGes);

      if (isInAccount) {
        // Account position: positive NettoGes → Soll, negative NettoGes → Haben
        if (nettoGes > 0) {
          sumSoll = absNettoGes;
        } else if (nettoGes < 0) {
          sumHaben = absNettoGes;
        }
      } else if (isInContraAcc) {
        // Contra Account position: reversed - negative NettoGes → Haben, positive NettoGes → Soll
        if (nettoGes < 0) {
          sumHaben = absNettoGes;
        } else if (nettoGes > 0) {
          sumSoll = absNettoGes;
        }
      }
    } else {
      // BRUTTO LOGIC: Use Turnover (UE) and SH
      // Used for: non-GuV accounts OR GuV accounts with tax = 0
      const turnover = toNumberComparable(row?.UE ?? row?.ue ?? 0) ?? 0;
      const sh = String(row?.SH ?? row?.sh ?? '').toUpperCase();

      if (isInAccount) {
        // Account position: SH stays the same
        if (sh === 'S') {
          sumSoll = turnover;
        } else if (sh === 'H') {
          sumHaben = turnover;
        }
      } else if (isInContraAcc) {
        // Contra Account position: SH is reversed
        if (sh === 'S') {
          sumHaben = turnover;
        } else if (sh === 'H') {
          sumSoll = turnover;
        }
      }
    }

    // Add checkmark to Warnung column if AusziffNr exists (balanced items)
    const ausziffNr = row.AusziffNr || row.ausziffnr || row.ausziffNr;

    return {
      ...row,
      ContraAccDynamic: contraAccDynamic,
      SumSoll: sumSoll,
      SumHaben: sumHaben,
      Balance: 0, // Will be calculated later
      Warnung: ausziffNr ? '✅' : (row.Warnung || '')
    };
  });
}

/**
 * Transforms rows for OP view (Open Items List)
 * Similar to account view but with additional OP-specific filtering
 */
export function transformRowsForOpView(
  sourceRows: any[],
  account: number,
  opFilter: 'open' | 'balanced' | 'all' = 'all'
): any[] {
  if (!account || !Number.isFinite(account)) {
    return [];
  }

  // 1. Filter by account (like Account View)
  const accountFiltered = sourceRows.filter(row => {
    const kto = Number.parseInt(row?.Kto ?? row?.kto ?? 0, 10);
    const gegKto = Number.parseInt(row?.GegKto ?? row?.gegkto ?? 0, 10);

    // Check if selected account appears in this row
    if (kto !== account && gegKto !== account) {
      return false;
    }

    // OP-View: Selected account must be debtor/creditor (10000-99999)
    const selectedAccountInRange = account >= 10000 && account <= 99999;
    if (!selectedAccountInRange) {
      return false;
    }

    return true;
  });

  // 2. Filter by OP status
  const opFiltered = accountFiltered.filter(row => {
    if (opFilter === 'open') return !row.AusziffNr;
    if (opFilter === 'balanced') return !!row.AusziffNr;
    return true; // 'all'
  });

  // 3. Transform rows (same as Account View)
  return opFiltered.map(row => {
    const kto = Number.parseInt(row?.Kto ?? row?.kto ?? 0, 10);
    const gegKto = Number.parseInt(row?.GegKto ?? row?.gegkto ?? 0, 10);

    const isInAccount = kto === account;
    const isInContraAcc = gegKto === account;

    // Dynamic Contra Account: show the OTHER account
    let contraAccDynamic = 0;
    if (isInAccount) {
      contraAccDynamic = gegKto;
    } else if (isInContraAcc) {
      contraAccDynamic = kto;
    }

    // JABereich logic (SAME AS ACCOUNT VIEW)
    let currentAccountJABereich = '';
    if (isInAccount) {
      currentAccountJABereich = row?.JAKtoBereich ?? row?.jaktobereich ?? '';
    } else if (isInContraAcc) {
      currentAccountJABereich = row?.JAGegKtoBereich ?? row?.jagegktobereich ?? '';
    }

    const taxValue = toNumberComparable(row?.Steuer ?? row?.steuer ?? 0) ?? 0;
    const useNettoLogic = currentAccountJABereich === 'GuV' && taxValue > 0;

    // Calculate Sum Soll and Sum Haben (SAME AS ACCOUNT VIEW)
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
      Warnung: row.AusziffNr ? '✅' : '' // Icon if balanced
    };
  });
}
