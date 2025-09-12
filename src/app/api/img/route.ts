import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get("u");
    if (!u) return new NextResponse("Missing url", { status: 400 });

    const upstream = await fetch(u, { cache: "no-store" });
    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: 502 });
    }
    const buf = Buffer.from(await upstream.arrayBuffer());

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
        // penting agar html-to-image tidak menandai tainted
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new NextResponse("Proxy error", { status: 500 });
  }
}
