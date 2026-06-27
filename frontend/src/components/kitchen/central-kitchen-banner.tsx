"use client"

import { Button } from "antd"
import { ChefHat } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useBranches } from "@/hooks/domains/useGeneralQueries"
import type { Branch } from "@/types/api"

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
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <ChefHat className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Viewing as {activeBranch?.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {message}
          </p>
        </div>
      </div>
      <Button
        type="primary"
        className="bg-orange-500 hover:bg-orange-600 border-none font-bold shrink-0"
        onClick={() => setActiveBranchId(centralKitchen.id)}
      >
        Switch to {centralKitchen.name}
      </Button>
    </div>
  )
}
