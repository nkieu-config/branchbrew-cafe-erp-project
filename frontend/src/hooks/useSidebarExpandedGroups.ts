"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  mergeExpandedGroupsForActivePath,
  resolveInitialExpandedGroups,
  writeStoredExpandedGroups,
} from "@/lib/sidebar-storage";
import type { Role } from "@/types/api";

export function useSidebarExpandedGroups(role?: Role) {
  const pathname = usePathname();
  const [prevRole, setPrevRole] = useState(role);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    resolveInitialExpandedGroups(role),
  );

  if (role !== prevRole) {
    setPrevRole(role);
    setExpandedGroups(resolveInitialExpandedGroups(role));
  }

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = mergeExpandedGroupsForActivePath(prev, pathname);
      if (next !== prev) {
        writeStoredExpandedGroups(next);
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [groupName]: !prev[groupName] };
      writeStoredExpandedGroups(next);
      return next;
    });
  }, []);

  return { expandedGroups, toggleGroup };
}
