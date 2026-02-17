import Link from "next/link";
import Image from "next/image";
import { Review } from "@/lib/types";
import ScoreIndicator from "./ScoreIndicator";
import FavouriteButton from "./FavouriteButton";

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {review.imageUrl && (
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
          <Image
            src={review.imageUrl}
            alt={review.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/recenze/${review.slug}`}
            className="flex-1 hover:text-coffee transition-colors"
          >
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              {review.name}
            </h2>
          </Link>
          <FavouriteButton slug={review.slug} className="flex-shrink-0 -mt-1" />
        </div>

        {review.roaster && (
          <p className="text-sm text-coffee font-medium mb-1">{review.roaster}</p>
        )}

        {review.origin && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {review.origin}
          </p>
        )}

        {review.tastingNotes && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 flex-1">
            {review.tastingNotes}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          {review.score > 0 ? (
            <ScoreIndicator score={review.score} size="sm" />
          ) : (
            <span className="text-sm text-gray-400">Bez hodnocení</span>
          )}

          <Link
            href={`/recenze/${review.slug}`}
            className="text-sm text-coffee hover:underline font-medium"
          >
            Číst recenzi →
          </Link>
        </div>
      </div>
    </article>
  );
}
