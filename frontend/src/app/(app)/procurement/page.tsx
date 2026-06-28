"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebarNavBadges } from "@/hooks/useSidebarNavBadges";
import { resolveHubLandingPath } from "@/lib/operational-links";

export default function ProcurementPage() {
  const router = useRouter();
  const { badges, childTabBadges } = useSidebarNavBadges();

  useEffect(() => {
    const target =
      resolveHubLandingPath("procurement", { ...badges, ...childTabBadges }) ||
      "/procurement/suppliers";
    router.replace(target);
  }, [router, badges, childTabBadges]);

  return null;
}
