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
      ? "text-white bg-green-600 border-black dark:border-white"
      : score >= 80
      ? "text-black bg-yellow-400 border-black dark:border-white"
      : "text-white bg-coffee border-black dark:border-white";

  const sizeClass =
    size === "sm"
      ? "w-10 h-10 text-sm font-black"
      : size === "lg"
      ? "w-20 h-20 text-3xl font-black"
      : "w-14 h-14 text-xl font-black";

  return (
    <div
      className={`border-[3px] flex items-center justify-center ${sizeClass} ${color}`}
      aria-label={`Skóre: ${score}`}
    >
      {score > 0 ? score : "—"}
    </div>
  );
}
