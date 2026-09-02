"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `true` on the client after hydration, and `false` during SSR.
 * Uses `useSyncExternalStore` to avoid cascading re-renders from `useEffect`.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
