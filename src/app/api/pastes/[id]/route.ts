import { NextRequest, NextResponse } from "next/server";
import { getPasteReadOnly, getPasteAndIncrementView, toPasteForDisplay } from "@/lib/pastes";
import { getCurrentTimeMs } from "@/lib/time";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accept = request.headers.get("accept") ?? "";
  const isBrowser = accept.includes("text/html");

  const nowMs = getCurrentTimeMs(request.headers);

  if (isBrowser) {
    // User clicked the API link in browser — redirect to readable view (don't count as API view)
    const row = await getPasteReadOnly(id, nowMs);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const url = new URL(`/p/${id}`, request.url);
    url.searchParams.set("from", "api");
    return NextResponse.redirect(url, 302);
  }

  // API client: return JSON and count as one view
  const row = await getPasteAndIncrementView(id, nowMs);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(toPasteForDisplay(row), { status: 200 });
}
