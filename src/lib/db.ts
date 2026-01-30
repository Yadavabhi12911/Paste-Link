import { neon } from "@neondatabase/serverless";

export type NeonSql = ReturnType<typeof neon>;

let sqlClient: NeonSql | null = null;

/**
 * Returns the Neon serverless SQL client. Uses DATABASE_URL.
 * Throws if DATABASE_URL is not set.
 */
export function getDb(): NeonSql {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL;
    if (!url || url === "") {
      throw new Error(
        "DATABASE_URL is not set. Set it in .env or your deployment environment."
      );
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

