"use client"

import { AnimatedPage } from "@/components/animated-page"
import { PageHeader } from "@/components/shared/page-header"
import { useAuth } from "@/context/AuthContext"
import { useExpectedCash } from '@/hooks/domains/useFinanceQueries';
import { SettlementForm } from "@/components/pos/SettlementForm"
import { ExpenseForm } from "@/components/pos/ExpenseForm"

export default function SettlementPage() {
  const { activeBranchId } = useAuth()
  const branchIdNum = activeBranchId ? Number(activeBranchId) : undefined;
  
  const { data: expected, isLoading } = useExpectedCash(branchIdNum);

  return (
    <AnimatedPage className="max-w-[1200px] w-full mx-auto space-y-6">
      <PageHeader
        title="End of Day Settlement"
        description="Reconcile all payment channels and submit to HQ."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettlementForm branchIdNum={branchIdNum} expected={expected} />
        <ExpenseForm branchIdNum={branchIdNum} />
      </div>
    </AnimatedPage>
  )
}
