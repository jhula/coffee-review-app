type ScoreIndicatorProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

export default function ScoreIndicator({
  score,
  size = "md",
}: ScoreIndicatorProps) {
  const color =
    score >= 90
      ? "text-green-600 border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-600"
      : score >= 80
      ? "text-yellow-600 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600"
      : "text-coffee border-coffee bg-orange-50 dark:bg-orange-950 dark:border-coffee";

  const sizeClass =
    size === "sm"
      ? "w-10 h-10 text-sm font-bold"
      : size === "lg"
      ? "w-20 h-20 text-3xl font-black"
      : "w-14 h-14 text-xl font-bold";

  return (
    <div
      className={`rounded-full border-2 flex items-center justify-center ${sizeClass} ${color}`}
      aria-label={`Skóre: ${score}`}
    >
      {score > 0 ? score : "—"}
    </div>
  );
}
