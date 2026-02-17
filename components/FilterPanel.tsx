"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Review } from "@/lib/types";

type FilterPanelProps = {
  reviews: Review[];
  minScore: number;
  maxScore: number;
  sortBy: string;
  selectedOrigins: string[];
};

export default function FilterPanel({
  reviews,
  minScore,
  maxScore,
  sortBy,
  selectedOrigins,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const origins = Array.from(
    new Set(reviews.map((r) => r.origin).filter(Boolean))
  ).sort();

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const handleOriginToggle = (origin: string) => {
    const updated = selectedOrigins.includes(origin)
      ? selectedOrigins.filter((o) => o !== origin)
      : [...selectedOrigins, origin];
    updateParam({
      origins: updated.length > 0 ? updated.join(",") : null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-black dark:text-white mb-2 uppercase tracking-wide">
          Minimální skóre: <span className="font-black text-coffee">{minScore}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) => updateParam({ minScore: e.target.value })}
          className="w-full accent-coffee"
          aria-label="Minimální skóre"
        />
        <div className="flex justify-between text-xs text-black dark:text-white mt-1 font-bold">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div>
        <label
          htmlFor="sort-select"
          className="block text-sm font-bold text-black dark:text-white mb-2 uppercase tracking-wide"
        >
          Řadit podle
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => updateParam({ sort: e.target.value })}
          className="w-full px-3 py-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-sm font-mono focus:outline-none focus:border-coffee"
        >
          <option value="score-desc">Skóre (nejvyšší)</option>
          <option value="score-asc">Skóre (nejnižší)</option>
          <option value="name-asc">Název (A–Z)</option>
          <option value="name-desc">Název (Z–A)</option>
        </select>
      </div>

      {origins.length > 0 && (
        <div>
          <p className="text-sm font-bold text-black dark:text-white mb-2 uppercase tracking-wide">
            Původ
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {origins.map((origin) => (
              <label
                key={origin}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedOrigins.includes(origin)}
                  onChange={() => handleOriginToggle(origin)}
                  className="border-2 border-black dark:border-white text-coffee focus:ring-0 accent-coffee"
                />
                <span className="text-sm text-black dark:text-white font-bold group-hover:text-coffee">
                  {origin}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {(minScore > 0 || selectedOrigins.length > 0 || sortBy !== "score-desc") && (
        <button
          onClick={() =>
            updateParam({ minScore: null, origins: null, sort: null })
          }
          className="text-sm text-white bg-black dark:text-black dark:bg-white font-bold uppercase tracking-wide px-3 py-1 border-2 border-black dark:border-white hover:bg-coffee hover:text-white hover:border-coffee"
        >
          Zrušit filtry
        </button>
      )}
    </div>
  );
}
