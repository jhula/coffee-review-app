"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserFavourite } from "@/lib/types";

interface FavouritesStore {
  favourites: UserFavourite[];
  /** Add a review to favourites (no-op if already present) */
  addFavourite: (slug: string) => void;
  /** Remove a review from favourites */
  removeFavourite: (slug: string) => void;
  /** Save or overwrite the user's personal note (capped at 500 chars) */
  updateNote: (slug: string, note: string) => void;
  /** Save or overwrite the user's star rating (clamped to 1–5) */
  updateRating: (slug: string, rating: number) => void;
  /** Returns true if the slug is in the favourites list */
  isFavourite: (slug: string) => boolean;
}

/**
 * Global favourites store backed by localStorage.
 *
 * The `persist` middleware serialises the store to `localStorage` under the
 * key "coffee-favourites" on every state change, so data survives page reloads.
 *
 * SSR note: components that read this store must guard against hydration
 * mismatches by rendering nothing (or a skeleton) until `mounted === true`:
 *
 *   const [mounted, setMounted] = useState(false);
 *   useEffect(() => setMounted(true), []);
 *   if (!mounted) return null;
 */
export const useFavouritesStore = create<FavouritesStore>()(
  persist(
    (set, get) => ({
      favourites: [],

      addFavourite: (slug: string) => {
        // Idempotent – ignore duplicates
        const existing = get().favourites.find((f) => f.slug === slug);
        if (existing) return;
        set((state) => ({
          favourites: [
            ...state.favourites,
            { slug, addedAt: new Date().toISOString() },
          ],
        }));
      },

      removeFavourite: (slug: string) => {
        set((state) => ({
          favourites: state.favourites.filter((f) => f.slug !== slug),
        }));
      },

      updateNote: (slug: string, note: string) => {
        set((state) => ({
          favourites: state.favourites.map((f) =>
            f.slug === slug
              ? { ...f, userNote: note.slice(0, 500) }
              : f
          ),
        }));
      },

      updateRating: (slug: string, rating: number) => {
        const clampedRating = Math.min(5, Math.max(1, rating));
        set((state) => ({
          favourites: state.favourites.map((f) =>
            f.slug === slug ? { ...f, userRating: clampedRating } : f
          ),
        }));
      },

      isFavourite: (slug: string) => {
        return get().favourites.some((f) => f.slug === slug);
      },
    }),
    {
      // localStorage key – change this to reset all users' stored data
      name: "coffee-favourites",
    }
  )
);
