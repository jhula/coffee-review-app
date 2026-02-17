# Coffee Review App

Webová aplikace pro prohlížení recenzí výběrové kávy z [coffeereview.com](https://www.coffeereview.com) s českým uživatelským rozhraním.

## Funkce

- **Seznam recenzí** – stránkovaný přehled s fulltextovým vyhledáváním, filtrováním podle skóre a původu a řazením
- **Detail recenze** – název, pražírna, původ, skóre, chuťové poznámky, popis, cena a datum
- **Oblíbené** – ukládání recenzí do oblíbených, hvězdičkové hodnocení a osobní poznámka (max. 500 znaků), vše přežije reload stránky
- **Barevný indikátor skóre** – zelená ≥ 90, žlutá ≥ 80, oranžová < 80
- **Tmavý režim** – automatická podpora přes Tailwind `dark:` třídy
- **SEO** – `generateMetadata()` na každé stránce, sémantické HTML

## Technický stack

| Vrstva | Technologie |
|--------|-------------|
| Framework | [Next.js 16](https://nextjs.org) – App Router, Server Components, ISR |
| Jazyk | TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Scraping | [Cheerio](https://cheerio.js.org) |
| Stav | [Zustand](https://zustand-demo.pmnd.rs) + `persist` middleware (localStorage) |
| Runtime | [Bun](https://bun.sh) |
| Deploy | [Vercel](https://vercel.com) |

## Lokální spuštění

**Požadavky:** [Bun](https://bun.sh) ≥ 1.0

```bash
git clone https://github.com/jhula/coffee-review-app
cd coffee-review-app
bun install
bun run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

### Volitelná env proměnná

Pokud provozuješ aplikaci na jiném portu než 3000, nastav:

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:4000
```

Na Vercelu není potřeba – `VERCEL_URL` je nastavena automaticky.

## Dostupné příkazy

```bash
bun run dev     # vývojový server s hot reload
bun run build   # produkční build (ověří typy i lint)
bun run start   # spustí produkční build
bun run lint    # ESLint
```

## Architektura

```
coffeereview.com
  └─ lib/scraper.ts          ← Cheerio scraping (server only)
       └─ app/api/reviews    ← GET /api/reviews?page=N  (ISR 1 h)
       └─ app/api/review/[slug] ← GET /api/review/:slug (ISR 1 h)
            └─ app/page.tsx         ← Server Component, filtruje + řadí
            └─ app/recenze/[slug]   ← Server Component, detail + SEO meta
            └─ app/oblibene         ← Client Component, čte localStorage
```

Data z coffeereview.com se scrapují server-side, cachují přes ISR (1 hodina) a servírují jako JSON z interních API routes. Klientský JavaScript řeší pouze oblíbené (Zustand → localStorage) a interaktivní filtry (URL query params).

## Deploy na Vercel

```bash
vercel
```

Žádná extra konfigurace není potřeba. Next.js detekuje Vercel automaticky a `VERCEL_URL` je nastavena prostředím.

## Poznámky ke scrapingu

- Scraper respektuje strukturu HTML stránek z února 2026
- Pokud coffeereview.com změní markup, stačí upravit selektory v `lib/scraper.ts`
- Přidán `User-Agent` header pro slušnou identifikaci bota
- ISR cache výrazně snižuje počet live requestů na zdroj
