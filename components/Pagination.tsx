"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  hasNextPage: boolean;
};

export default function Pagination({
  currentPage,
  hasNextPage,
}: PaginationProps) {
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return `/?${qs}`;
  };

  const linkClass =
    "px-3 py-2 text-sm border-[3px] border-black dark:border-white text-black dark:text-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black";

  const navLinkClass =
    "px-4 py-2 text-sm font-black border-[3px] border-black dark:border-white text-black dark:text-white uppercase tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black";

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="Stránkování"
    >
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className={navLinkClass}
          aria-label="Předchozí stránka"
        >
          ← Předchozí
        </Link>
      )}

      <div className="flex items-center gap-1">
        {currentPage > 2 && (
          <>
            <Link
              href={buildUrl(1)}
              className={linkClass}
            >
              1
            </Link>
            {currentPage > 3 && (
              <span className="px-2 text-black dark:text-white font-bold">...</span>
            )}
          </>
        )}

        {currentPage > 1 && (
          <Link
            href={buildUrl(currentPage - 1)}
            className={linkClass}
          >
            {currentPage - 1}
          </Link>
        )}

        <span className="px-3 py-2 text-sm bg-coffee text-white font-black border-[3px] border-black">
          {currentPage}
        </span>

        {hasNextPage && (
          <Link
            href={buildUrl(currentPage + 1)}
            className={linkClass}
          >
            {currentPage + 1}
          </Link>
        )}
      </div>

      {hasNextPage && (
        <Link
          href={buildUrl(currentPage + 1)}
          className={navLinkClass}
          aria-label="Další stránka"
        >
          Další →
        </Link>
      )}
    </nav>
  );
}
