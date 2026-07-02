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

/** Defaults to `serverSnapshot` during SSR. */
export function useMediaQuery(query: string, serverSnapshot = false) {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => getSnapshot(query),
    () => serverSnapshot,
  );
}

/** Matches Tailwind `sm` breakpoint and below (639px). */
export function useIsSmDown() {
  return useMediaQuery("(max-width: 639px)");
}

/** Matches Tailwind `lg` breakpoint (1024px). Defaults to false during SSR. */
export function useIsLgUp() {
  return useMediaQuery("(min-width: 1024px)");
}
