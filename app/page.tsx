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

const ITEMS_PER_PAGE = 12;

async function getReviews(page: number): Promise<Review[]> {
  try {
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
  searchParams: {
    page?: string;
    q?: string;
    minScore?: string;
    sort?: string;
    origins?: string;
  };
};

export default async function HomePage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const query = searchParams.q ?? "";
  const minScore = Number(searchParams.minScore ?? "0");
  const sortBy = searchParams.sort ?? "score-desc";
  const selectedOrigins = searchParams.origins
    ? searchParams.origins.split(",").filter(Boolean)
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Recenze kávy
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Nejlepší recenze výběrové kávy z celého světa
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 sticky top-24">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Žádné recenze nenalezeny
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Zkuste změnit filtry nebo vyhledávací dotaz.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
