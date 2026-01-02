// balanceCalculations.ts
// Balance calculation logic for Account View
// CLAUDE.md compliant: ≤500 lines

export interface AccountBalances {
  openingBalance: number;
  debitBalance: number;
  creditBalance: number;
  totalBalance: number;
  closingBalance: number;
}

/**
 * Calculate account balances from entries
 * @param entries - Array of booking entries
 * @param openingBalance - Opening balance (default: 0)
 * @returns Object with all balance values
 */
export function calculateAccountBalances(
  entries: any[],
  openingBalance: number = 0
): AccountBalances {
  let debit = 0;
  let credit = 0;

  for (const entry of entries) {
    debit += Number(entry.SumSoll) || 0;
    credit += Number(entry.SumHaben) || 0;
  }

  const total = debit - credit;
  const closing = openingBalance + total;

  return {
    openingBalance,
    debitBalance: debit,
    creditBalance: credit,
    totalBalance: total,
    closingBalance: closing
  };
}

/**
 * Calculate balance fields WITHOUT Opening-Balance entries
 * Filters out entries with Saldenvortrag accounts
 * @param allEntries - Array of ALL booking entries for the account
 * @param saldenvortragAccounts - Array of Saldenvortrag account numbers
 * @param openingBalance - Opening balance (default: 0)
 * @returns Object with balance values calculated from current bookings only
 */
export function calculateBalanceFields(
  allEntries: any[],
  saldenvortragAccounts: number[],
  openingBalance: number = 0,
  account: number
): AccountBalances {

  // Filter out Opening-Balance entries
  const currentEntries = allEntries.filter((entry) => {
    const kto = Number(entry.Kto || entry.kto || 0);
    const gegKto = Number(entry.GegKto || entry.gegKto || entry.contraAccount || 0);

    // Keep only entries where NEITHER Kto NOR GegKto is a Saldenvortrag account
    return !saldenvortragAccounts.includes(kto) &&
           !saldenvortragAccounts.includes(gegKto);
  });

  // Calculate sums from RAW fields (UE and SH) - NOT from SumSoll/SumHaben!
  let debit = 0;
  let credit = 0;

  for (const entry of currentEntries) {
    const kto = Number.parseInt(entry?.Kto ?? entry?.kto ?? 0, 10);
    const gegKto = Number.parseInt(entry?.GegKto ?? entry?.gegkto ?? 0, 10);
    const turnover = Number(entry?.UE ?? entry?.ue ?? 0) || 0;
    const sh = String(entry?.SH ?? entry?.sh ?? '').toUpperCase();

    const isInAccount = kto === account;
    const isInContraAcc = gegKto === account;

    // SAME LOGIC AS transformRowsForAccountView() (transformations.ts:114-128)
    if (isInAccount) {
      // Account position: SH stays the same
      if (sh === 'S') {
        debit += turnover;
      } else if (sh === 'H') {
        credit += turnover;
      }
    } else if (isInContraAcc) {
      // Contra Account position: SH is reversed
      if (sh === 'S') {
        credit += turnover;
      } else if (sh === 'H') {
        debit += turnover;
      }
    }
  }

  const total = debit - credit;
  const closing = openingBalance + total;

  return {
    openingBalance,
    debitBalance: debit,
    creditBalance: credit,
    totalBalance: total,
    closingBalance: closing
  };
}
