"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import type { Branch } from "@/types/api";
import {
  warningBannerClassName,
  warningBannerPanelClassName,
  warningBannerTextClassName,
  warningBannerTitleClassName,
} from "@/lib/theme/hub-banners";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { cn } from "@/lib/utils";

type CentralKitchenBranchNoticeProps = {
  mode?: "banner" | "blocking";
  message?: string;
  className?: string;
};

export function CentralKitchenBranchNotice({
  mode = "banner",
  message = "Production and BOMs use the central kitchen branch.",
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
        className={cn(warningBannerPanelClassName("py-12"), className)}
        role="status"
        aria-live="polite"
      >
        <p className={warningBannerTitleClassName()}>
          {activeBranch?.name ?? "This branch"} is not the central kitchen
        </p>
        <p className={warningBannerTextClassName("mt-2 max-w-sm")}>{message}</p>
        <div className="mt-5">{switchButton}</div>
      </div>
    );
  }

  return (
    <div className={cn(warningBannerClassName("py-3"), className)} role="status">
      <p className={warningBannerTextClassName("min-w-0 flex-1")}>
        Viewing {activeBranch?.name ?? "branch"} — {message}
      </p>
      {switchButton}
    </div>
  );
}

export { CentralKitchenBranchNotice as CentralKitchenBanner };
