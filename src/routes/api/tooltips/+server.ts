import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/index.js';

interface Tooltip {
  key: string;
  en: string;
  de: string;
  category: string | null;
  active: number;
  updated_at: string;
}

interface ErrorDetails {
  code: string;
  message: string;
  details?: {
    required?: string[];
    received?: Record<string, unknown>;
    [key: string]: any;
  };
}

interface ErrorResponseBody {
  ok: false;
  error: ErrorDetails | string;
}

interface GetResponseBody {
  ok: true;
  data: Tooltip;
}

interface PostResponseBody {
  ok: true;
  data: Tooltip;
}

type ApiResponse = GetResponseBody | PostResponseBody | ErrorResponseBody;

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

export function GET({ url }: RequestEvent): Response {
  try {
    ensureSchema();

    const key = url.searchParams.get('key');
    if (!key) {
      return json<ErrorResponseBody>(
        {
          ok: false,
          error: {
            code: 'KEY_REQUIRED',
            message: 'Required query parameter "key" is missing',
            details: {
              required: ['key'],
              received: Object.fromEntries(url.searchParams.entries()),
              example: '/api/tooltips?key=booking.save'
            }
          }
        },
        { status: 400 }
      );
    }

    const row = db.prepare('SELECT * FROM tooltips WHERE "key"=?').get(key) as Tooltip | undefined;
    if (!row) {
      return json<GetResponseBody>({
        ok: true,
        data: { key, en: '', de: '', category: null, active: 1, updated_at: '' }
      });
    }

    return json<GetResponseBody>({ ok: true, data: row });
  } catch (error) {
    return json<ErrorResponseBody>(
      { ok: false, error: 'TOOLTIP_FETCH_FAILED' },
      { status: 500 }
    );
  }
}

export async function POST({ request }: RequestEvent): Promise<Response> {
  try {
    ensureSchema();

    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const key = String(body.key || '').trim();
    const en = String(body.en || '').slice(0, 256);
    const de = String(body.de || '').slice(0, 256);
    const category = body.category === null || body.category === '' ? null : String(body.category);
    const active = Number(body.active) === 0 ? 0 : 1;

    if (!key) {
      return json<ErrorResponseBody>(
        {
          ok: false,
          error: {
            code: 'KEY_REQUIRED',
            message: 'Required field "key" is missing or empty',
            details: {
              required: ['key', 'en', 'de'],
              received: { key, en, de, category, active },
              example: { key: 'booking.save', en: 'Save', de: 'Speichern' }
            }
          }
        },
        { status: 400 }
      );
    }

    if (!en || !de) {
      return json<ErrorResponseBody>(
        {
          ok: false,
          error: {
            code: 'EN_DE_REQUIRED',
            message: 'Required fields "en" and "de" are missing or empty',
            details: {
              required: ['key', 'en', 'de'],
              received: { key, en, de, category, active },
              missing: [!en && 'en', !de && 'de'].filter(Boolean)
            }
          }
        },
        { status: 400 }
      );
    }

    db.prepare(`
      INSERT INTO tooltips ("key","en","de","category","active")
      VALUES (?,?,?,?,?)
      ON CONFLICT("key") DO UPDATE SET
        "en"=excluded."en",
        "de"=excluded."de",
        "category"=excluded."category",
        "active"=excluded."active",
        "updated_at"=CURRENT_TIMESTAMP
    `).run(key, en, de, category, active);

    const saved = db.prepare('SELECT * FROM tooltips WHERE "key"=?').get(key) as Tooltip;
    return json<PostResponseBody>({ ok: true, data: saved }, { status: 200 });
  } catch (error) {
    return json<ErrorResponseBody>(
      { ok: false, error: 'TOOLTIP_SAVE_FAILED' },
      { status: 500 }
    );
  }
}
