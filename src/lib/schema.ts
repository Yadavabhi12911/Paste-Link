import { getDb } from "@/lib/db";

let schemaInitialized = false;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS pastes (
  id VARCHAR(20) PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  views_used INTEGER NOT NULL DEFAULT 0
)
`;

/**
 * Creates the pastes table if it does not exist.
 * Safe to call multiple times; runs at most once per process (cold start).
 * Call from any route that needs the DB before running queries.
 */
export async function initSchema(): Promise<void> {
  if (schemaInitialized) return;
  const sql = getDb();
  await sql(CREATE_TABLE_SQL);
  schemaInitialized = true;
}
