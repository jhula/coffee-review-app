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
    <div className="flex gap-2 py-2 border-b-2 border-black dark:border-white">
      <dt className="text-sm font-bold text-black dark:text-white w-32 flex-shrink-0 uppercase">
        {label}
      </dt>
      <dd className="text-sm text-black dark:text-white">{value}</dd>
    </div>
  );
}

export default function ReviewDetail({ review }: ReviewDetailProps) {
  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-coffee font-bold uppercase tracking-wide hover:underline decoration-2 flex items-center gap-1"
        >
          ← Zpět na seznam recenzí
        </Link>
      </div>

      <div className="bg-white dark:bg-black border-[3px] border-black dark:border-white overflow-hidden">
        {review.imageUrl && (
          <div className="relative h-64 md:h-80 bg-black dark:bg-white border-b-[3px] border-black dark:border-white">
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
              <h1 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-1 uppercase">
                {review.name}
              </h1>
              {review.roaster && (
                <p className="text-coffee font-bold text-lg uppercase tracking-wide">{review.roaster}</p>
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
              <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-widest mb-2 border-b-2 border-coffee pb-1">
                Chuťové poznámky
              </h2>
              <p className="text-black dark:text-white leading-relaxed border-l-4 border-coffee pl-4">
                {review.tastingNotes}
              </p>
            </section>
          )}

          {review.description && (
            <section className="mb-6">
              <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-widest mb-2 border-b-2 border-coffee pb-1">
                Popis
              </h2>
              <p className="text-black dark:text-white leading-relaxed">
                {review.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-sm font-black text-black dark:text-white uppercase tracking-widest mb-2 border-b-2 border-coffee pb-1">
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
            <div className="mt-6 pt-4 border-t-[3px] border-black dark:border-white">
              <a
                href={review.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-coffee font-bold uppercase tracking-wide hover:underline decoration-2"
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
