import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createPaste } from "@/lib/pastes";
import { getBaseUrl } from "@/lib/url";

const createPasteSchema = z.object({
  content: z.string().min(1, "content is required and must be non-empty"),
  ttl_seconds: z
    .coerce.number()
    .int()
    .min(1, "ttl_seconds must be an integer >= 1")
    .optional(),
  max_views: z
    .coerce.number()
    .int()
    .min(1, "max_views must be an integer >= 1")
    .optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid input", details: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = createPasteSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => e.message).join("; ");
    return NextResponse.json(
      { error: "Invalid input", details },
      { status: 400 }
    );
  }

  const { content, ttl_seconds, max_views } = parsed.data;
  const now = new Date();
  const expires_at = ttl_seconds
    ? new Date(now.getTime() + ttl_seconds * 1000)
    : null;

  const id = nanoid(10);

  try {
    await createPaste({
      id,
      content,
      expires_at,
      max_views: max_views ?? null,
    });
  } catch (err) {
    console.error("POST /api/pastes createPaste error:", err);
    const isDbError =
      err instanceof Error &&
      (err.message.includes("DATABASE_URL") ||
        err.message.includes("Database") ||
        err.message.includes("connection"));
    return NextResponse.json(
      {
        error: isDbError
          ? "Database unavailable. Set DATABASE_URL in .env and ensure Neon DB is reachable."
          : "Failed to create paste",
      },
      { status: isDbError ? 503 : 500 }
    );
  }

  const baseUrl = getBaseUrl();
  const url = baseUrl ? `${baseUrl}/p/${id}` : `/p/${id}`;

  return NextResponse.json({ id, url }, { status: 201 });
}
