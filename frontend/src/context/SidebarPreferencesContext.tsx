"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { FLAT_SIDEBAR_ITEMS } from "@/lib/navigation";
import {
  canPinSidebarItems,
  MAX_PINNED_SIDEBAR_ITEMS,
  readPinnedSidebarItems,
  sanitizePinnedSidebarItems,
  writePinnedSidebarItems,
} from "@/lib/sidebar-storage";
import type { Role } from "@/types/api";

type SidebarPreferencesContextValue = {
  canPin: boolean;
  pinnedIds: string[];
  togglePin: (itemId: string) => void;
  isPinned: (itemId: string) => boolean;
};

const SidebarPreferencesContext = createContext<SidebarPreferencesContextValue | null>(null);

export function SidebarPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;
  const canPin = canPinSidebarItems(role);
  const allowedIds = useMemo(
    () =>
      FLAT_SIDEBAR_ITEMS.filter((item) => item.roles.includes((role ?? "STAFF") as Role)).map(
        (item) => item.id,
      ),
    [role],
  );

  const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
    sanitizePinnedSidebarItems(readPinnedSidebarItems(), allowedIds),
  );

  useEffect(() => {
    setPinnedIds(sanitizePinnedSidebarItems(readPinnedSidebarItems(), allowedIds));
  }, [allowedIds]);

  const togglePin = useCallback(
    (itemId: string) => {
      if (!canPin || !allowedIds.includes(itemId)) return;

      const label = FLAT_SIDEBAR_ITEMS.find((item) => item.id === itemId)?.label ?? "Item";

      if (pinnedIds.includes(itemId)) {
        const next = pinnedIds.filter((id) => id !== itemId);
        writePinnedSidebarItems(next);
        setPinnedIds(next);
        toast.success(`Unpinned ${label}`);
        return;
      }

      if (pinnedIds.length >= MAX_PINNED_SIDEBAR_ITEMS) {
        toast.error(
          `Pinned list is full (max ${MAX_PINNED_SIDEBAR_ITEMS}). Unpin an item to add another.`,
        );
        return;
      }

      const next = [...pinnedIds, itemId];
      writePinnedSidebarItems(next);
      setPinnedIds(next);
      toast.success(`Pinned ${label}`);
    },
    [allowedIds, canPin, pinnedIds],
  );

  const isPinned = useCallback((itemId: string) => pinnedIds.includes(itemId), [pinnedIds]);

  const value = useMemo(
    () => ({ canPin, pinnedIds, togglePin, isPinned }),
    [canPin, pinnedIds, togglePin, isPinned],
  );

  return (
    <SidebarPreferencesContext.Provider value={value}>{children}</SidebarPreferencesContext.Provider>
  );
}

export function useSidebarPinnedItems() {
  const context = useContext(SidebarPreferencesContext);
  if (!context) {
    throw new Error("useSidebarPinnedItems must be used within SidebarPreferencesProvider");
  }
  return context;
}
