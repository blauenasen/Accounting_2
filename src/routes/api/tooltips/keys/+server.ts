import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface SuccessResponseBody {
  ok: true;
  data: string[];
}

interface ErrorResponseBody {
  ok: false;
  error: string;
}

type ApiResponseBody = SuccessResponseBody | ErrorResponseBody;

function ensureSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tooltips (
      "key"        TEXT PRIMARY KEY,
      "en"         TEXT NOT NULL,
      "de"         TEXT NOT NULL,
      "category"   TEXT,
      "active"     INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
      "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tooltips_category ON tooltips(category);
  `);
}

export function GET({ }: RequestEvent): Response {
  try {
    ensureSchema();

    const rows = db.prepare('SELECT "key" FROM tooltips ORDER BY "key"').all() as { key: string }[];
    return json<SuccessResponseBody>({
      ok: true,
      data: rows.map(r => r.key)
    });
  } catch (error) {
    return json<ErrorResponseBody>(
      { ok: false, error: 'KEYS_FETCH_FAILED' },
      { status: 500 }
    );
  }
}
