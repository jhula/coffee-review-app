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
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Moje hodnocení
        </p>
        <StarRating
          rating={favourite?.userRating ?? 0}
          onChange={(r) => updateRating(slug, r)}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Moje poznámka
        </p>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 500))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-coffee"
              rows={3}
              placeholder="Přidat poznámku..."
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{noteText.length}/500</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="text-sm px-3 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm px-3 py-1 bg-coffee text-white rounded-lg hover:bg-opacity-90"
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
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                {favourite.userNote}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-gray-800 rounded-lg p-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
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
          className="text-xl transition-colors"
        >
          <span
            className={
              star <= (hover || rating)
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
