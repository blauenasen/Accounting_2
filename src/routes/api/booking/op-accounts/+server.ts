import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getDebtorAccounts, getCreditorAccounts } from '$lib/server/booking/account-sources.js';

interface Account {
  account: number;
  designation: string;
  [key: string]: any;
}

interface OpAccountsResponse {
  ok: true;
  accounts: Account[];
  count: number;
  sources: {
    debtors: number;
    creditors: number;
  };
}

interface ErrorResponse {
  ok: false;
  error: string;
  accounts: Account[];
}

type ApiResponse = OpAccountsResponse | ErrorResponse;

export function GET(): Response {
  try {
    const debtors = getDebtorAccounts();
    const creditors = getCreditorAccounts();

    const allOpAccounts = [...debtors, ...creditors];
    allOpAccounts.sort((a, b) => a.account - b.account);

    return json<OpAccountsResponse>({
      ok: true,
      accounts: allOpAccounts,
      count: allOpAccounts.length,
      sources: {
        debtors: debtors.length,
        creditors: creditors.length
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'FETCH_OP_ACCOUNTS_FAILED';
    return json<ErrorResponse>(
      {
        ok: false,
        error: errorMessage,
        accounts: []
      },
      { status: 500 }
    );
  }
}
