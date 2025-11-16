import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';
import { randomUUID } from 'crypto';

interface ReconcileRequest {
  idNrs: number[];
  type?: 'manual' | 'auto';
}

interface ReconcileResponse {
  ok: true;
  reconciliationId: string;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = ReconcileResponse | ErrorResponse;

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const body: ReconcileRequest = await request.json();
    const { idNrs, type = 'manual' } = body;

    if (!Array.isArray(idNrs) || idNrs.length < 2) {
      return json<ErrorResponse>({ ok: false, error: 'MINIMUM_TWO_ENTRIES_REQUIRED' }, { status: 400 });
    }

    const result = db.transaction(() => {
      const placeholders = idNrs.map(() => '?').join(',');
      const entries = db.prepare(`
        SELECT IdNr, UE, SH, Steuer, NettoGes, Kto, GegKto
        FROM journal
        WHERE IdNr IN (${placeholders})
      `).all(...idNrs) as any[];

      if (entries.length !== idNrs.length) {
        throw new Error('SOME_ENTRIES_NOT_FOUND');
      }

      let totalSum = 0;
      for (const entry of entries) {
        const turnover = Number(entry.UE) || 0;
        const sh = String(entry.SH || '').toUpperCase();

        const amount = sh === 'S' ? turnover : -turnover;
        totalSum += amount;
      }

      if (Math.abs(totalSum) > 0.01) {
        throw new Error(`SUM_NOT_ZERO`);
      }

      const reconciliationId = randomUUID();

      const ausziffArt = type === 'auto' ? 'A' : 'M';
      const updateStmt = db.prepare(`
        UPDATE journal
        SET AusziffNr = ?, AusziffArt = ?
        WHERE IdNr = ?
      `);

      for (const idNr of idNrs) {
        updateStmt.run(reconciliationId, ausziffArt, idNr);
      }

      return { reconciliationId };
    })();

    return json<ReconcileResponse>({ ok: true, ...result });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'RECONCILIATION_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
