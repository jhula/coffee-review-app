"use client";

import { useState } from "react";
import { useFavouritesStore } from "@/store/favourites";

type UserNoteProps = {
  slug: string;
};

export default function UserNote({ slug }: UserNoteProps) {
  const { favourites, updateNote, updateRating } = useFavouritesStore();
  const favourite = favourites.find((f) => f.slug === slug);

  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(favourite?.userNote ?? "");

  const handleSave = () => {
    updateNote(slug, noteText);
    setEditing(false);
  };

  const handleCancel = () => {
    setNoteText(favourite?.userNote ?? "");
    setEditing(false);
  };

  return (
    <div className="mt-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-black dark:text-white mb-1 uppercase tracking-wide">
          Moje hodnocení
        </p>
        <StarRating
          rating={favourite?.userRating ?? 0}
          onChange={(r) => updateRating(slug, r)}
        />
      </div>

      <div>
        <p className="text-sm font-bold text-black dark:text-white mb-1 uppercase tracking-wide">
          Moje poznámka
        </p>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
              className="w-full p-2 border-2 border-black dark:border-white text-sm bg-white dark:bg-black text-black dark:text-white resize-none focus:outline-none focus:border-coffee font-mono"
              rows={3}
              placeholder="Přidat poznámku..."
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/50 dark:text-white/50 font-bold">{noteText.length}/500</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="text-sm px-3 py-1 text-black dark:text-white border-2 border-black dark:border-white font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm px-3 py-1 bg-coffee text-white font-bold uppercase border-2 border-black hover:bg-black hover:text-coffee"
                >
                  Uložit
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditing(true)}
            className="cursor-pointer group"
          >
            {favourite?.userNote ? (
              <p className="text-sm text-black dark:text-white bg-white dark:bg-black border-2 border-black dark:border-white p-2 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                {favourite.userNote}
              </p>
            ) : (
              <p className="text-sm text-black/50 dark:text-white/50 bg-white dark:bg-black border-2 border-dashed border-black dark:border-white p-2 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                Klikněte pro přidání poznámky...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" role="group" aria-label="Hodnocení hvězdičkami">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} hvězdiček`}
          className="text-xl"
        >
          <span
            className={
              star <= (hover || rating)
                ? "text-coffee"
                : "text-black/20 dark:text-white/20"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
