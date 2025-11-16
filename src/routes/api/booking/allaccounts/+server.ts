import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import {
  getSkrAccounts,
  getDebtorAccounts,
  getCreditorAccounts,
  resetAccountCaches
} from '$lib/server/booking/account-sources.js';

interface Account {
  account: number;
  designation: string;
  [key: string]: any;
}

interface AllAccountsResponse {
  ok: true;
  accounts: Account[];
  count: number;
  sources: {
    skr04: number;
    debtors: number;
    creditors: number;
  };
}

interface ErrorResponse {
  ok: false;
  error: string;
  accounts: Account[];
}

type ApiResponse = AllAccountsResponse | ErrorResponse;

export function GET({ url }: RequestEvent): Response {
  try {
    resetAccountCaches();

    const range = url.searchParams.get('range');
    let allAccounts: Account[] = [];
    let skrCount = 0;
    let debtorsCount = 0;
    let creditorsCount = 0;

    if (range === 'op') {
      const debtors = getDebtorAccounts();
      const creditors = getCreditorAccounts();
      allAccounts = [...debtors, ...creditors];
      skrCount = 0;
      debtorsCount = debtors.length;
      creditorsCount = creditors.length;
    } else {
      const skr = getSkrAccounts();
      const debtors = getDebtorAccounts();
      const creditors = getCreditorAccounts();
      allAccounts = [...skr, ...debtors, ...creditors];
      skrCount = skr.length;
      debtorsCount = debtors.length;
      creditorsCount = creditors.length;
    }

    allAccounts.sort((a, b) => a.account - b.account);

    return json<AllAccountsResponse>({
      ok: true,
      accounts: allAccounts,
      count: allAccounts.length,
      sources: {
        skr04: skrCount,
        debtors: debtorsCount,
        creditors: creditorsCount
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'FETCH_ACCOUNTS_FAILED';
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
