import * as cheerio from "cheerio";
import { Review } from "./types";

const BASE_URL = "https://www.coffeereview.com";
const USER_AGENT =
  "Mozilla/5.0 (compatible; CoffeeReviewBot/1.0; +https://coffeereview-app.vercel.app)";

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

function extractSlugFromUrl(url: string): string {
  const match = url.match(/\/review\/([^/]+)\/?$/);
  return match ? match[1] : "";
}

/**
 * Parsuje tabulku .review-template-table a vrací mapu label → value.
 * Příklady klíčů: "Coffee Origin:", "Est. Price:", "Review Date:", "Roaster Location:"
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

    // title & href
    const titleEl = element.find("h2.review-title a, h1.review-title a, .review-title a").first();
    const name = titleEl.text().trim();
    const href = titleEl.attr("href") ?? "";
    const slug = extractSlugFromUrl(href);

    if (!name || !slug) return;

    // score – actual class on coffeereview.com
    const scoreText = element.find(".review-template-rating").first().text().trim();
    const score = parseInt(scoreText, 10) || 0;

    // roaster – can be a link or plain text
    const roaster = element.find(".review-roaster").first().text().trim();

    reviews.push({
      slug,
      name,
      roaster,
      origin: "",       // not available on list page
      score,
      tastingNotes: "", // not available on list page
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

export async function scrapeReviewDetail(slug: string): Promise<Review> {
  const url = `${BASE_URL}/review/${slug}/`;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch {
    throw new Error(`Nepodařilo se načíst detail recenze: ${slug}`);
  }

  const $ = cheerio.load(html);

  // title
  const name = $("h1.review-title, h1.page-title").first().text().trim();
  if (!name) {
    throw new Error(`Recenze "${slug}" nebyla nalezena.`);
  }

  // score
  const scoreText = $(".review-template-rating").first().text().trim();
  const score = parseInt(scoreText, 10) || 0;

  // roaster
  const roaster = $(".review-roaster").first().text().trim();

  // Data table (Coffee Origin, Est. Price, Review Date, Roaster Location…)
  const container = $(".review-template, .single-review, body");
  const tableData = parseReviewTable($, container);

  const origin = tableData["Coffee Origin"] ?? "";
  const price = tableData["Est. Price"] ?? "";
  const reviewDate = tableData["Review Date"] ?? "";

  // Tasting notes, description and bottom-line live in <p> tags after the tables.
  // The site renders them in order: tasting descriptor → story → bottom line.
  const reviewDiv = $(".review-template");
  const paragraphs: string[] = [];
  reviewDiv.find("p").each((_, el) => {
    const text = $(el).text().trim();
    // Skip short/nav paragraphs and "Click here" links
    if (text.length > 40 && !text.startsWith("Click here")) {
      paragraphs.push(text);
    }
  });

  const tastingNotes = paragraphs[0] ?? "";
  const description = paragraphs[1] ?? "";

  // Image: roaster logo inside review-template
  const imageUrl =
    reviewDiv.find("img").filter((_, el) => {
      const src = $(el).attr("src") ?? "";
      // Exclude ad banners (300x190, 300x250) and navigation images
      return (
        src.includes("wp-content/uploads") &&
        !src.includes("300x190") &&
        !src.includes("300x250") &&
        !src.includes("banner") &&
        !src.includes("Banner") &&
        !src.includes("popup")
      );
    }).first().attr("src") ?? undefined;

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
