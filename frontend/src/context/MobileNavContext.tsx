"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";

type MobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  toggle: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ open, setOpen, close, toggle }),
    [open, close, toggle],
  );

  return (
    <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const context = use(MobileNavContext);
  if (!context) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return context;
}
