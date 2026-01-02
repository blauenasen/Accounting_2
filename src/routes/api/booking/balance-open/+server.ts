import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server/index.js';

interface BalanceOpenResponse {
  ok: true;
  balanceOpen: number;
  account: number;
  year: number;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = BalanceOpenResponse | ErrorResponse;

export async function GET({ url }: RequestEvent): Promise<Response> {
  const accountParam = url.searchParams.get('account');
  const yearParam = url.searchParams.get('year');

  if (!accountParam) {
    return json<ErrorResponse>({ ok: false, error: 'MISSING_ACCOUNT' }, { status: 400 });
  }

  const account = Number(accountParam);
  if (!Number.isFinite(account)) {
    return json<ErrorResponse>({ ok: false, error: 'INVALID_ACCOUNT' }, { status: 400 });
  }

  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  if (!Number.isFinite(year)) {
    return json<ErrorResponse>({ ok: false, error: 'INVALID_YEAR' }, { status: 400 });
  }

  try {
    const db = getDb();

    // 1. Lade Saldenvortrag-Konten
    const ledgersQuery = `
      SELECT account
      FROM ledgers
      WHERE JAPos = 'Saldenvortrag'
    `;

    const saldenvortragAccounts = db.prepare(ledgersQuery)
      .all()
      .map((row: any) => row.account);

    // 2. Erstelle dynamische IN-Clause
    const placeholders = saldenvortragAccounts.map(() => '?').join(',');

    // 3. Query: Account kann in BEIDEN Positionen vorkommen
    const query = `
      SELECT SUM(
        CASE
          WHEN Kto = ? THEN
            CASE
              WHEN SH = 'S' THEN UE
              WHEN SH = 'H' THEN -UE
              ELSE 0
            END
          WHEN GegKto = ? THEN
            CASE
              WHEN SH = 'S' THEN -UE
              WHEN SH = 'H' THEN UE
              ELSE 0
            END
          ELSE 0
        END
      ) as balanceOpen
      FROM journal
      WHERE (Kto = ? OR GegKto = ?)
        AND (Kto IN (${placeholders}) OR GegKto IN (${placeholders}))
    `;

    const params = [
      account,
      account,
      account,
      account,
      ...saldenvortragAccounts,
      ...saldenvortragAccounts
    ];

    const row = db.prepare(query).get(...params) as any;
    const balanceOpen = row?.balanceOpen ?? 0;

    return json<BalanceOpenResponse>({
      ok: true,
      balanceOpen: Number(balanceOpen),
      account,
      year
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'BALANCE_OPEN_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
