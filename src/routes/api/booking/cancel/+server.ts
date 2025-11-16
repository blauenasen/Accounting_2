import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

const RED_CROSS = '❌';

interface OriginalBooking {
  Jahr?: number;
  jahr?: number;
  Monat?: number;
  monat?: number;
  LfdNr?: number;
  lfdnr?: number;
  BookCircle?: number;
  bookCircle?: number;
  [key: string]: any;
}

interface CancelResponse {
  ok: true;
  guNumber: number;
  originalLfdNr: number;
  cancelLfdNr: number;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

type ApiResponse = CancelResponse | ErrorResponse;

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    const body = await request.json();
    const originalBooking = body.originalBooking as OriginalBooking;

    if (!originalBooking) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_ORIGINAL_BOOKING' }, { status: 400 });
    }

    const jahr = originalBooking.Jahr || originalBooking.jahr;
    const monat = originalBooking.Monat || originalBooking.monat;
    const lfdnr = originalBooking.LfdNr || originalBooking.lfdnr;
    const bookCircle = originalBooking.BookCircle || originalBooking.bookCircle;

    if (!jahr || !monat || !lfdnr) {
      return json<ErrorResponse>({ ok: false, error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    const result = db.transaction(() => {
      const maxGURow = db.prepare(`
        SELECT MAX(CAST(GU AS INTEGER)) as maxGU
        FROM journal
        WHERE GU IS NOT NULL
          AND GU != ''
          AND GU NOT LIKE '%[^0-9]%'
      `).get() as any;

      const nextGU = (maxGURow?.maxGU ? parseInt(maxGURow.maxGU, 10) + 1 : 1);

      const original = bookCircle
        ? db.prepare(`
            SELECT * FROM journal
            WHERE Jahr = ? AND Monat = ? AND LfdNr = ? AND BookCircle = ?
          `).get(jahr, monat, lfdnr, bookCircle) as any
        : db.prepare(`
            SELECT * FROM journal
            WHERE Jahr = ? AND Monat = ? AND LfdNr = ?
          `).get(jahr, monat, lfdnr) as any;

      if (!original) {
        throw new Error('ORIGINAL_BOOKING_NOT_FOUND');
      }

      const maxLfdNrRow = bookCircle
        ? db.prepare(`
            SELECT MAX(LfdNr) as maxLfdNr
            FROM journal
            WHERE Jahr = ? AND Monat = ? AND BookCircle = ?
          `).get(jahr, monat, bookCircle) as any
        : db.prepare(`
            SELECT MAX(LfdNr) as maxLfdNr
            FROM journal
            WHERE Jahr = ? AND Monat = ?
          `).get(jahr, monat) as any;

      const nextLfdNr = (maxLfdNrRow?.maxLfdNr || 0) + 1;

      const reversedSH = original.SH === 'S' ? 'H' : 'S';

      const cancelBooking = { ...original };

      cancelBooking.LfdNr = nextLfdNr;

      const mm = String(monat).padStart(2, '0');
      const lfd = String(nextLfdNr).padStart(4, '0');
      cancelBooking.BuNr = `${mm}-${jahr}/${lfd}`;

      cancelBooking.GU = String(nextGU);
      cancelBooking.Warnung = RED_CROSS;
      cancelBooking.Gesperrt = 1;
      cancelBooking.Buchungstext = original.Buchungstext ? `STORNO: ${original.Buchungstext}` : 'STORNO';

      cancelBooking.SH = reversedSH;

      cancelBooking.Brutto = -(original.Brutto || 0);

      if (reversedSH === 'H') {
        cancelBooking.SBrutto = null;
        cancelBooking.HBrutto = -(original.Brutto || 0);
        cancelBooking.SNetto = null;
        cancelBooking.HNetto = -(original.NettoGes || 0);
        cancelBooking.SVSTUSt = null;
        cancelBooking.HVSTUSt = -(original.VStUSt || 0);
      } else {
        cancelBooking.SBrutto = -(original.Brutto || 0);
        cancelBooking.HBrutto = null;
        cancelBooking.SNetto = -(original.NettoGes || 0);
        cancelBooking.HNetto = null;
        cancelBooking.SVSTUSt = -(original.VStUSt || 0);
        cancelBooking.HVSTUSt = null;
      }

      cancelBooking.NettoGes = -(original.NettoGes || 0);
      cancelBooking.VStUSt = -(original.VStUSt || 0);

      const insertStmt = db.prepare(`
        INSERT INTO journal (
          Gesperrt, Jahr, Monat, Tag, LfdNr, BuNr, Warnung, BL,
          AusziffNr, AusziffArt, UE, SH, GU, BU, GegKto, JAGegKtoBereich, JAGegKtoPosArt,
          BelNr, Datum, Kto, BookCircle, JAKtoBereich, JAKtoPosArt, Buchungstext, Fälligkeit,
          Brutto, SBrutto, HBrutto, NettoGes, SNetto, HNetto, Steuer, VStUSt, SVSTUSt, HVSTUSt,
          SteuerKto, JASteuer, JAPosSteuer, Sammelkto, OPVortragGegKto, SachVortragKto
        ) VALUES (
          @Gesperrt, @Jahr, @Monat, @Tag, @LfdNr, @BuNr, @Warnung, @BL,
          @AusziffNr, @AusziffArt, @UE, @SH, @GU, @BU, @GegKto, @JAGegKtoBereich, @JAGegKtoPosArt,
          @BelNr, @Datum, @Kto, @BookCircle, @JAKtoBereich, @JAKtoPosArt, @Buchungstext, @Fälligkeit,
          @Brutto, @SBrutto, @HBrutto, @NettoGes, @SNetto, @HNetto, @Steuer, @VStUSt, @SVSTUSt, @HVSTUSt,
          @SteuerKto, @JASteuer, @JAPosSteuer, @Sammelkto, @OPVortragGegKto, @SachVortragKto
        )
      `);

      insertStmt.run(cancelBooking);

      const updateStmt = bookCircle
        ? db.prepare(`
            UPDATE journal
            SET GU = ?, Warnung = ?, Gesperrt = 1
            WHERE Jahr = ? AND Monat = ? AND LfdNr = ? AND BookCircle = ?
          `)
        : db.prepare(`
            UPDATE journal
            SET GU = ?, Warnung = ?, Gesperrt = 1
            WHERE Jahr = ? AND Monat = ? AND LfdNr = ?
          `);

      if (bookCircle) {
        updateStmt.run(String(nextGU), RED_CROSS, jahr, monat, lfdnr, bookCircle);
      } else {
        updateStmt.run(String(nextGU), RED_CROSS, jahr, monat, lfdnr);
      }

      return {
        ok: true,
        guNumber: nextGU,
        originalLfdNr: lfdnr,
        cancelLfdNr: nextLfdNr
      };
    })();

    return json<CancelResponse>(result as CancelResponse);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'CANCEL_BOOKING_FAILED';
    return json<ErrorResponse>({ ok: false, error: errorMessage }, { status: 500 });
  }
}
