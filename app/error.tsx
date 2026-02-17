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
      <h2 className="text-2xl font-black text-black dark:text-white mb-2 uppercase">
        Něco se pokazilo
      </h2>
      <p className="text-black dark:text-white mb-6 max-w-md mx-auto">
        Omlouváme se, ale nepodařilo se načíst obsah stránky. Zkuste to prosím
        znovu.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-4 py-2 bg-coffee text-white font-bold uppercase tracking-wide border-[3px] border-black hover:bg-black hover:text-coffee"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
