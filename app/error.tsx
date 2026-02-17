"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-4" aria-hidden="true">
        ⚠️
      </p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Něco se pokazilo
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Omlouváme se, ale nepodařilo se načíst obsah stránky. Zkuste to prosím
        znovu.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-4 py-2 bg-coffee text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
