import { Suspense } from "react";
import type { Metadata } from "next";
import ReviewCard from "@/components/ReviewCard";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import { Review } from "@/lib/types";

export const metadata: Metadata = {
  title: "Recenze kávy",
  description:
    "Procházejte recenze výběrové kávy z coffeereview.com s českým rozhraním.",
};

/** Number of review cards shown per page (client-side slice of the scraped batch). */
const ITEMS_PER_PAGE = 12;

/**
 * Fetches a page of reviews from the internal API route.
 * Uses an absolute URL because this runs inside a Server Component.
 * Falls back gracefully to an empty array on any network or parse error.
 */
async function getReviews(page: number): Promise<Review[]> {
  try {
    // Absolute URL required in Server Components; prefer explicit env var,
    // then Vercel's auto-set VERCEL_URL, then localhost for local dev.
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/reviews?page=${page}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Pure function that applies search, score filter, origin filter and sort
 * to the full review array received from the API.
 * All filtering is done client-side (server component, no JS sent to browser)
 * so the result is ready to slice into pages.
 */
function filterAndSort(
  reviews: Review[],
  {
    query,
    minScore,
    sortBy,
    origins,
  }: {
    query: string;
    minScore: number;
    sortBy: string;
    origins: string[];
  }
): Review[] {
  let filtered = reviews;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.roaster.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.tastingNotes.toLowerCase().includes(q)
    );
  }

  if (minScore > 0) {
    filtered = filtered.filter((r) => r.score >= minScore);
  }

  if (origins.length > 0) {
    filtered = filtered.filter((r) => origins.includes(r.origin));
  }

  switch (sortBy) {
    case "score-asc":
      filtered = [...filtered].sort((a, b) => a.score - b.score);
      break;
    case "name-asc":
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      break;
    default: // score-desc
      filtered = [...filtered].sort((a, b) => b.score - a.score);
  }

  return filtered;
}

type PageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    minScore?: string;
    sort?: string;
    origins?: string;
  }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Number(resolvedParams.page ?? "1"));
  const query = resolvedParams.q ?? "";
  const minScore = Number(resolvedParams.minScore ?? "0");
  const sortBy = resolvedParams.sort ?? "score-desc";
  const selectedOrigins = resolvedParams.origins
    ? resolvedParams.origins.split(",").filter(Boolean)
    : [];

  const allReviews = await getReviews(page);

  const filtered = filterAndSort(allReviews, {
    query,
    minScore,
    sortBy,
    origins: selectedOrigins,
  });

  const startIndex = 0;
  const pageReviews = filtered.slice(startIndex, ITEMS_PER_PAGE);
  const hasNextPage = filtered.length > ITEMS_PER_PAGE || allReviews.length >= ITEMS_PER_PAGE;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">
          Recenze kávy
        </h1>
        <p className="text-black dark:text-white border-b-2 border-coffee pb-2 inline-block">
          Nejlepší recenze výběrové kávy z celého světa
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-black border-[3px] border-black dark:border-white p-4 sticky top-24">
            <h2 className="font-black text-black dark:text-white mb-4 uppercase tracking-wide border-b-2 border-coffee pb-2">
              Filtry
            </h2>
            <Suspense>
              <FilterPanel
                reviews={allReviews}
                minScore={minScore}
                maxScore={100}
                sortBy={sortBy}
                selectedOrigins={selectedOrigins}
              />
            </Suspense>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <Suspense>
              <SearchBar defaultValue={query} />
            </Suspense>
          </div>

          {pageReviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4" aria-hidden="true">
                ☕
              </p>
              <h2 className="text-xl font-black text-black dark:text-white mb-2 uppercase">
                Žádné recenze nenalezeny
              </h2>
              <p className="text-black dark:text-white">
                Zkuste změnit filtry nebo vyhledávací dotaz.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-black dark:text-white mb-4 font-bold uppercase tracking-wide">
                Nalezeno {filtered.length} recenzí
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {pageReviews.map((review) => (
                  <ReviewCard key={review.slug} review={review} />
                ))}
              </div>

              <Suspense>
                <Pagination currentPage={page} hasNextPage={hasNextPage} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
