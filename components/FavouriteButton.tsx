"use client";

import { useEffect, useState } from "react";
import { useFavouritesStore } from "@/store/favourites";

type FavouriteButtonProps = {
  slug: string;
  className?: string;
};

export default function FavouriteButton({
  slug,
  className = "",
}: FavouriteButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { isFavourite, addFavourite, removeFavourite } = useFavouritesStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-full text-gray-300 ${className}`}
        aria-label="Oblíbené"
        disabled
      >
        <HeartIcon filled={false} />
      </button>
    );
  }

  const favourite = isFavourite(slug);

  const toggle = () => {
    if (favourite) {
      removeFavourite(slug);
    } else {
      addFavourite(slug);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition-colors hover:bg-red-50 dark:hover:bg-red-950 ${
        favourite ? "text-red-500" : "text-gray-300 hover:text-red-400"
      } ${className}`}
      aria-label={favourite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      title={favourite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
    >
      <HeartIcon filled={favourite} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-5 h-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
