import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { initSchema } from "@/lib/schema";

export async function GET() {
  try {
    await initSchema();
    const sql = getDb();
    await sql("SELECT 1");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database unavailable" },
      { status: 503 }
    );
  }
}
