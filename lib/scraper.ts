/**
 * Server-side scraper for coffeereview.com.
 *
 * Both functions are called exclusively from Next.js API routes
 * (app/api/reviews and app/api/review/[slug]) so they never run in the browser.
 *
 * HTML structure notes (verified February 2026):
 *   - Each review card on the list page is a <div class="review-template">
 *   - Score lives in <span class="review-template-rating">
 *   - Roaster lives in <p class="review-roaster">
 *   - Detail fields (origin, price, date) are in <table class="review-template-table">
 *   - Tasting notes and story are plain <p> tags that follow the tables
 */

import * as cheerio from "cheerio";
import { Review } from "./types";

const BASE_URL = "https://www.coffeereview.com";

/** Sent with every HTTP request to identify the bot politely. */
const USER_AGENT =
  "Mozilla/5.0 (compatible; CoffeeReviewBot/1.0; +https://coffeereview-app.vercel.app)";

/**
 * Fetches a URL and returns its HTML.
 * The `next: { revalidate }` option tells Next.js to cache the response for 1 h.
 * Throws a Czech-language Error on non-2xx status.
 */
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `Nepodařilo se načíst stránku: ${url} (status: ${response.status})`
    );
  }

  return response.text();
}

/**
 * Extracts the review slug from a coffeereview.com URL.
 * e.g. "https://www.coffeereview.com/review/ethiopia-natural/" → "ethiopia-natural"
 */
function extractSlugFromUrl(url: string): string {
  const match = url.match(/\/review\/([^/]+)\/?$/);
  return match ? match[1] : "";
}

/**
 * Parses all `<table class="review-template-table">` rows in the given container
 * and returns a label → value map (labels have their trailing colon stripped).
 *
 * Example output:
 *   { "Coffee Origin": "Sidama, Ethiopia", "Est. Price": "$18/12 oz", ... }
 */
function parseReviewTable(
  $: cheerio.CheerioAPI,
  container: ReturnType<cheerio.CheerioAPI>
): Record<string, string> {
  const map: Record<string, string> = {};
  container.find("table.review-template-table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const label = $(cells[0]).text().trim().replace(/:$/, "").trim();
      const value = $(cells[1]).text().trim();
      if (label) map[label] = value;
    }
  });
  return map;
}

/**
 * Scrapes the paginated review listing from coffeereview.com.
 *
 * Returns lightweight Review objects – detail-only fields (origin, price, etc.)
 * are empty strings and must be fetched separately via `scrapeReviewDetail`.
 *
 * @param page - 1-based page number
 */
export async function scrapeReviewList(page: number): Promise<Review[]> {
  const url =
    page === 1
      ? `${BASE_URL}/review/`
      : `${BASE_URL}/review/page/${page}/`;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch {
    throw new Error(`Nepodařilo se načíst seznam recenzí (stránka ${page}).`);
  }

  const $ = cheerio.load(html);
  const reviews: Review[] = [];

  $(".review-template").each((_, el) => {
    const element = $(el);

    // Each card has an anchor inside .review-title with the canonical URL
    const titleEl = element
      .find("h2.review-title a, h1.review-title a, .review-title a")
      .first();
    const name = titleEl.text().trim();
    const href = titleEl.attr("href") ?? "";
    const slug = extractSlugFromUrl(href);

    // Skip incomplete entries (e.g. sidebar widgets that also use .review-template)
    if (!name || !slug) return;

    const scoreText = element.find(".review-template-rating").first().text().trim();
    const score = parseInt(scoreText, 10) || 0;

    // .review-roaster may contain a sponsor link – text() gives us the plain name
    const roaster = element.find(".review-roaster").first().text().trim();

    reviews.push({
      slug,
      name,
      roaster,
      origin: "",       // only on detail page
      score,
      tastingNotes: "", // only on detail page
      description: "",
      price: "",
      whereToBuy: "",
      reviewDate: "",
      imageUrl: undefined,
      sourceUrl: href || `${BASE_URL}/review/${slug}/`,
    });
  });

  return reviews;
}

/**
 * Scrapes the full detail for a single review identified by its slug.
 *
 * Page structure (coffeereview.com, February 2026):
 *   1. `.review-template-rating`  → numeric score
 *   2. `.review-roaster`          → roaster name
 *   3. `table.review-template-table` (×2) → detail fields (origin, price, date)
 *   4. Plain `<p>` tags after the tables:
 *        [0] tasting descriptor  (short sensory notes)
 *        [1] background story    (processing, farm, etc.)
 *        [2] bottom-line summary
 *
 * @param slug - URL slug, e.g. "ethiopia-sun-dried-natural"
 * @throws Error with Czech message if the review cannot be fetched or parsed
 */
export async function scrapeReviewDetail(slug: string): Promise<Review> {
  const url = `${BASE_URL}/review/${slug}/`;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch {
    throw new Error(`Nepodařilo se načíst detail recenze: ${slug}`);
  }

  const $ = cheerio.load(html);

  const name = $("h1.review-title, h1.page-title").first().text().trim();
  if (!name) {
    throw new Error(`Recenze "${slug}" nebyla nalezena.`);
  }

  const scoreText = $(".review-template-rating").first().text().trim();
  const score = parseInt(scoreText, 10) || 0;

  const roaster = $(".review-roaster").first().text().trim();

  // Parse both data tables – they appear in fixed order on the page
  const container = $(".review-template, .single-review, body");
  const tableData = parseReviewTable($, container);

  const origin = tableData["Coffee Origin"] ?? "";
  const price = tableData["Est. Price"] ?? "";
  const reviewDate = tableData["Review Date"] ?? "";

  // Collect meaningful <p> paragraphs (skip nav text and "Click here" links)
  const reviewDiv = $(".review-template");
  const paragraphs: string[] = [];
  reviewDiv.find("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40 && !text.startsWith("Click here")) {
      paragraphs.push(text);
    }
  });

  const tastingNotes = paragraphs[0] ?? "";
  const description = paragraphs[1] ?? "";

  // Pick the roaster logo / product photo; skip ad banners by size suffix
  const imageUrl =
    reviewDiv
      .find("img")
      .filter((_, el) => {
        const src = $(el).attr("src") ?? "";
        return (
          src.includes("wp-content/uploads") &&
          !src.includes("300x190") &&
          !src.includes("300x250") &&
          !src.includes("banner") &&
          !src.includes("Banner") &&
          !src.includes("popup")
        );
      })
      .first()
      .attr("src") ?? undefined;

  return {
    slug,
    name,
    roaster,
    origin,
    score,
    tastingNotes,
    description,
    price,
    whereToBuy: "",
    reviewDate,
    imageUrl,
    sourceUrl: url,
  };
}
