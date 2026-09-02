# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

**Runtime & package manager: [Bun](https://bun.sh)** — always use `bun` instead of `node`/`npm`/`npx`.

```bash
bun install          # install dependencies
bunx <package>       # run a package binary (replaces npx)
```

Before assuming any CLI tool (e.g. `gh`, `vercel`) is missing, verify with:

```bash
which <tool>
# or
<tool> --version
```

## Commands

```bash
bun run dev      # Development server with hot reload
bun run build    # Production build (run this to verify no type/lint errors)
bun run start    # Start production server
bun run lint     # ESLint via Next.js config
```

No test suite is configured.

## Project structure

```
coffee-review-app/
├── app/
│   ├── layout.tsx                    # Root layout: sticky nav, footer, metadata
│   ├── page.tsx                      # Home – server component, fetches + filters reviews
│   ├── error.tsx                     # Global error boundary (Czech message)
│   ├── not-found.tsx                 # 404 page (Czech)
│   ├── recenze/[slug]/page.tsx       # Review detail – generateMetadata + UserNote
│   ├── oblibene/page.tsx             # Favourites – client component, reads localStorage
│   └── api/
│       ├── reviews/route.ts          # GET /api/reviews?page=N
│       └── review/[slug]/route.ts    # GET /api/review/:slug
├── lib/
│   ├── types.ts                      # Review, UserFavourite types
│   ├── scraper.ts                    # scrapeReviewList + scrapeReviewDetail (Cheerio)
│   └── useIsMounted.ts               # Hydration-safe useSyncExternalStore hook
├── store/
│   └── favourites.ts                 # Zustand store + localStorage persist middleware
├── components/
│   ├── ReviewCard.tsx                # Grid card (name, roaster, score, heart)
│   ├── ReviewDetail.tsx              # Full review layout
│   ├── FavouriteButton.tsx           # Heart toggle (hydration-safe)
│   ├── UserNote.tsx                  # Inline star rating + textarea note editor
│   ├── SearchBar.tsx                 # Full-text search → URL ?q=
│   ├── FilterPanel.tsx               # Score slider, origin multiselect, sort select
│   ├── Pagination.tsx                # Page links using URL ?page=
│   ├── ScoreIndicator.tsx            # Coloured score circle
│   └── NavFavouritesBadge.tsx        # Count badge in nav (hydration-safe)
├── app/globals.css                   # Tailwind 4 @theme: coffee: #C45B2E, dark mode via "class"
├── next.config.mjs                   # remotePatterns for coffeereview.com images
├── eslint.config.mjs                 # ESLint flat config (eslint-config-next/core-web-vitals)
└── CLAUDE.md
```

## Architecture

Next.js 16 App Router app that scrapes coffee reviews from coffeereview.com, caches them via ISR, and lets users save favourites in localStorage.

### Data flow

```
coffeereview.com HTML
  → lib/scraper.ts (Cheerio parsing)
  → app/api/reviews/route.ts | app/api/review/[slug]/route.ts  (ISR revalidate: 3600)
  → Server Components (app/page.tsx, app/recenze/[slug]/page.tsx)
  → Client Components (filters, search, favourites)
```

The scraper is the only place that talks to coffeereview.com. All page data goes through the internal API routes so ISR caching applies uniformly.

### Scraper (`lib/scraper.ts`)

Uses multiple fallback CSS selectors because coffeereview.com's markup can vary. Primary selectors are class-based (`.review-template`, `.roaster-name`, etc.); if they yield nothing, broader element selectors are tried. Slugs are extracted via regex `/\/review\/([^/]+)\/?$/` from href attributes. All errors throw with Czech messages.

**Before modifying selectors:** always fetch a sample page and inspect the live HTML structure first — do not guess selectors from memory or previous versions of the site:

```bash
curl -s -A "Mozilla/5.0" "https://www.coffeereview.com/review/" | grep -E 'class="[^"]*review'
```

### Favourites store (`store/favourites.ts`)

Zustand store with `persist` middleware — localStorage key `"coffee-favourites"`. All components that read this store check hydration state with `useIsMounted()` before rendering to prevent SSR hydration mismatches:

```tsx
const mounted = useIsMounted();
if (!mounted) return <Skeleton />;
```

Store actions: `addFavourite`, `removeFavourite`, `updateNote` (max 500 chars), `updateRating` (1–5, clamped), `isFavourite`.

### URL state (filters, search, pagination)

Home page (`/`) reads all filter/search/sort state from `searchParams`:

| Param | Values | Default |
|-------|--------|---------|
| `page` | number | 1 |
| `q` | string | "" |
| `minScore` | 0–100 | 0 |
| `sort` | `score-desc` \| `score-asc` \| `name-asc` \| `name-desc` | `score-desc` |
| `origins` | comma-separated strings | "" |

Client components (`FilterPanel`, `SearchBar`, `Pagination`) write to params via `useRouter().push()` with `URLSearchParams`. Page resets to 1 on any filter/search change.

### `NEXT_PUBLIC_BASE_URL` env var

Server components that call internal API routes need an absolute URL. The fallback chain is:
1. `process.env.NEXT_PUBLIC_BASE_URL`
2. `https://${process.env.VERCEL_URL}` (auto-set on Vercel)
3. `http://localhost:3000`

Set `NEXT_PUBLIC_BASE_URL` in `.env.local` for local development if the default port differs.

### Styling

Tailwind with class-based dark mode. Brand accent color is `coffee` (`#C45B2E`) — use `text-coffee`, `bg-coffee`, `border-coffee`, `ring-coffee`, `accent-coffee`. Score indicator colours: green ≥ 90, yellow ≥ 80, orange/coffee < 80.

### Deployment

```bash
vercel
```

No extra configuration needed. Next.js auto-detects the Vercel environment and `VERCEL_URL` is set automatically.
