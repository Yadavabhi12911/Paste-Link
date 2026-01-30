/**
 * Database row shape for pastes table.
 */
export interface PasteRow {
  id: string;
  content: string;
  created_at: Date;
  expires_at: Date | null;
  max_views: number | null;
  views_used: number;
}

/**
 * API response shape for GET /api/pastes/:id
 */
export interface PasteForDisplay {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

/**
 * Input for creating a paste (repository layer).
 */
export interface CreatePasteParams {
  id: string;
  content: string;
  expires_at: Date | null;
  max_views: number | null;
}
