import Image from "next/image";
import Link from "next/link";
import { Review } from "@/lib/types";
import ScoreIndicator from "./ScoreIndicator";
import FavouriteButton from "./FavouriteButton";

type ReviewDetailProps = {
  review: Review;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-2 border-b border-gray-100 dark:border-gray-800">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100">{value}</dd>
    </div>
  );
}

export default function ReviewDetail({ review }: ReviewDetailProps) {
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-coffee hover:underline flex items-center gap-1"
        >
          ← Zpět na seznam recenzí
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {review.imageUrl && (
          <div className="relative h-64 md:h-80 bg-gray-100 dark:bg-gray-800">
            <Image
              src={review.imageUrl}
              alt={review.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {review.name}
              </h1>
              {review.roaster && (
                <p className="text-coffee font-semibold text-lg">{review.roaster}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {review.score > 0 && (
                <ScoreIndicator score={review.score} size="lg" />
              )}
              <FavouriteButton slug={review.slug} />
            </div>
          </div>

          {review.tastingNotes && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Chuťové poznámky
              </h2>
              <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed">
                {review.tastingNotes}
              </p>
            </section>
          )}

          {review.description && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Popis
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Detaily
            </h2>
            <dl>
              <DetailRow label="Původ" value={review.origin} />
              <DetailRow label="Cena" value={review.price} />
              <DetailRow label="Kde koupit" value={review.whereToBuy} />
              <DetailRow label="Datum recenze" value={review.reviewDate} />
            </dl>
          </section>

          {review.sourceUrl && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <a
                href={review.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-coffee hover:underline"
              >
                Zobrazit originál na coffeereview.com →
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
