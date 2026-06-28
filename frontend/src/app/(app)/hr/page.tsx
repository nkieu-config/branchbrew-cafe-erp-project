"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebarNavBadges } from "@/hooks/useSidebarNavBadges";
import { resolveHubLandingPath } from "@/lib/operational-links";

export default function HRPage() {
  const router = useRouter();
  const { badges, childTabBadges } = useSidebarNavBadges();

  useEffect(() => {
    const target =
      resolveHubLandingPath("hr", { ...badges, ...childTabBadges }) || "/hr/employees";
    router.replace(target);
  }, [router, badges, childTabBadges]);

  return null;
}
