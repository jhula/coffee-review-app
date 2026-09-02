import { scrapeReviewList } from "@/lib/scraper";
import { NextRequest } from "next/server";

/**
 * ISR cache duration in seconds (1 hour).
 * Next.js will serve stale HTML until this expires, then re-scrape in the background.
 */
export const revalidate = 3600;

/**
 * GET /api/reviews?page=<n>
 *
 * Returns a JSON array of Review objects for the requested page.
 * Only lightweight fields are populated (slug, name, roaster, score) –
 * detail fields (origin, price, notes) require a separate call to /api/review/[slug].
 */
export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");

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
