"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserFavourite } from "@/lib/types";

interface FavouritesStore {
  favourites: UserFavourite[];
  addFavourite: (slug: string) => void;
  removeFavourite: (slug: string) => void;
  updateNote: (slug: string, note: string) => void;
  updateRating: (slug: string, rating: number) => void;
  isFavourite: (slug: string) => boolean;
}

export const useFavouritesStore = create<FavouritesStore>()(
  persist(
    (set, get) => ({
      favourites: [],

      addFavourite: (slug: string) => {
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
      name: "coffee-favourites",
    }
  )
);
