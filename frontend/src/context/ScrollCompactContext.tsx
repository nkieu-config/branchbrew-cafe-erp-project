"use client";

import { createContext, use, type ReactNode } from "react";

const ScrollCompactContext = createContext(false);

export function ScrollCompactProvider({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <ScrollCompactContext.Provider value={compact}>{children}</ScrollCompactContext.Provider>
  );
}

export function useScrollCompact() {
  return use(ScrollCompactContext);
}
