import * as cheerio from "cheerio";
import { Review } from "./types";

const BASE_URL = "https://www.coffeereview.com";
const USER_AGENT =
  "Mozilla/5.0 (compatible; CoffeeReviewBot/1.0; +https://coffeereview-app.vercel.app)";

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
  return match ? match[1] : url.split("/").filter(Boolean).pop() ?? "";
}

export async function scrapeReviewList(page: number): Promise<Review[]> {
  const url =
    page === 1
      ? `${BASE_URL}/review/`
      : `${BASE_URL}/review/page/${page}/`;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error) {
    throw new Error(`Nepodařilo se načíst seznam recenzí (stránka ${page}).`);
  }

  const $ = cheerio.load(html);
  const reviews: Review[] = [];

  // coffeereview.com structure: review items in .review-template or article.review
  const reviewItems = $(".review-template, article.review, .entry-summary");

  reviewItems.each((_, el) => {
    const element = $(el);

    const titleEl = element.find(".review-title a, h2 a, h3 a, .entry-title a").first();
    const name = titleEl.text().trim();
    const href = titleEl.attr("href") ?? "";
    const slug = extractSlugFromUrl(href);

    if (!name || !slug) return;

    const roaster = element
      .find(".roaster-name, .review-roaster, .roaster")
      .first()
      .text()
      .trim();

    const origin = element
      .find(".origin, .review-origin, .coffee-origin")
      .first()
      .text()
      .trim();

    const scoreText = element
      .find(".rating-result, .score, .review-score, .overall-rating")
      .first()
      .text()
      .trim();
    const score = parseInt(scoreText, 10) || 0;

    const tastingNotes = element
      .find(".tasting-notes, .review-notes, .bottom-line")
      .first()
      .text()
      .trim();

    const imageUrl =
      element.find("img").first().attr("src") ??
      element.find("img").first().attr("data-src");

    reviews.push({
      slug,
      name,
      roaster: roaster || "",
      origin: origin || "",
      score,
      tastingNotes: tastingNotes || "",
      description: "",
      price: "",
      whereToBuy: "",
      reviewDate: "",
      imageUrl: imageUrl || undefined,
      sourceUrl: href || `${BASE_URL}/review/${slug}/`,
    });
  });

  if (reviews.length === 0) {
    // Fallback: try broader selectors
    $("article, .post").each((_, el) => {
      const element = $(el);
      const titleEl = element.find("h2 a, h1 a, .entry-title a").first();
      const name = titleEl.text().trim();
      const href = titleEl.attr("href") ?? "";
      const slug = extractSlugFromUrl(href);

      if (!name || !slug || !href.includes("/review/")) return;

      const scoreText = element
        .find('[class*="score"], [class*="rating"], [class*="Score"]')
        .first()
        .text()
        .trim();
      const score = parseInt(scoreText, 10) || 0;

      const imageUrl = element.find("img").first().attr("src");

      reviews.push({
        slug,
        name,
        roaster: "",
        origin: "",
        score,
        tastingNotes: "",
        description: "",
        price: "",
        whereToBuy: "",
        reviewDate: "",
        imageUrl: imageUrl || undefined,
        sourceUrl: href,
      });
    });
  }

  return reviews;
}

export async function scrapeReviewDetail(slug: string): Promise<Review> {
  const url = `${BASE_URL}/review/${slug}/`;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error) {
    throw new Error(`Nepodařilo se načíst detail recenze: ${slug}`);
  }

  const $ = cheerio.load(html);

  // Extract name
  const name =
    $(".review-title, h1.entry-title, h1.page-title, h1").first().text().trim() ||
    $("title").text().split("|")[0].trim();

  // Extract score
  const scoreText = $(
    ".rating-result, .score, .review-score, .overall-rating, [class*='rating']"
  )
    .first()
    .text()
    .trim();
  const score = parseInt(scoreText, 10) || 0;

  // Extract roaster
  const roaster = $(
    ".roaster-name, .review-roaster, .roaster, [class*='roaster']"
  )
    .first()
    .text()
    .trim();

  // Extract origin - look in review details table or dedicated field
  let origin = $(".origin, .review-origin, .coffee-origin").first().text().trim();
  if (!origin) {
    // Try to find in a definition list or table
    $("dt, th").each((_, el) => {
      const label = $(el).text().trim().toLowerCase();
      if (label.includes("origin") || label.includes("country")) {
        origin = $(el).next("dd, td").text().trim();
      }
    });
  }

  // Extract tasting notes
  const tastingNotes = $(
    ".tasting-notes, .review-notes, .bottom-line, [class*='tasting']"
  )
    .first()
    .text()
    .trim();

  // Extract description/review body
  const description = $(
    ".review-body, .entry-content p, .review-content, [class*='description']"
  )
    .first()
    .text()
    .trim();

  // Extract price
  let price = $(".price, .review-price, [class*='price']").first().text().trim();
  if (!price) {
    $("dt, th").each((_, el) => {
      const label = $(el).text().trim().toLowerCase();
      if (label.includes("price") || label.includes("cena")) {
        price = $(el).next("dd, td").text().trim();
      }
    });
  }

  // Extract where to buy
  let whereToBuy = $(
    ".where-to-buy, .buy-link, [class*='buy'], [class*='purchase']"
  )
    .first()
    .text()
    .trim();
  if (!whereToBuy) {
    $("dt, th").each((_, el) => {
      const label = $(el).text().trim().toLowerCase();
      if (label.includes("buy") || label.includes("where")) {
        whereToBuy = $(el).next("dd, td").text().trim();
      }
    });
  }

  // Extract review date
  let reviewDate = $(
    ".review-date, time, .entry-date, [class*='date']"
  )
    .first()
    .attr("datetime") ??
    $(".review-date, time, .entry-date, [class*='date']").first().text().trim();

  // Extract image
  const imageUrl =
    $(".review-image img, .entry-thumbnail img, .post-thumbnail img, article img")
      .first()
      .attr("src") ?? undefined;

  if (!name) {
    throw new Error(`Recenze "${slug}" nebyla nalezena.`);
  }

  return {
    slug,
    name,
    roaster: roaster || "",
    origin: origin || "",
    score,
    tastingNotes: tastingNotes || "",
    description: description || "",
    price: price || "",
    whereToBuy: whereToBuy || "",
    reviewDate: reviewDate || "",
    imageUrl,
    sourceUrl: url,
  };
}
