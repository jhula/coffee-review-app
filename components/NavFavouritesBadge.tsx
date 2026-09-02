"use client";

import { useFavouritesStore } from "@/store/favourites";
import { useIsMounted } from "@/lib/useIsMounted";

export default function NavFavouritesBadge() {
  const mounted = useIsMounted();
  const favourites = useFavouritesStore((s) => s.favourites);

  if (!mounted || favourites.length === 0) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-black text-white bg-black dark:bg-white dark:text-black border-2 border-coffee">
      {favourites.length > 99 ? "99+" : favourites.length}
    </span>
  );
}
