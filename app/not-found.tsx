import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <p className="text-6xl font-black text-gray-200 dark:text-gray-800 mb-4">
        404
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Stránka nenalezena
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-coffee text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        ← Zpět na hlavní stránku
      </Link>
    </div>
  );
}
