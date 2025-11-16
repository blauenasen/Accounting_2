import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server/index.js';

interface DebugEntry {
  UE: number;
  Kto: number;
  GegKto: number | null;
  SH: string;
  NettoGes: number | null;
  SNetto: number | null;
  HNetto: number | null;
  Steuer: number | null;
  BelNr: string | null;
  JAKtoBereich: string | null;
  JAGegKtoBereich: string | null;
  UsedAmount: number;
}

interface TotalsResponse {
  ok: true;
  totalDebit: number;
  totalCredit: number;
  account: number;
  year: number;
  month: string;
  debug: DebugEntry[];
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = TotalsResponse | ErrorResponse;

export async function GET({ url }: RequestEvent): Promise<Response> {
  const accountParam = url.searchParams.get('account');
  const yearParam = url.searchParams.get('year');
  const monthParam = url.searchParams.get('month');

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

  const month = monthParam || 'All';

  try {
    const db = getDb();

    let monthCondition = '';
    if (month === 'All') {
      monthCondition = 'Monat BETWEEN 1 AND 12';
    } else {
      const monthNum = Number(month);
      if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) {
        return json<ErrorResponse>({ ok: false, error: 'INVALID_MONTH' }, { status: 400 });
      }
      monthCondition = `Monat BETWEEN 1 AND ${monthNum}`;
    }

    const v1Query = `
      SELECT COALESCE(SUM(
        CASE
          WHEN GegKto BETWEEN 10000 AND 99999 THEN UE
          WHEN JAGegKtoBereich = 'GuV' AND Steuer > 0 THEN NettoGes
          ELSE UE
        END
      ), 0) as sum
      FROM journal
      WHERE Jahr = ?
        AND ${monthCondition}
        AND SH = 'S'
        AND GegKto = ?
        AND Kto NOT IN (1400, 3800, 9000, 9008, 9009)
        AND (GegKto NOT IN (1400, 3800, 9000, 9008, 9009) OR GegKto IS NULL)
    `;
    const v2Query = `
      SELECT COALESCE(SUM(
        CASE
          WHEN GegKto BETWEEN 10000 AND 99999 THEN UE
          WHEN JAGegKtoBereich = 'GuV' AND Steuer > 0 THEN NettoGes
          ELSE UE
        END
      ), 0) as sum
      FROM journal
      WHERE Jahr = ?
        AND ${monthCondition}
        AND SH = 'H'
        AND GegKto = ?
        AND Kto NOT IN (1400, 3800, 9000, 9008, 9009)
        AND (GegKto NOT IN (1400, 3800, 9000, 9008, 9009) OR GegKto IS NULL)
    `;
    const v3Query = `
      SELECT COALESCE(SUM(
        CASE
          WHEN Kto BETWEEN 10000 AND 99999 THEN UE
          WHEN JAKtoBereich = 'GuV' AND Steuer > 0 THEN NettoGes
          ELSE UE
        END
      ), 0) as sum
      FROM journal
      WHERE Jahr = ?
        AND ${monthCondition}
        AND SH = 'S'
        AND Kto = ?
        AND Kto NOT IN (1400, 3800, 9000, 9008, 9009)
        AND (GegKto NOT IN (1400, 3800, 9000, 9008, 9009) OR GegKto IS NULL)
    `;
    const v4Query = `
      SELECT COALESCE(SUM(
        CASE
          WHEN Kto BETWEEN 10000 AND 99999 THEN UE
          WHEN JAKtoBereich = 'GuV' AND Steuer > 0 THEN NettoGes
          ELSE UE
        END
      ), 0) as sum
      FROM journal
      WHERE Jahr = ?
        AND ${monthCondition}
        AND SH = 'H'
        AND Kto = ?
        AND Kto NOT IN (1400, 3800, 9000, 9008, 9009)
        AND (GegKto NOT IN (1400, 3800, 9000, 9008, 9009) OR GegKto IS NULL)
    `;

    const v1 = (db.prepare(v1Query).get(year, account) as any)?.sum ?? 0;
    const v2 = (db.prepare(v2Query).get(year, account) as any)?.sum ?? 0;
    const v3 = (db.prepare(v3Query).get(year, account) as any)?.sum ?? 0;
    const v4 = (db.prepare(v4Query).get(year, account) as any)?.sum ?? 0;

    let totalDebit = 0;
    let totalCredit = 0;

    totalCredit += v1;
    totalDebit += v2;
    totalDebit += v3;
    totalCredit += v4;

    if (account >= 70000 && account <= 99999) {
      totalCredit = -Math.abs(totalCredit);
      totalDebit = Math.abs(totalDebit);
    }

    const debugQuery = `
      SELECT UE, Kto, GegKto, SH, NettoGes, SNetto, HNetto, Steuer, BelNr, JAKtoBereich, JAGegKtoBereich,
             CASE
               WHEN Kto = ? AND Kto BETWEEN 10000 AND 99999 THEN UE
               WHEN Kto = ? AND JAKtoBereich = 'GuV' AND Steuer > 0 THEN NettoGes
               WHEN GegKto = ? AND GegKto BETWEEN 10000 AND 99999 THEN UE
               WHEN GegKto = ? AND JAGegKtoBereich = 'GuV' AND Steuer > 0 THEN NettoGes
               ELSE UE
             END as UsedAmount
      FROM journal
      WHERE Jahr = ?
        AND ${monthCondition}
        AND (Kto = ? OR GegKto = ?)
        AND Kto NOT IN (1400, 3800, 9000, 9008, 9009)
        AND (GegKto NOT IN (1400, 3800, 9000, 9008, 9009) OR GegKto IS NULL)
      ORDER BY UE
    `;
    const debugEntries = db.prepare(debugQuery).all(account, account, account, account, year, account, account) as DebugEntry[];

    return json<TotalsResponse>({
      ok: true,
      totalDebit: Number(totalDebit),
      totalCredit: Number(totalCredit),
      account,
      year,
      month,
      debug: debugEntries
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ACCOUNT_TOTALS_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
