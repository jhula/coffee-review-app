import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReviewDetail from "@/components/ReviewDetail";
import UserNote from "@/components/UserNote";
import { Review } from "@/lib/types";

// Next.js 16+: params is a Promise
type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getReview(slug: string): Promise<Review | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/review/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data as Review;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReview(slug);

  if (!review) {
    return { title: "Recenze nenalezena" };
  }

  return {
    title: review.name,
    description: review.tastingNotes || review.description || `Recenze: ${review.name} od ${review.roaster}`,
    openGraph: {
      title: review.name,
      description: review.tastingNotes || review.description,
      images: review.imageUrl ? [{ url: review.imageUrl, alt: review.name }] : undefined,
    },
  };
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const review = await getReview(slug);

  if (!review) {
    notFound();
  }

  return (
    <div>
      <ReviewDetail review={review} />
      <div className="max-w-3xl mx-auto mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Moje poznámky
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Hodnocení a poznámky se ukládají pouze ve vašem prohlížeči.
          </p>
          <UserNote slug={review.slug} />
        </div>
      </div>
    </div>
  );
}
