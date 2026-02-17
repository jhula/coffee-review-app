/**
 * Data scraped from a single coffeereview.com review page.
 * Fields that are only available on the detail page (origin, price, …)
 * are populated as empty strings when fetched from the list endpoint.
 */
export type Review = {
  /** URL-friendly identifier, e.g. "ethiopia-sun-dried-natural" */
  slug: string;
  /** Full coffee name as shown on the review page */
  name: string;
  /** Name of the roasting company */
  roaster: string;
  /** Country / region of origin, e.g. "Sidama, Ethiopia" */
  origin: string;
  /** Numeric score out of 100 (0 if not available) */
  score: number;
  /** Short tasting descriptor paragraph */
  tastingNotes: string;
  /** Longer story / background paragraph */
  description: string;
  /** Retail price as printed on the review, e.g. "$18/12 oz" */
  price: string;
  /** Where-to-buy text or URL (often empty) */
  whereToBuy: string;
  /** Human-readable publish date, e.g. "February 2026" */
  reviewDate: string;
  /** Roaster logo or product photo URL (optional) */
  imageUrl?: string;
  /** Canonical URL on coffeereview.com */
  sourceUrl: string;
};

/**
 * User-created data stored in localStorage via the Zustand persist middleware.
 * Keyed by slug so it can be joined with Review data client-side.
 */
export type UserFavourite = {
  /** Matches Review.slug */
  slug: string;
  /** ISO 8601 timestamp of when the user saved this review */
  addedAt: string;
  /** User's personal score, 1–5 stars */
  userRating?: number;
  /** User's personal tasting note, max 500 characters */
  userNote?: string;
};
