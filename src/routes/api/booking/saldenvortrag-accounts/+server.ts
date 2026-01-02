import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server/index.js';

interface SaldenvortragAccountsResponse {
  ok: true;
  accounts: number[];
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = SaldenvortragAccountsResponse | ErrorResponse;

export async function GET({ url }: RequestEvent): Promise<Response> {
  try {
    const db = getDb();

    // Load Saldenvortrag accounts dynamically from ledgers (NO hardcoded values!)
    const ledgersQuery = `
      SELECT account
      FROM ledgers
      WHERE JAPos = 'Saldenvortrag'
    `;

    const accounts = db.prepare(ledgersQuery)
      .all()
      .map((row: any) => row.account);

    return json<SaldenvortragAccountsResponse>({
      ok: true,
      accounts
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'SALDENVORTRAG_ACCOUNTS_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
