import { NextResponse } from "next/server";
import { getUpstreamUrl } from "@/app/lib/upstreamSync";

export async function GET() {
  const upstream = getUpstreamUrl("/health");
  if (!upstream) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing or invalid SYNC_SERVER_BASE_URL (or SYNC_SERVER_URL).",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(upstream, {
      method: "GET",
      cache: "no-store",
    });
    const bodyText = await response.text();

    return new NextResponse(bodyText, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach sync backend.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
