"use client"

import { Button } from "antd"
import { ChefHat } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useBranches } from "@/hooks/domains/useGeneralQueries"
import type { Branch } from "@/types/api"
import {
  hubCtaClassName,
  warningBannerClassName,
  warningBannerIconClassName,
  warningBannerTextClassName,
  warningBannerTitleClassName,
} from "@/lib/theme"

type CentralKitchenBannerProps = {
  message?: string
}

export function CentralKitchenBanner({
  message = "Production and BOM management is tied to the central kitchen branch.",
}: CentralKitchenBannerProps) {
  const { activeBranchId, setActiveBranchId } = useAuth()
  const { data: branchesData = [] } = useBranches()
  const branches = branchesData as Branch[]

  const activeBranch = branches.find((b) => b.id === activeBranchId)
  const centralKitchen = branches.find((b) => b.isCentralKitchen)

  if (!activeBranchId || activeBranch?.isCentralKitchen || !centralKitchen) {
    return null
  }

  return (
    <div className={warningBannerClassName()}>
      <div className="flex items-start gap-3">
        <ChefHat className={warningBannerIconClassName("kitchen", "mt-0.5")} />
        <div>
          <p className={warningBannerTitleClassName()}>
            Viewing as {activeBranch?.name}
          </p>
          <p className={warningBannerTextClassName("mt-0.5")}>
            {message}
          </p>
        </div>
      </div>
      <Button
        type="primary"
        className={hubCtaClassName("kitchen", "border-none font-bold shrink-0")}
        onClick={() => setActiveBranchId(centralKitchen.id)}
      >
        Switch to {centralKitchen.name}
      </Button>
    </div>
  )
}
