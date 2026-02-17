export type Review = {
  slug: string;
  name: string;
  roaster: string;
  origin: string;
  score: number;
  tastingNotes: string;
  description: string;
  price: string;
  whereToBuy: string;
  reviewDate: string;
  imageUrl?: string;
  sourceUrl: string;
};

export type UserFavourite = {
  slug: string;
  addedAt: string;
  userRating?: number; // 1–5
  userNote?: string; // max 500 znaků
};
