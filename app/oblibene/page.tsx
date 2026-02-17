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
        <div className="animate-spin w-8 h-8 border-4 border-coffee border-t-transparent mx-auto" />
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4" aria-hidden="true">
          ♡
        </p>
        <h1 className="text-2xl font-black text-black dark:text-white mb-2 uppercase">
          Žádné oblíbené
        </h1>
        <p className="text-black dark:text-white mb-6">
          Zatím jste si nepřidali žádnou recenzi do oblíbených.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-coffee text-white font-bold uppercase tracking-wide border-[3px] border-black hover:bg-black hover:text-coffee"
        >
          Procházet recenze
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">
          Oblíbené recenze
        </h1>
        <p className="text-black dark:text-white font-bold">
          {favourites.length} {favourites.length === 1 ? "recenze" : favourites.length < 5 ? "recenze" : "recenzí"} uloženo
        </p>
      </div>

      {loading && (
        <div className="text-center py-4 text-black dark:text-white text-sm mb-4 font-bold uppercase">
          Načítání detailů...
        </div>
      )}

      <div className="space-y-4">
        {favourites.map((fav) => {
          const review = reviews[fav.slug];
          return (
            <article
              key={fav.slug}
              className="bg-white dark:bg-black border-[3px] border-black dark:border-white p-4 md:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <Link
                    href={`/recenze/${fav.slug}`}
                    className="text-lg font-black text-black dark:text-white hover:text-coffee uppercase"
                  >
                    {review?.name ?? fav.slug}
                  </Link>
                  {review?.roaster && (
                    <p className="text-coffee text-sm mt-0.5 font-bold uppercase tracking-wide">{review.roaster}</p>
                  )}
                  {review?.origin && (
                    <p className="text-black dark:text-white text-sm">
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
                <p className="text-sm text-black dark:text-white mb-3 border-l-4 border-coffee pl-3">
                  {review.tastingNotes}
                </p>
              )}

              <div className="border-t-2 border-black dark:border-white pt-3">
                <UserNote slug={fav.slug} />
              </div>

              <p className="text-xs text-black/50 dark:text-white/50 mt-3 font-bold uppercase">
                Přidáno: {new Date(fav.addedAt).toLocaleDateString("cs-CZ")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
