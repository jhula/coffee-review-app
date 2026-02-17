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
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              className="flex items-center justify-between h-16"
              aria-label="Hlavní navigace"
            >
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-coffee hover:opacity-80 transition-opacity"
              >
                <span aria-hidden="true">☕</span>
                <span>Coffee Review</span>
              </Link>

              <div className="flex items-center gap-1 sm:gap-4">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-coffee dark:hover:text-coffee transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Recenze
                </Link>
                <Link
                  href="/oblibene"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-coffee dark:hover:text-coffee transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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

        <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Data pocházejí z{" "}
            <a
              href="https://www.coffeereview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coffee hover:underline"
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
