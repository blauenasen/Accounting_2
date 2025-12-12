import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface AccountDetails {
  ok: true;
  account: number;
  designation: string;
  category: string | null;
  jabereich: string | null;
  japos: string | null;
  debit_credit: string;
  taxgroup: string | number | null;
  Sammelkto: number | null;
  OPVortragKto: number | null;
  source: 'skr04_accounts' | 'debtors' | 'creditors';
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type AccountDetailsResponse = AccountDetails | ErrorResponse;

function toOptionalInt(value: string | null): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function GET({ url }: RequestEvent): Response {
  const accountParam = url.searchParams.get('account');
  const account = toOptionalInt(accountParam);

  if (!Number.isFinite(account) || account === null || account <= 0) {
    return json<ErrorResponse>({ ok: false, error: 'INVALID_ACCOUNT' }, { status: 400 });
  }

  try {
    let stmt = db.prepare(`
      SELECT account, designationEN, designationDE, debit_credit, category,
             jabereich, japos, taxgroup
      FROM skr04_accounts
      WHERE account = ?
    `);
    let row = stmt.get(account) as any;

    if (row) {
      return json<AccountDetails>({
        ok: true,
        account: row.account,
        designation: row.designationEN || row.designationDE,
        category: row.category,
        jabereich: row.jabereich,
        japos: row.japos,
        debit_credit: row.debit_credit,
        taxgroup: row.taxgroup,
        Sammelkto: null,
        OPVortragKto: null,
        source: 'skr04_accounts'
      });
    }

    stmt = db.prepare(`
      SELECT account, name, category, OPBereich, OPArt, Sammelkto, OPVortragKto
      FROM debtors
      WHERE account = ?
    `);
    row = stmt.get(account) as any;

    if (row) {
      return json<AccountDetails>({
        ok: true,
        account: row.account,
        designation: row.name,
        category: row.category,
        jabereich: row.OPBereich,
        japos: row.OPArt,
        debit_credit: 'S',
        taxgroup: null,
        Sammelkto: row.Sammelkto,
        OPVortragKto: row.OPVortragKto,
        source: 'debtors'
      });
    }

    stmt = db.prepare(`
      SELECT account, name, category, OPBereich, OPArt, Sammelkto, OPVortragKto
      FROM creditors
      WHERE account = ?
    `);
    row = stmt.get(account) as any;

    if (row) {
      return json<AccountDetails>({
        ok: true,
        account: row.account,
        designation: row.name,
        category: row.category,
        jabereich: row.OPBereich,
        japos: row.OPArt,
        debit_credit: 'H',
        taxgroup: null,
        Sammelkto: row.Sammelkto,
        OPVortragKto: row.OPVortragKto,
        source: 'creditors'
      });
    }

    return json<ErrorResponse>({ ok: false, error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
  } catch (error) {
    return json<ErrorResponse>({ ok: false, error: 'ACCOUNT_DETAILS_FETCH_FAILED' }, { status: 500 });
  }
}
