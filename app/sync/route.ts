import { NextResponse } from "next/server";
import { getUpstreamUrl } from "@/app/lib/upstreamSync";

export async function POST(req: Request) {
  const upstream = getUpstreamUrl("/sync");
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
    const incoming = await req.formData();
    const outgoing = new FormData();

    for (const [key, value] of incoming.entries()) {
      outgoing.append(key, value);
    }

    const response = await fetch(upstream, {
      method: "POST",
      body: outgoing,
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
      error instanceof Error ? error.message : "Failed to proxy sync request.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
