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

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-8"
      aria-label="Stránkování"
    >
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
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
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              1
            </Link>
            {currentPage > 3 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {currentPage > 1 && (
          <Link
            href={buildUrl(currentPage - 1)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {currentPage - 1}
          </Link>
        )}

        <span className="px-3 py-2 text-sm bg-coffee text-white rounded-lg font-medium">
          {currentPage}
        </span>

        {hasNextPage && (
          <Link
            href={buildUrl(currentPage + 1)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {currentPage + 1}
          </Link>
        )}
      </div>

      {hasNextPage && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          aria-label="Další stránka"
        >
          Další →
        </Link>
      )}
    </nav>
  );
}
