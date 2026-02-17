"use client";

import { useEffect, useState } from "react";
import { useFavouritesStore } from "@/store/favourites";

export default function NavFavouritesBadge() {
  const [mounted, setMounted] = useState(false);
  const favourites = useFavouritesStore((s) => s.favourites);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || favourites.length === 0) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-black text-white bg-black dark:bg-white dark:text-black border-2 border-coffee">
      {favourites.length > 99 ? "99+" : favourites.length}
    </span>
  );
}
