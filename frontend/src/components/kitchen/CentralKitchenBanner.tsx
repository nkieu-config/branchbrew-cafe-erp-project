"use client";

import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import type { Branch } from "@/types/api";
import { warningBannerClassName, warningBannerIconClassName, warningBannerPanelClassName, warningBannerTextClassName, warningBannerTitleClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { cn } from "@/lib/utils";

type CentralKitchenBranchNoticeProps = {
  mode?: "banner" | "blocking";
  message?: string;
  className?: string;
};

export function CentralKitchenBranchNotice({
  mode = "banner",
  message = "Production and BOM management is tied to the central kitchen branch.",
  className,
}: CentralKitchenBranchNoticeProps) {
  const { activeBranchId, setActiveBranchId } = useAuth();
  const { data: branchesData = [] } = useBranches();
  const branches = branchesData as Branch[];

  const activeBranch = branches.find((b) => b.id === activeBranchId);
  const centralKitchen = branches.find((b) => b.isCentralKitchen);

  if (!activeBranchId || activeBranch?.isCentralKitchen || !centralKitchen) {
    return null;
  }

  const switchButton = (
    <Button
      className={cn(hubCtaClassName("kitchen", "min-h-[44px]"), mode === "banner" && "shrink-0")}
      onClick={() => setActiveBranchId(centralKitchen.id)}
    >
      Switch to {centralKitchen.name}
    </Button>
  );

  if (mode === "blocking") {
    return (
      <div
        className={cn(warningBannerPanelClassName(), className)}
        role="status"
        aria-live="polite"
      >
        <ChefHat
          className={warningBannerIconClassName("w-10 h-10 mb-4")}
          aria-hidden
        />
        <p className={warningBannerTitleClassName()}>
          {activeBranch?.name ?? "This branch"} is not a central kitchen
        </p>
        <p className={warningBannerTextClassName("mt-2 max-w-sm")}>{message}</p>
        <div className="mt-6">{switchButton}</div>
      </div>
    );
  }

  return (
    <div className={cn(warningBannerClassName(), className)} role="status">
      <div className="flex items-start gap-3 min-w-0">
        <ChefHat className={warningBannerIconClassName("mt-0.5")} aria-hidden />
        <div className="min-w-0">
          <p className={warningBannerTitleClassName()}>Viewing as {activeBranch?.name ?? "branch"}</p>
          <p className={warningBannerTextClassName("mt-0.5")}>{message}</p>
        </div>
      </div>
      {switchButton}
    </div>
  );
}

export { CentralKitchenBranchNotice as CentralKitchenBanner };
