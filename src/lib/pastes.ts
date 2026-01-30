import { getDb } from "@/lib/db";
import { initSchema } from "@/lib/schema";

export interface PasteRow {
  id: string;
  content: string;
  created_at: Date;
  expires_at: Date | null;
  max_views: number | null;
  views_used: number; 
}

export interface PasteForDisplay {
  content: string;
  remaining_views: number | null;
  expires_at: string | null; // ISO string
}

/**
 * Ensures schema exists, then returns the SQL client. Use before any paste query.
 */
async function ensureSchemaAndGetDb() {
  await initSchema();
  return getDb();
}

/**
 * Read-only fetch: get paste by id. Does NOT increment views_used.
 * Returns null if paste does not exist or is unavailable (expired or view limit exceeded).
 * Use for GET /p/:id (HTML view) and for existence checks.
 */
export async function getPasteReadOnly(
  id: string,
  nowMs: number
): Promise<PasteRow | null> {
  const sql = await ensureSchemaAndGetDb();
  const nowIso = new Date(nowMs).toISOString();
  const rows = await sql<PasteRow>(
    `SELECT id, content, created_at, expires_at, max_views, views_used
     FROM pastes
     WHERE id = $1
       AND (expires_at IS NULL OR expires_at > $2::timestamptz)
       AND (max_views IS NULL OR views_used < max_views)`,
    [id, nowIso]
  );
  const row = rows?.[0] ?? null;
  return row;
}

/**
 * Atomic get-and-increment: fetch paste by id and increment views_used in one step.
 * Returns null if paste does not exist, is expired, or view limit already reached.
 * Use only for GET /api/pastes/:id (each successful call counts as one view).
 */
export async function getPasteAndIncrementView(
  id: string,
  nowMs: number
): Promise<PasteRow | null> {
  const sql = await ensureSchemaAndGetDb();
  const nowIso = new Date(nowMs).toISOString();
  const rows = await sql<PasteRow>(
    `UPDATE pastes
     SET views_used = views_used + 1
     WHERE id = $1
       AND (max_views IS NULL OR views_used < max_views)
       AND (expires_at IS NULL OR expires_at > $2::timestamptz)
     RETURNING id, content, created_at, expires_at, max_views, views_used`,
    [id, nowIso]
  );
  const row = rows?.[0] ?? null;
  return row;
}

/**
 * Insert a new paste. Call initSchema before if not already done (getPaste* do it; for create we do it here).
 */
export async function createPaste(params: {
  id: string;
  content: string;
  expires_at: Date | null;
  max_views: number | null;
}): Promise<void> {
  const sql = await ensureSchemaAndGetDb();
  await sql(
    `INSERT INTO pastes (id, content, expires_at, max_views, views_used)
     VALUES ($1, $2, $3, $4, 0)`,
    [
      params.id,
      params.content,
      params.expires_at?.toISOString() ?? null,
      params.max_views,
    ]
  );
}

/**
 * Build API response shape from a PasteRow (after increment).
 */
export function toPasteForDisplay(row: PasteRow): PasteForDisplay {
  return {
    content: row.content,
    remaining_views:
      row.max_views === null ? null : Math.max(0, row.max_views - row.views_used),
    expires_at: row.expires_at ? row.expires_at.toISOString() : null,
  };
}
