import { scrapeReviewList } from "@/lib/scraper";
import { NextRequest } from "next/server";

export const revalidate = 3600; // 1 hodina ISR cache

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");

  try {
    const reviews = await scrapeReviewList(page);
    return Response.json(reviews);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepodařilo se načíst recenze.";
    return Response.json({ error: message }, { status: 500 });
  }
}
