import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <p className="text-8xl font-black text-coffee mb-4 border-b-4 border-black dark:border-white pb-4 inline-block">
        404
      </p>
      <h2 className="text-2xl font-black text-black dark:text-white mb-2 uppercase">
        Stránka nenalezena
      </h2>
      <p className="text-black dark:text-white mb-6">
        Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-coffee text-white font-bold uppercase tracking-wide border-[3px] border-black hover:bg-black hover:text-coffee"
      >
        ← Zpět na hlavní stránku
      </Link>
    </div>
  );
}
