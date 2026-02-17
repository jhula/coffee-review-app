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
    <article className="bg-white dark:bg-black border-[3px] border-black dark:border-white overflow-hidden flex flex-col hover:bg-coffee group">
      {review.imageUrl && (
        <div className="relative h-48 bg-black dark:bg-white border-b-[3px] border-black dark:border-white">
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
            className="flex-1 hover:underline decoration-[3px] underline-offset-4"
          >
            <h2 className="font-black text-black dark:text-white leading-snug uppercase group-hover:text-white">
              {review.name}
            </h2>
          </Link>
          <FavouriteButton slug={review.slug} className="flex-shrink-0 -mt-1" />
        </div>

        {review.roaster && (
          <p className="text-sm text-coffee font-bold mb-1 uppercase tracking-wide group-hover:text-white">{review.roaster}</p>
        )}

        {review.origin && (
          <p className="text-sm text-black dark:text-white mb-3 group-hover:text-white">
            {review.origin}
          </p>
        )}

        {review.tastingNotes && (
          <p className="text-sm text-black dark:text-white line-clamp-2 mb-3 flex-1 group-hover:text-white">
            {review.tastingNotes}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t-[3px] border-black dark:border-white">
          {review.score > 0 ? (
            <ScoreIndicator score={review.score} size="sm" />
          ) : (
            <span className="text-sm text-black dark:text-white font-bold">Bez hodnocení</span>
          )}

          <Link
            href={`/recenze/${review.slug}`}
            className="text-sm text-coffee font-bold uppercase tracking-wide hover:underline decoration-2 group-hover:text-white"
          >
            Číst recenzi →
          </Link>
        </div>
      </div>
    </article>
  );
}
