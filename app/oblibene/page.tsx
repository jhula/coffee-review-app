"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFavouritesStore } from "@/store/favourites";
import UserNote from "@/components/UserNote";
import ScoreIndicator from "@/components/ScoreIndicator";
import FavouriteButton from "@/components/FavouriteButton";
import { Review } from "@/lib/types";

export default function OblíbenéPage() {
  const [mounted, setMounted] = useState(false);
  const { favourites } = useFavouritesStore();
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || favourites.length === 0) {
      setLoading(false);
      return;
    }

    const slugs = favourites.map((f) => f.slug);
    const missing = slugs.filter((s) => !reviews[s]);

    if (missing.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.allSettled(
      missing.map((slug) =>
        fetch(`/api/review/${slug}`)
          .then((r) => r.json())
          .then((data) => ({ slug, data }))
      )
    ).then((results) => {
      const newReviews: Record<string, Review> = { ...reviews };
      results.forEach((result) => {
        if (result.status === "fulfilled" && !result.value.data.error) {
          newReviews[result.value.slug] = result.value.data;
        }
      });
      setReviews(newReviews);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, favourites.length]); // intentionally only re-run when count changes to avoid fetch loop

  if (!mounted) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-coffee border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4" aria-hidden="true">
          ♡
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Žádné oblíbené
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Zatím jste si nepřidali žádnou recenzi do oblíbených.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-coffee text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Procházet recenze
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Oblíbené recenze
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {favourites.length} {favourites.length === 1 ? "recenze" : favourites.length < 5 ? "recenze" : "recenzí"} uloženo
        </p>
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm mb-4">
          Načítání detailů...
        </div>
      )}

      <div className="space-y-4">
        {favourites.map((fav) => {
          const review = reviews[fav.slug];
          return (
            <article
              key={fav.slug}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 md:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <Link
                    href={`/recenze/${fav.slug}`}
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-coffee transition-colors"
                  >
                    {review?.name ?? fav.slug}
                  </Link>
                  {review?.roaster && (
                    <p className="text-coffee text-sm mt-0.5">{review.roaster}</p>
                  )}
                  {review?.origin && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {review.origin}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {review?.score && review.score > 0 ? (
                    <ScoreIndicator score={review.score} size="sm" />
                  ) : null}
                  <FavouriteButton slug={fav.slug} />
                </div>
              </div>

              {review?.tastingNotes && (
                <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-3">
                  {review.tastingNotes}
                </p>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <UserNote slug={fav.slug} />
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Přidáno: {new Date(fav.addedAt).toLocaleDateString("cs-CZ")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
