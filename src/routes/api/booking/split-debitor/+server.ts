import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';

interface Position {
  account: string;
  costCenter: string | null;
  amount: number;
  tax: number;
  description: string;
}

interface SplitRequest {
  originalIdNr: number;
  splitType: 'debitor';
  splitTotal: number;
  mode: 'brutto' | 'netto';
  positions: Position[];
}

interface SplitResponse {
  ok: true;
  data: {
    splitGroupId: string;
    positions: Array<{
      idNr: number;
      account: string;
      amount: number;
    }>;
  };
}

interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

type ApiResponse = SplitResponse | ErrorResponse;

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const data: SplitRequest = await request.json();
    const { originalIdNr, splitType, splitTotal, mode, positions } = data;

    if (!originalIdNr || !splitTotal || !positions || positions.length === 0) {
      return json<ErrorResponse>({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'MISSING_REQUIRED_FIELDS'
        }
      }, { status: 400 });
    }

    const original = db.prepare(`
      SELECT * FROM journal WHERE IdNr = ?
    `).get(originalIdNr) as any;

    if (!original) {
      return json<ErrorResponse>({
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'ORIGINAL_BOOKING_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const splitGroupId = uuidv4();

    const sum = positions.reduce((acc, p) => {
      return new Decimal(acc).plus(new Decimal(p.amount)).toNumber();
    }, 0);

    const difference = new Decimal(splitTotal).minus(new Decimal(sum)).abs().toNumber();
    if (difference > 0.01) {
      return json<ErrorResponse>({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'SUM_MISMATCH',
          details: { sum, total: splitTotal, difference }
        }
      }, { status: 400 });
    }

    const insertStmt = db.prepare(`
      INSERT INTO journal (
        Jahr, Monat, Tag, Datum, BuSchl, Belegdat, Belegfeld1, Konto, GegKto,
        BU, UE, SH, Steuer, NettoGes, split_type, split_group_id, split_total
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const transaction = db.transaction((positions: Position[]) => {
      const results = [];

      for (const pos of positions) {
        let ue: number, nettoGes: number, steuer: number;

        if (mode === 'brutto') {
          ue = new Decimal(pos.amount).toDecimalPlaces(2).toNumber();
          const taxFactor = new Decimal(1).plus(new Decimal(pos.tax));
          nettoGes = new Decimal(ue).dividedBy(taxFactor).toDecimalPlaces(2).toNumber();
          steuer = new Decimal(ue).minus(new Decimal(nettoGes)).toDecimalPlaces(2).toNumber();
        } else {
          nettoGes = new Decimal(pos.amount).toDecimalPlaces(2).toNumber();
          steuer = new Decimal(nettoGes).times(new Decimal(pos.tax)).toDecimalPlaces(2).toNumber();
          ue = new Decimal(nettoGes).plus(new Decimal(steuer)).toDecimalPlaces(2).toNumber();
        }

        const result = insertStmt.run(
          original.Jahr,
          original.Monat,
          original.Tag,
          original.Datum,
          original.BuSchl,
          original.Belegdat,
          pos.description || original.Belegfeld1,
          original.Konto,
          pos.account,
          pos.costCenter || '',
          ue,
          original.SH,
          steuer,
          nettoGes,
          splitType,
          splitGroupId,
          splitTotal
        );

        results.push({
          idNr: Number(result.lastInsertRowid),
          account: pos.account,
          amount: ue
        });
      }

      return results;
    });

    const results = transaction(positions);

    return json<SplitResponse>({
      ok: true,
      data: {
        splitGroupId,
        positions: results
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'INTERNAL_ERROR';
    return json<ErrorResponse>({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    }, { status: 500 });
  }
}
