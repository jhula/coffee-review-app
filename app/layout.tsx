import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavFavouritesBadge from "@/components/NavFavouritesBadge";

export const metadata: Metadata = {
  title: {
    default: "Coffee Review – Recenze kávy",
    template: "%s | Coffee Review",
  },
  description:
    "Procházejte recenze výběrové kávy z coffeereview.com s českým rozhraním. Ukládejte oblíbené, přidávejte poznámky a hodnocení.",
  metadataBase: new URL("https://coffee-review-app.vercel.app"),
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "Coffee Review",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="bg-white dark:bg-black text-black dark:text-white min-h-screen font-mono">
        <header className="bg-white dark:bg-black border-b-4 border-black dark:border-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              className="flex items-center justify-between h-16"
              aria-label="Hlavní navigace"
            >
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-coffee hover:text-black dark:hover:text-white"
              >
                <span aria-hidden="true">☕</span>
                <span>Coffee Review</span>
              </Link>

              <div className="flex items-center gap-1 sm:gap-4">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-bold uppercase tracking-wide text-black dark:text-white border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Recenze
                </Link>
                <Link
                  href="/oblibene"
                  className="flex items-center px-3 py-2 text-sm font-bold uppercase tracking-wide text-black dark:text-white border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Oblíbené
                  <NavFavouritesBadge />
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="mt-16 border-t-4 border-black dark:border-white py-8 text-center text-sm text-black dark:text-white uppercase tracking-wide">
          <p>
            Data pocházejí z{" "}
            <a
              href="https://www.coffeereview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coffee font-bold hover:bg-coffee hover:text-white px-1"
            >
              coffeereview.com
            </a>
            . Tato aplikace slouží pouze k prohlížení veřejně dostupných recenzí.
          </p>
        </footer>
      </body>
    </html>
  );
}
