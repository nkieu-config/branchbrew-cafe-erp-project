"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

/** Matches Tailwind `lg` breakpoint (1024px). Defaults to false during SSR. */
export function useIsLgUp() {
  const query = "(min-width: 1024px)";
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => getSnapshot(query),
    () => false,
  );
}
