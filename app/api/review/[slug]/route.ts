import { scrapeReviewDetail } from "@/lib/scraper";
import { NextRequest } from "next/server";

/**
 * ISR cache duration in seconds (1 hour).
 */
export const revalidate = 3600;

/**
 * GET /api/review/[slug]
 *
 * Returns the full Review JSON for a single coffee identified by its slug.
 * All fields (origin, price, tasting notes, description) are populated here.
 *
 * Next.js 16+: `params` is a Promise and must be awaited.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const review = await scrapeReviewDetail(slug);
    return Response.json(review);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Nepodařilo se načíst detail recenze.";
    return Response.json({ error: message }, { status: 500 });
  }
}
