import { scrapeReviewDetail } from "@/lib/scraper";
import { NextRequest } from "next/server";

export const revalidate = 3600; // 1 hodina ISR cache

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const review = await scrapeReviewDetail(params.slug);
    return Response.json(review);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepodařilo se načíst detail recenze.";
    return Response.json({ error: message }, { status: 500 });
  }
}
