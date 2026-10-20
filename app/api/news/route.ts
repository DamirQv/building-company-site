import { NextResponse } from "next/server";
import { BitrixNewsError, getPublishedNews } from "@/lib/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const news = await getPublishedNews();

    return NextResponse.json({
      ok: true,
      items: news,
    });
  } catch (error) {
    if (error instanceof BitrixNewsError) {
      console.error("[news] Bitrix24 request failed", {
        method: error.method,
        code: error.code,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Bitrix24 news request failed",
          method: error.method,
          code: error.code,
          upstreamStatus: error.status,
        },
        { status: error.code === "webhook_not_configured" ? 503 : 502 },
      );
    }

    console.error("[news] Unexpected failure while loading Bitrix24 news");
    return NextResponse.json(
      { ok: false, error: "Bitrix24 news request failed" },
      { status: 502 },
    );
  }
}
